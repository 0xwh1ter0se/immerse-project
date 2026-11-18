import type { AuthMeResponse } from "@immerse/shared";
import { prisma } from "../lib/prisma.js";
import type { GoogleIdentity } from "./google-oauth.service.js";

export class EmailConflictError extends Error {
  constructor() {
    super("EMAIL_CONFLICT");
  }
}

export async function upsertGoogleUser(identity: GoogleIdentity): Promise<AuthMeResponse> {
  if (!identity.email.endsWith("@gmail.com")) {
    throw new Error("EMAIL_NOT_GMAIL");
  }

  const existingEmailUser = await prisma.user.findUnique({
    where: { email: identity.email },
  });

  if (
    existingEmailUser &&
    (existingEmailUser.provider !== "GOOGLE" || existingEmailUser.providerId !== identity.sub)
  ) {
    throw new EmailConflictError();
  }

  try {
    const user = await prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: "GOOGLE",
          providerId: identity.sub,
        },
      },
      create: {
        email: identity.email,
        name: identity.name,
        avatarUrl: identity.picture ?? null,
        provider: "GOOGLE",
        providerId: identity.sub,
      },
      update: {
        name: identity.name,
        avatarUrl: identity.picture ?? null,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      locale: user.locale,
    };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      throw new EmailConflictError();
    }
    throw error;
  }
}
