import { Router } from "express";
import {
  GoogleCallbackQuerySchema,
  AuthMeResponseSchema,
  EmailRegisterInputSchema,
  EmailLoginInputSchema,
} from "@immerse/shared";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
  createAuthCookie,
  createAuthToken,
  createExpiredAuthCookie,
} from "../services/auth-token.service.js";
import { EmailConflictError, upsertGoogleUser } from "../services/auth.service.js";
import {
  createGoogleAuthorizationUrl,
  exchangeGoogleCallback,
} from "../services/google-oauth.service.js";
import {
  EmailAuthConflictError,
  InvalidCredentialsError,
  loginEmailUser,
  registerEmailUser,
  validatePhoneForCountry,
} from "../services/email-auth.service.js";

export const authRouter = Router();

authRouter.get("/google/start", async (_request, response) => {
  try {
    const authorizationUrl = await createGoogleAuthorizationUrl();
    response.redirect(302, authorizationUrl);
  } catch {
    response.status(502).json({ error: "INVALID_CALLBACK" });
  }
});

authRouter.get("/google/callback", async (request, response) => {
  const callback = GoogleCallbackQuerySchema.safeParse(request.query);
  if (!callback.success) {
    response.status(400).json({ error: "INVALID_CALLBACK" });
    return;
  }

  try {
    const identity = await exchangeGoogleCallback(callback.data.code, callback.data.state);
    const user = await upsertGoogleUser(identity);
    const token = await createAuthToken(user);
    AuthMeResponseSchema.parse(user);
    response.setHeader("Set-Cookie", createAuthCookie(token));
    response.redirect(302, env.WEB_ORIGIN);
  } catch (error: unknown) {
    if (error instanceof EmailConflictError) {
      response.status(409).json({ error: "EMAIL_CONFLICT" });
      return;
    }
    if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
      response.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
      return;
    }
    if (error instanceof Error && error.message === "EMAIL_NOT_GMAIL") {
      response.status(403).json({ error: "EMAIL_NOT_GMAIL" });
      return;
    }
    response.status(400).json({ error: "INVALID_CALLBACK" });
  }
});

authRouter.get("/me", requireAuth, (_request, response) => {
  response.status(200).json(AuthMeResponseSchema.parse(response.locals.user));
});

authRouter.post("/logout", (_request, response) => {
  response.setHeader("Set-Cookie", createExpiredAuthCookie());
  response.status(204).end();
});

authRouter.post("/register", async (request, response) => {
  const input = EmailRegisterInputSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({ error: "INVALID_REGISTER_INPUT" });
    return;
  }

  if (!validatePhoneForCountry(input.data.phoneCountryCode, input.data.phoneNumber)) {
    response.status(400).json({ error: "INVALID_PHONE_NUMBER" });
    return;
  }

  try {
    const user = await registerEmailUser(input.data);
    const token = await createAuthToken(user);
    response.setHeader("Set-Cookie", createAuthCookie(token));
    response.status(201).json(AuthMeResponseSchema.parse(user));
  } catch (error: unknown) {
    if (error instanceof EmailAuthConflictError) {
      response.status(409).json({ error: "EMAIL_CONFLICT" });
      return;
    }
    response.status(400).json({ error: "INVALID_REGISTER_INPUT" });
  }
});

authRouter.post("/login", async (request, response) => {
  const input = EmailLoginInputSchema.safeParse(request.body);
  if (!input.success) {
    response.status(401).json({ error: "INVALID_CREDENTIALS" });
    return;
  }

  try {
    const user = await loginEmailUser(input.data);
    const token = await createAuthToken(user);
    response.setHeader("Set-Cookie", createAuthCookie(token));
    response.status(200).json(AuthMeResponseSchema.parse(user));
  } catch (error: unknown) {
    if (error instanceof InvalidCredentialsError) {
      response.status(401).json({ error: "INVALID_CREDENTIALS" });
      return;
    }
    response.status(500).json({ error: "INVALID_CREDENTIALS" });
  }
});
