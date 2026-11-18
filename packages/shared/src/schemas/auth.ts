import { z } from "zod";

export const GoogleCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export type GoogleCallbackQuery = z.infer<typeof GoogleCallbackQuerySchema>;

export const AuthMeResponseSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().nullable(),
  locale: z.string().min(1),
});

export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;

export const AuthErrorResponseSchema = z.object({
  error: z.enum([
    "AUTH_REQUIRED",
    "INVALID_CALLBACK",
    "EMAIL_NOT_VERIFIED",
    "EMAIL_CONFLICT",
    "FORBIDDEN_ORIGIN",
    "INVALID_REGISTER_INPUT",
    "INVALID_PHONE_NUMBER",
    "INVALID_CREDENTIALS",
    "EMAIL_NOT_GMAIL",
  ]),
});

export type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>;

export const StrongPasswordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/^[A-Z]/, "Password harus diawali huruf kapital")
  .regex(/[a-z]/, "Password harus memiliki huruf kecil")
  .regex(/[0-9]/, "Password harus memiliki angka")
  .regex(/[^A-Za-z0-9]/, "Password harus memiliki simbol")
  .refine(
    (password) => new TextEncoder().encode(password).byteLength <= 72,
    "Password terlalu panjang",
  );

export const EmailRegisterInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .refine((email) => email.endsWith("@gmail.com"), "Gunakan alamat Gmail dengan @gmail.com"),
  phoneCountryCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(2)
    .regex(/^[A-Z]{2}$/, "Kode negara harus dua huruf"),
  phoneNumber: z.string().trim().min(7).max(24),
  password: StrongPasswordSchema,
});

export type EmailRegisterInput = z.infer<typeof EmailRegisterInputSchema>;

export const EmailLoginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .refine((email) => email.endsWith("@gmail.com"), "Gunakan alamat Gmail dengan @gmail.com"),
  password: z.string().min(1),
});

export type EmailLoginInput = z.infer<typeof EmailLoginInputSchema>;
