import { z } from "zod";

export const PAYMENT_PLANS = [
  {
    slug: "basic",
    name: "Basic",
    priceIdr: 0,
    dailyCredits: 10,
    billingPeriod: "forever",
  },
  {
    slug: "pro",
    name: "Pro",
    priceIdr: 89_000,
    dailyCredits: 100,
    billingPeriod: "calendar-month",
  },
  {
    slug: "max",
    name: "Max",
    priceIdr: 149_000,
    dailyCredits: 9_999,
    billingPeriod: "calendar-month",
  },
] as const;

export type PaymentPlanDefinition = (typeof PAYMENT_PLANS)[number];

export const PPN_RATE_PERCENT = 11;

export function calculatePaymentAmounts(amountIdr: number) {
  if (!Number.isSafeInteger(amountIdr) || amountIdr < 0) {
    throw new RangeError("Payment amount must be a non-negative integer");
  }

  const taxIdr = Math.round((amountIdr * PPN_RATE_PERCENT) / 100);
  return {
    amountIdr,
    taxIdr,
    totalIdr: amountIdr + taxIdr,
  };
}

export const PaymentMethodSchema = z.enum(["qris", "bank_transfer"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const CreateSubscriptionInputSchema = z.object({
  planSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  paymentMethod: PaymentMethodSchema,
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionInputSchema>;

export const CreateSubscriptionResponseSchema = z.object({
  transactionId: z.string().min(1),
  orderId: z.string().min(1),
  snapToken: z.string().min(1),
  redirectUrl: z.string().url(),
  amountIdr: z.number().int().nonnegative(),
  taxIdr: z.number().int().nonnegative(),
  totalIdr: z.number().int().nonnegative(),
});

export type CreateSubscriptionResponse = z.infer<typeof CreateSubscriptionResponseSchema>;

export const MidtransNotificationSchema = z.object({
  order_id: z.string().min(1).max(50),
  status_code: z.string().regex(/^\d{3}$/),
  gross_amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  signature_key: z.string().regex(/^[a-f\d]{128}$/i),
  transaction_status: z.enum([
    "authorize",
    "capture",
    "settlement",
    "pending",
    "deny",
    "cancel",
    "expire",
    "refund",
    "partial_refund",
  ]),
  fraud_status: z.enum(["accept", "challenge", "deny"]).optional(),
});

export type MidtransNotification = z.infer<typeof MidtransNotificationSchema>;
