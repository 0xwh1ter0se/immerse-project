"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { EmailLoginInputSchema } from "@immerse/shared";
import { Link, useRouter } from "../../../i18n/navigation";
import { OAuthButton } from "./OAuthButton";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

export function LoginForm() {
  const t = useTranslations("Auth.login");
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const input = EmailLoginInputSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });

    if (!input.success) {
      setError(t("validationError"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
      });

      if (!response.ok) {
        setError(t("invalidCredentials"));
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

        <label className="block text-sm font-medium text-text-primary">
          {t("password")}
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg-elevated px-4 text-base text-text-primary outline-none transition-[border-color,opacity] duration-fast focus:border-border-focus"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>

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
        {t("noAccount")}{" "}
        <Link
          className="inline-flex min-h-11 items-center font-semibold text-blue underline underline-offset-4"
          href="/register"
        >
          {t("register")}
        </Link>
      </p>
    </section>
  );
}
