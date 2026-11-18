import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { MidtransNotificationSchema } from "@immerse/shared";
import { env } from "../config/env.js";

export function verifyMidtransSignature(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const notification = MidtransNotificationSchema.safeParse(request.body);
  if (!notification.success) {
    response.status(400).json({ error: "INVALID_MIDTRANS_NOTIFICATION" });
    return;
  }
  if (!env.MIDTRANS_SERVER_KEY) {
    response.status(503).json({ error: "PAYMENT_PROVIDER_NOT_CONFIGURED" });
    return;
  }

  const { order_id, status_code, gross_amount, signature_key } = notification.data;
  const expected = createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${env.MIDTRANS_SERVER_KEY}`)
    .digest();
  const provided = Buffer.from(signature_key, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    response.status(401).json({ error: "INVALID_MIDTRANS_SIGNATURE" });
    return;
  }

  next();
}
