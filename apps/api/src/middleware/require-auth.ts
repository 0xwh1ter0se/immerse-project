import type { NextFunction, Request, Response } from "express";
import { AuthMeResponseSchema } from "@immerse/shared";
import { prisma } from "../lib/prisma.js";
import { getAuthCookieName, verifyAuthToken } from "../services/auth-token.service.js";

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    response.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }

  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim().split("=", 2))
      .filter((entry): entry is [string, string] => entry.length === 2),
  );
  const token = cookies[getAuthCookieName()];
  if (!token) {
    response.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }

  const claims = await verifyAuthToken(token);
  if (!claims) {
    response.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: claims.sub } });
  if (!user) {
    response.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }

  response.locals.user = AuthMeResponseSchema.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
  });
  next();
}
