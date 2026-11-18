import { Router } from "express";
import { MidtransNotificationSchema } from "@immerse/shared";
import { verifyMidtransSignature } from "../middleware/midtrans-signature.js";
import {
  PaymentAmountMismatchError,
  PaymentTransactionNotFoundError,
  PlanNotAvailableError,
  processMidtransNotification,
} from "../services/payment.service.js";

export const paymentWebhookRouter = Router();

paymentWebhookRouter.post("/", verifyMidtransSignature, async (request, response) => {
  const notification = MidtransNotificationSchema.parse(request.body);
  try {
    await processMidtransNotification(notification);
    response.status(200).json({ received: true });
  } catch (error: unknown) {
    if (error instanceof PaymentTransactionNotFoundError) {
      response.status(404).json({ error: "PAYMENT_TRANSACTION_NOT_FOUND" });
      return;
    }
    if (error instanceof PaymentAmountMismatchError) {
      response.status(400).json({ error: "PAYMENT_AMOUNT_MISMATCH" });
      return;
    }
    if (error instanceof PlanNotAvailableError) {
      console.error("Paid transaction references a missing plan:", notification.order_id);
      response.status(500).json({ error: "PAYMENT_PLAN_NOT_AVAILABLE" });
      return;
    }
    console.error("Midtrans notification processing failed:", error);
    response.status(500).json({ error: "PAYMENT_NOTIFICATION_FAILED" });
  }
});
