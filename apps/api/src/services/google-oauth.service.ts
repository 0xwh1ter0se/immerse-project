import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { env } from "../config/env.js";
import { redis } from "../lib/redis.js";

const GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration";
const AUTH_TRANSACTION_TTL_SECONDS = 10 * 60;

const discoverySchema = z.object({
  authorization_endpoint: z.string().url(),
  token_endpoint: z.string().url(),
  jwks_uri: z.string().url(),
  issuer: z.string().url(),
});

const tokenResponseSchema = z.object({
  id_token: z.string(),
});

interface AuthTransaction {
  nonce: string;
  codeVerifier: string;
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

function base64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function transactionKey(state: string): string {
  return `immerse:google-oauth:${createHash("sha256").update(state).digest("hex")}`;
}

async function loadDiscovery(): Promise<z.infer<typeof discoverySchema>> {
  const response = await fetch(GOOGLE_DISCOVERY_URL);
  if (!response.ok) {
    throw new Error("GOOGLE_DISCOVERY_FAILED");
  }

  return discoverySchema.parse(await response.json());
}

export async function createGoogleAuthorizationUrl(): Promise<string> {
  const discovery = await loadDiscovery();
  const state = base64Url(randomBytes(32));
  const nonce = base64Url(randomBytes(32));
  const codeVerifier = base64Url(randomBytes(64));
  const codeChallenge = base64Url(createHash("sha256").update(codeVerifier).digest());

  await redis.set(
    transactionKey(state),
    JSON.stringify({ nonce, codeVerifier } satisfies AuthTransaction),
    "EX",
    AUTH_TRANSACTION_TTL_SECONDS,
  );

  const url = new URL(discovery.authorization_endpoint);
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCallback(code: string, state: string): Promise<GoogleIdentity> {
  const transactionJson = await redis.getdel(transactionKey(state));
  if (!transactionJson) {
    throw new Error("INVALID_CALLBACK");
  }

  const transaction = z
    .object({
      nonce: z.string().min(1),
      codeVerifier: z.string().min(1),
    })
    .parse(JSON.parse(transactionJson));

  const discovery = await loadDiscovery();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    code_verifier: transaction.codeVerifier,
  });

  const tokenResponse = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!tokenResponse.ok) {
    throw new Error("INVALID_CALLBACK");
  }

  const tokens = tokenResponseSchema.parse(await tokenResponse.json());
  const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  const { payload } = await jwtVerify(tokens.id_token, jwks, {
    issuer: discovery.issuer,
    audience: env.GOOGLE_CLIENT_ID,
  });

  if (payload.nonce !== transaction.nonce) {
    throw new Error("INVALID_CALLBACK");
  }
  if (payload.email_verified !== true) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("INVALID_CALLBACK");
  }
  if (!payload.email.toLowerCase().endsWith("@gmail.com")) {
    throw new Error("EMAIL_NOT_GMAIL");
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name:
      typeof payload.name === "string" && payload.name.length > 0 ? payload.name : payload.email,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}
