import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8080),
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  AUTH_JWT_SECRET: z.string().min(32),
  WEB_ORIGIN: z.string().url(),
  MIDTRANS_SERVER_KEY: z.string().default(""),
  MIDTRANS_CLIENT_KEY: z.string().default(""),
  MIDTRANS_IS_PRODUCTION: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const env = envSchema.parse(process.env);
