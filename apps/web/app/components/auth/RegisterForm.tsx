"use client";

import { type FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EmailRegisterInputSchema } from "@immerse/shared";
import { Link, useRouter } from "../../../i18n/navigation";
import { OAuthButton } from "./OAuthButton";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

const countryOptions = [
  { code: "ID" },
  { code: "MY" },
  { code: "SG" },
  { code: "US" },
  { code: "GB" },
  { code: "AU" },
  { code: "JP" },
  { code: "KR" },
] as const;

export function RegisterForm() {
  const locale = useLocale();
  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  const t = useTranslations("Auth.register");
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const input = EmailRegisterInputSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      phoneCountryCode: form.get("phoneCountryCode"),
      phoneNumber: form.get("phoneNumber"),
      password: form.get("password"),
    });

    if (!input.success) {
      setError(t("validationError"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
      });

      if (!response.ok) {
        const result: unknown = await response.json();
        if (
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          result.error === "EMAIL_CONFLICT"
        ) {
          setError(t("emailConflict"));
          return;
        }
        setError(t("invalidData"));
        return;
      }

      router.push("/");
    } catch {
      setError(t("serviceError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-lg bg-bg-surface p-card shadow-card">
      <h1 className="font-display text-3xl font-extrabold leading-display tracking-tight text-text-primary">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-body text-text-secondary">
        {t("description")}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-text-primary">
          {t("name")}
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg-elevated px-4 text-base text-text-primary outline-none transition-[border-color,opacity] duration-fast focus:border-border-focus"
            type="text"
            name="name"
            autoComplete="name"
            minLength={2}
            required
          />
        </label>

        <label className="block text-sm font-medium text-text-primary">
          {t("email")}
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg-elevated px-4 text-base text-text-primary outline-none transition-[border-color,opacity] duration-fast focus:border-border-focus"
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            required
          />
        </label>

        <div className="grid grid-cols-[8.5rem_1fr] gap-3">
          <label className="block text-sm font-medium text-text-primary">
            {t("country")}
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-base text-text-primary outline-none transition-[border-color,opacity] duration-fast focus:border-border-focus"
              name="phoneCountryCode"
              defaultValue="ID"
              required
            >
              {countryOptions.map((country) => (
                <option key={country.code} value={country.code}>
                  {regionNames.of(country.code) ?? country.code}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-text-primary">
            {t("phone")}
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg-elevated px-4 text-base text-text-primary outline-none transition-[border-color,opacity] duration-fast focus:border-border-focus"
              type="tel"
              name="phoneNumber"
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
              required
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-text-primary">
          {t("password")}
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg-elevated px-4 text-base text-text-primary outline-none transition-[border-color,opacity] duration-fast focus:border-border-focus"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <p className="text-xs leading-tight text-text-muted">{t("passwordHint")}</p>

        {error ? (
          <p
            className="rounded-md border border-error/30 bg-bg-elevated px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 w-full rounded-pill border border-blue bg-blue px-5 text-sm font-semibold text-text-inverse transition-[transform,opacity,filter] duration-fast ease-out disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.96]"
        >
          {isSubmitting ? t("submitting") : t("title")}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-text-muted" aria-label={t("or")}>
        <span className="h-px flex-1 bg-border" />
        <span>{t("or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <OAuthButton />

      <p className="mt-5 text-center text-sm text-text-secondary">
        {t("haveAccount")}{" "}
        <Link
          className="inline-flex min-h-11 items-center font-semibold text-blue underline underline-offset-4"
          href="/login"
        >
          {t("login")}
        </Link>
      </p>
    </section>
  );
}
