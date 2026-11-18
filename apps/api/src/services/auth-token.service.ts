import { SignJWT, jwtVerify } from "jose";
import type { AuthMeResponse } from "@immerse/shared";
import { env } from "../config/env.js";

const AUTH_JWT_ISSUER = "immerse-api";
const AUTH_JWT_AUDIENCE = "immerse-web";
const AUTH_COOKIE_NAME = "immerse_session";
const AUTH_TOKEN_TTL_SECONDS = 15 * 60;

export interface AuthTokenClaims {
  sub: string;
  email: string;
  name: string;
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}

export async function createAuthToken(user: AuthMeResponse): Promise<string> {
  const secret = new TextEncoder().encode(env.AUTH_JWT_SECRET);

  return new SignJWT({
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(AUTH_JWT_ISSUER)
    .setAudience(AUTH_JWT_AUDIENCE)
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenClaims | null> {
  try {
    const secret = new TextEncoder().encode(env.AUTH_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: AUTH_JWT_ISSUER,
      audience: AUTH_JWT_AUDIENCE,
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export function createAuthCookie(token: string): string {
  const secure = env.APP_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_TOKEN_TTL_SECONDS}${secure}`;
}

export function createExpiredAuthCookie(): string {
  const secure = env.APP_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
