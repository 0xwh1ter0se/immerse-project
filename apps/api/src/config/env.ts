import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/immerse"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8080),
  APP_ENV: z.enum(["development", "test", "production"]).default("production"),
  GOOGLE_CLIENT_ID: z.string().default("dummy-google-client-id"),
  GOOGLE_CLIENT_SECRET: z.string().default("dummy-google-client-secret"),
  GOOGLE_REDIRECT_URI: z
    .string()
    .default("https://immerse-project-production.up.railway.app/api/auth/google/callback"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  AUTH_JWT_SECRET: z.string().min(32).default("immerse-default-jwt-secret-min-32-chars-long!"),
  WEB_ORIGIN: z
    .string()
    .default("https://immerse-project-qb4e-7jrujx6h5-deza-amru-rifais-projects.vercel.app"),
  MIDTRANS_SERVER_KEY: z.string().default(""),
  MIDTRANS_CLIENT_KEY: z.string().default(""),
  MIDTRANS_IS_PRODUCTION: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const env = envSchema.parse(process.env);
