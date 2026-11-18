"use client";

import type { PaymentMethod } from "@immerse/shared";
import { useTranslations } from "next-intl";

type PaymentMethodTabsProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

export function PaymentMethodTabs({ value, onChange }: PaymentMethodTabsProps) {
  const t = useTranslations("Payment.checkout");

  return (
    <fieldset className="border-0 p-0">
      <legend className="text-sm font-semibold text-text-primary">{t("paymentMethod")}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label
          className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-md border p-4 transition-[border-color,background-color] duration-fast ease-out ${
            value === "qris"
              ? "border-blue bg-blue-subtle"
              : "border-border bg-bg-elevated hover:border-border-strong"
          }`}
        >
          <input
            type="radio"
            name="payment-method"
            value="qris"
            checked={value === "qris"}
            onChange={() => onChange("qris")}
            className="mt-1 h-4 w-4 accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          />
          <span>
            <span className="block text-sm font-semibold text-text-primary">{t("qris")}</span>
            <span className="mt-1 block text-xs font-medium leading-body text-text-secondary">
              {t("qrisDescription")}
            </span>
          </span>
        </label>

        <label
          className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-md border p-4 transition-[border-color,background-color] duration-fast ease-out ${
            value === "bank_transfer"
              ? "border-blue bg-blue-subtle"
              : "border-border bg-bg-elevated hover:border-border-strong"
          }`}
        >
          <input
            type="radio"
            name="payment-method"
            value="bank_transfer"
            checked={value === "bank_transfer"}
            onChange={() => onChange("bank_transfer")}
            className="mt-1 h-4 w-4 accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          />
          <span>
            <span className="block text-sm font-semibold text-text-primary">
              {t("bankTransfer")}
            </span>
            <span className="mt-1 block text-xs font-medium leading-body text-text-secondary">
              {t("bankTransferDescription")}
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
