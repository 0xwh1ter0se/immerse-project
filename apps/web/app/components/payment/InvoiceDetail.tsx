"use client";

import {
  calculatePaymentAmounts,
  CreateSubscriptionResponseSchema,
  PPN_RATE_PERCENT,
  type PaymentMethod,
  type PaymentPlanDefinition,
} from "@immerse/shared";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "../../../i18n/navigation";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { PaymentMethodTabs } from "./PaymentMethodTabs";

type CheckoutError =
  "loginRequired" | "activeSubscriptionExists" | "paymentUnavailable" | "checkoutError";

type InvoiceDetailProps = {
  plan: PaymentPlanDefinition;
};

export function InvoiceDetail({ plan }: InvoiceDetailProps) {
  const t = useTranslations("Payment.checkout");
  const locale = useLocale();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);
  const amounts = calculatePaymentAmounts(plan.priceIdr);
  const formatCurrency = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  async function handlePayment() {
    setIsSubmitting(true);
    setError(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
      const response = await fetch(`${apiBaseUrl}/api/subscriptions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan.slug, paymentMethod }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("loginRequired");
        } else if (response.status === 409) {
          setError("activeSubscriptionExists");
        } else if (response.status === 503) {
          setError("paymentUnavailable");
        } else {
          setError("checkoutError");
        }
        return;
      }

      const payload: unknown = await response.json();
      const checkout = CreateSubscriptionResponseSchema.safeParse(payload);
      if (!checkout.success) {
        throw new Error("Invalid subscription checkout response");
      }
      if (
        checkout.data.amountIdr !== amounts.amountIdr ||
        checkout.data.taxIdr !== amounts.taxIdr ||
        checkout.data.totalIdr !== amounts.totalIdr
      ) {
        throw new Error("Checkout amount does not match the invoice");
      }

      window.location.assign(checkout.data.redirectUrl);
    } catch (requestError: unknown) {
      console.error("Could not start the subscription checkout:", requestError);
      setError("checkoutError");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 md:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
          <h1 className="mt-2 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary">
            {t("title")}
          </h1>
        </div>
        <Badge tone="warning">{t("statusPending")}</Badge>
      </div>

      <div className="grid items-start gap-5 md:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t("planLabel")}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold leading-heading tracking-tight text-text-primary">
                  {plan.name}
                </h2>
              </div>
              <Badge>{t("oneMonth")}</Badge>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-text-secondary">{t("amount")}</dt>
                <dd className="font-semibold text-text-primary tabular-nums">
                  {formatCurrency.format(amounts.amountIdr)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-text-secondary">
                  {t("tax", { rate: PPN_RATE_PERCENT })}
                </dt>
                <dd className="font-semibold text-text-primary tabular-nums">
                  {formatCurrency.format(amounts.taxIdr)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <dt className="font-semibold text-text-primary">{t("total")}</dt>
                <dd className="font-display text-xl font-bold tracking-tight text-text-primary tabular-nums">
                  {formatCurrency.format(amounts.totalIdr)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <PaymentMethodTabs value={paymentMethod} onChange={setPaymentMethod} />
          </Card>

          {error ? (
            <div
              className="rounded-md border border-error/30 bg-bg-surface p-4 text-sm font-medium leading-body text-error"
              role="alert"
            >
              <p>{t(error)}</p>
              {error === "loginRequired" ? (
                <Link
                  href="/login"
                  className="mt-2 inline-flex min-h-11 items-center font-semibold text-blue underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  {t("login")}
                </Link>
              ) : null}
            </div>
          ) : null}

          <Link
            href="/plans"
            className="inline-flex min-h-11 items-center font-semibold text-text-secondary underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {t("backToPlans")}
          </Link>
        </div>

        <Card className="text-center">
          <Image
            src="/assets/Mersi/front.webp"
            alt={t("mersiAlt")}
            width={180}
            height={180}
            loading="lazy"
            className="mx-auto mb-4 w-32 object-contain drop-shadow-[0_6px_12px_oklch(0_0_0_/_0.12)]"
          />
          <h2 className="font-display text-xl font-bold leading-heading tracking-tight text-text-primary">
            {t("mersiTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-sm font-medium leading-body text-text-secondary">
            {t("mersiDescription")}
          </p>
          <Button
            type="button"
            onClick={handlePayment}
            disabled={isSubmitting}
            className="mt-5 w-full"
          >
            {isSubmitting ? t("processing") : t("pay")}
          </Button>
        </Card>
      </div>
    </main>
  );
}
