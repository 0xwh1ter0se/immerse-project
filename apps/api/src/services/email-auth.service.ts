import { hash, compare } from "bcryptjs";
import {
  getCountries,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import type { AuthMeResponse, EmailLoginInput, EmailRegisterInput } from "@immerse/shared";
import { prisma } from "../lib/prisma.js";

export class EmailAuthConflictError extends Error {
  constructor() {
    super("EMAIL_CONFLICT");
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
  }
}

export function validatePhoneForCountry(countryCode: string, phoneNumber: string): boolean {
  const supportedCountries = getCountries();
  if (!supportedCountries.includes(countryCode as CountryCode)) {
    return false;
  }

  if (!isValidPhoneNumber(phoneNumber, countryCode as CountryCode)) {
    return false;
  }

  const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode as CountryCode);
  return parsedNumber?.country === countryCode;
}

export async function registerEmailUser(input: EmailRegisterInput): Promise<AuthMeResponse> {
  if (!validatePhoneForCountry(input.phoneCountryCode, input.phoneNumber)) {
    throw new InvalidCredentialsError();
  }

  const passwordHash = await hash(input.password, 12);
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new EmailAuthConflictError();
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        phoneCountryCode: input.phoneCountryCode,
        phoneNumber: input.phoneNumber,
        provider: "EMAIL",
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
      throw new EmailAuthConflictError();
    }
    throw error;
  }
}

export async function loginEmailUser(input: EmailLoginInput): Promise<AuthMeResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || user.provider !== "EMAIL" || !user.passwordHash) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
  };
}
