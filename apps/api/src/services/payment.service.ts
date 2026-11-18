import { randomUUID } from "node:crypto";
import midtransClient from "midtrans-client";
import {
  calculatePaymentAmounts,
  type MidtransNotification,
  type PaymentMethod,
} from "@immerse/shared";
import { SubStatus, TxStatus, type TxStatus as TxStatusType } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

export class PlanNotAvailableError extends Error {
  constructor() {
    super("PLAN_NOT_AVAILABLE");
    this.name = "PlanNotAvailableError";
  }
}

export class FreePlanCheckoutError extends Error {
  constructor() {
    super("FREE_PLAN_CHECKOUT_NOT_SUPPORTED");
    this.name = "FreePlanCheckoutError";
  }
}

export class ActiveSubscriptionExistsError extends Error {
  constructor() {
    super("ACTIVE_SUBSCRIPTION_EXISTS");
    this.name = "ActiveSubscriptionExistsError";
  }
}

export class PaymentProviderNotConfiguredError extends Error {
  constructor() {
    super("PAYMENT_PROVIDER_NOT_CONFIGURED");
    this.name = "PaymentProviderNotConfiguredError";
  }
}

export class PaymentProviderRequestError extends Error {
  constructor(cause: unknown) {
    super("PAYMENT_PROVIDER_REQUEST_FAILED", { cause });
    this.name = "PaymentProviderRequestError";
  }
}

export class PaymentTransactionNotFoundError extends Error {
  constructor() {
    super("PAYMENT_TRANSACTION_NOT_FOUND");
    this.name = "PaymentTransactionNotFoundError";
  }
}

export class PaymentAmountMismatchError extends Error {
  constructor() {
    super("PAYMENT_AMOUNT_MISMATCH");
    this.name = "PaymentAmountMismatchError";
  }
}

export async function createSubscriptionCheckout(
  userId: string,
  planSlug: string,
  paymentMethod: PaymentMethod,
) {
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan || !plan.isActive) {
    throw new PlanNotAvailableError();
  }
  if (plan.priceIdr <= 0) {
    throw new FreePlanCheckoutError();
  }
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubStatus.ACTIVE,
      currentPeriodEnd: { gt: new Date() },
    },
  });
  if (activeSubscription) {
    throw new ActiveSubscriptionExistsError();
  }
  if (!env.MIDTRANS_SERVER_KEY || !env.MIDTRANS_CLIENT_KEY) {
    throw new PaymentProviderNotConfiguredError();
  }

  const amounts = calculatePaymentAmounts(plan.priceIdr);
  const orderId = `IMR-${randomUUID()}`;
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      planSlug: plan.slug,
      ...amounts,
      paymentMethod,
      gatewayOrderId: orderId,
    },
  });

  const snap = new midtransClient.Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
  });

  const enabledPayments: Array<"qris" | "bank_transfer"> = [paymentMethod];
  const parameters = {
    transaction_details: {
      order_id: orderId,
      gross_amount: transaction.totalIdr,
    },
    enabled_payments: enabledPayments,
  } satisfies Parameters<typeof snap.createTransaction>[0] & {
    enabled_payments: Array<"qris" | "bank_transfer">;
  };

  try {
    const checkout = await snap.createTransaction(parameters);
    return {
      transactionId: transaction.id,
      orderId,
      snapToken: checkout.token,
      redirectUrl: checkout.redirect_url,
      ...amounts,
    };
  } catch (error: unknown) {
    throw new PaymentProviderRequestError(error);
  }
}

type NotificationAction = {
  status: TxStatusType;
  revokeAccess: boolean;
};

function getNotificationAction(notification: MidtransNotification): NotificationAction | null {
  switch (notification.transaction_status) {
    case "settlement":
      return { status: TxStatus.PAID, revokeAccess: false };
    case "capture":
      return notification.fraud_status === "accept"
        ? { status: TxStatus.PAID, revokeAccess: false }
        : { status: TxStatus.PENDING, revokeAccess: false };
    case "pending":
    case "authorize":
      return { status: TxStatus.PENDING, revokeAccess: false };
    case "cancel":
      return { status: TxStatus.FAILED, revokeAccess: false };
    case "expire":
      return { status: TxStatus.EXPIRED, revokeAccess: false };
    case "refund":
      return { status: TxStatus.REFUNDED, revokeAccess: true };
    case "partial_refund":
      return { status: TxStatus.REFUNDED, revokeAccess: false };
    case "deny":
      return null;
  }
}

function addOneCalendarMonth(date: Date): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);
  const lastDayOfMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDayOfMonth));
  return result;
}

export async function processMidtransNotification(
  notification: MidtransNotification,
): Promise<void> {
  await prisma.$transaction(async (database) => {
    const transaction = await database.transaction.findUnique({
      where: { gatewayOrderId: notification.order_id },
    });
    if (!transaction) {
      throw new PaymentTransactionNotFoundError();
    }

    if (Number(notification.gross_amount) !== transaction.totalIdr) {
      throw new PaymentAmountMismatchError();
    }

    const action = getNotificationAction(notification);
    if (!action) {
      return;
    }
    if (transaction.status === TxStatus.REFUNDED && action.status !== TxStatus.REFUNDED) {
      return;
    }
    if (transaction.status === TxStatus.PAID && action.status !== TxStatus.REFUNDED) {
      return;
    }
    if (transaction.status === action.status && !action.revokeAccess) {
      return;
    }

    const now = new Date();
    await database.transaction.update({
      where: { id: transaction.id },
      data: {
        status: action.status,
        ...(action.status === TxStatus.PAID ? { paidAt: transaction.paidAt ?? now } : {}),
      },
    });

    if (action.status === TxStatus.PAID && transaction.status !== TxStatus.PAID) {
      const plan = await database.plan.findUnique({ where: { slug: transaction.planSlug } });
      if (!plan) {
        throw new PlanNotAvailableError();
      }

      await database.subscription.upsert({
        where: { userId: transaction.userId },
        create: {
          userId: transaction.userId,
          planId: plan.id,
          status: SubStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: addOneCalendarMonth(now),
        },
        update: {
          planId: plan.id,
          status: SubStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: addOneCalendarMonth(now),
        },
      });

      await database.creditLedger.upsert({
        where: { userId: transaction.userId },
        create: {
          userId: transaction.userId,
          balance: plan.dailyCredits,
          dailyLimit: plan.dailyCredits,
          lastResetAt: now,
        },
        update: {
          balance: plan.dailyCredits,
          dailyLimit: plan.dailyCredits,
          lastResetAt: now,
        },
      });
    }

    if (action.revokeAccess) {
      const plan = await database.plan.findUnique({ where: { slug: transaction.planSlug } });
      if (plan) {
        await database.subscription.updateMany({
          where: {
            userId: transaction.userId,
            planId: plan.id,
            status: SubStatus.ACTIVE,
          },
          data: { status: SubStatus.CANCELLED, currentPeriodEnd: now },
        });
        await database.creditLedger.updateMany({
          where: { userId: transaction.userId },
          data: { balance: 0, dailyLimit: 0, lastResetAt: now },
        });
      }
    }
  });
}
