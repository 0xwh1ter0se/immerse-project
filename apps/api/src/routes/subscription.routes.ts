import { Router } from "express";
import {
  AuthMeResponseSchema,
  CreateSubscriptionInputSchema,
  CreateSubscriptionResponseSchema,
} from "@immerse/shared";
import { requireAuth } from "../middleware/require-auth.js";
import {
  ActiveSubscriptionExistsError,
  createSubscriptionCheckout,
  FreePlanCheckoutError,
  PaymentProviderNotConfiguredError,
  PaymentProviderRequestError,
  PlanNotAvailableError,
} from "../services/payment.service.js";

export const subscriptionRouter = Router();

subscriptionRouter.post("/", requireAuth, async (request, response) => {
  const input = CreateSubscriptionInputSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({ error: "INVALID_SUBSCRIPTION_INPUT" });
    return;
  }

  const user = AuthMeResponseSchema.safeParse(response.locals.user);
  if (!user.success) {
    response.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }

  try {
    const checkout = await createSubscriptionCheckout(
      user.data.id,
      input.data.planSlug,
      input.data.paymentMethod,
    );
    response.status(201).json(CreateSubscriptionResponseSchema.parse(checkout));
  } catch (error: unknown) {
    if (error instanceof PlanNotAvailableError) {
      response.status(404).json({ error: "PLAN_NOT_AVAILABLE" });
      return;
    }
    if (error instanceof FreePlanCheckoutError) {
      response.status(400).json({ error: "FREE_PLAN_CHECKOUT_NOT_SUPPORTED" });
      return;
    }
    if (error instanceof ActiveSubscriptionExistsError) {
      response.status(409).json({ error: "ACTIVE_SUBSCRIPTION_EXISTS" });
      return;
    }
    if (error instanceof PaymentProviderNotConfiguredError) {
      response.status(503).json({ error: "PAYMENT_PROVIDER_NOT_CONFIGURED" });
      return;
    }
    if (error instanceof PaymentProviderRequestError) {
      console.error("Midtrans checkout request failed:", error.cause);
      response.status(502).json({ error: "PAYMENT_PROVIDER_REQUEST_FAILED" });
      return;
    }

    console.error("Subscription checkout failed:", error);
    response.status(500).json({ error: "SUBSCRIPTION_CHECKOUT_FAILED" });
  }
});
