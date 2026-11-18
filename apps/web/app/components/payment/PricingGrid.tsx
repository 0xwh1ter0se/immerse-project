"use client";

import { PAYMENT_PLANS, PPN_RATE_PERCENT } from "@immerse/shared";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "../../../i18n/navigation";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function PricingGrid() {
  const t = useTranslations("Payment.plans");
  const locale = useLocale();
  const formatCurrency = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-pretty leading-body text-text-secondary">{t("description")}</p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PAYMENT_PLANS.map((plan) => {
          const isFree = plan.priceIdr === 0;
          const billingPeriod = plan.billingPeriod === "forever" ? t("forever") : t("perMonth");

          return (
            <Card
              key={plan.slug}
              className={`flex h-full flex-col gap-6 ${
                plan.slug === "pro" ? "border-blue shadow-elevated" : ""
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  {isFree ? t("freePlan") : t("paidPlan")}
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold leading-heading tracking-tight text-text-primary">
                  {plan.name}
                </h2>
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-text-primary tabular-nums">
                    {formatCurrency.format(plan.priceIdr)}
                  </span>
                  <span className="text-sm font-medium text-text-secondary">/ {billingPeriod}</span>
                </p>
              </div>

              <div className="flex-1 border-t border-border pt-5">
                <p className="font-display text-2xl font-bold tracking-tight text-text-primary tabular-nums">
                  {plan.dailyCredits.toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                </p>
                <p className="mt-1 text-sm font-medium leading-body text-text-secondary">
                  {t("dailyCredits")}
                </p>
                {!isFree ? (
                  <p className="mt-4 text-xs font-medium leading-body text-text-muted">
                    {t("taxNotice", { rate: PPN_RATE_PERCENT })}
                  </p>
                ) : null}
              </div>

              {isFree ? (
                <Button type="button" variant="secondary" disabled className="w-full">
                  {t("basicUnavailable")}
                </Button>
              ) : (
                <Link
                  href={`/plans/checkout?planSlug=${plan.slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-pill border border-blue bg-blue px-5 text-sm font-semibold text-text-inverse transition-[transform,opacity,background-color,border-color] duration-fast ease-out hover:bg-blue-hover active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
                >
                  {t("selectPlan")}
                </Link>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
