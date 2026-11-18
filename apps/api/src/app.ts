import express from "express";
import { HealthResponseSchema } from "@immerse/shared";
import { authRouter } from "./routes/auth.routes.js";
import { subscriptionRouter } from "./routes/subscription.routes.js";
import { paymentWebhookRouter } from "./routes/payment-webhook.routes.js";
import { env } from "./config/env.js";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.use((request, response, next) => {
  const origin = request.headers.origin;
  const isMutation = request.method !== "GET" && request.method !== "OPTIONS";
  const isMidtransWebhook = request.method === "POST" && request.path === "/api/webhooks/midtrans";

  if (isMutation && !origin && !isMidtransWebhook) {
    response.status(403).json({ error: "FORBIDDEN_ORIGIN" });
    return;
  }

  if (origin) {
    const isAllowed =
      origin === env.WEB_ORIGIN ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1");

    if (!isAllowed) {
      response.status(403).json({ error: "FORBIDDEN_ORIGIN" });
      return;
    }
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.status(204).end();
    return;
  }

  next();
});

app.get("/health", (_request, response) => {
  const healthResponse = HealthResponseSchema.parse({ status: "ok" });
  response.status(200).json(healthResponse);
});

app.use("/api/auth", authRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/webhooks/midtrans", paymentWebhookRouter);
