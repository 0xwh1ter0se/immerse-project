"use client";

import { useTranslations } from "next-intl";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

export function OAuthButton() {
  const t = useTranslations("Auth.oauth");

  return (
    <a
      href={`${apiBaseUrl}/api/auth/google/start`}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-pill border border-border bg-bg-elevated px-5 text-sm font-semibold text-text-primary transition-[transform,opacity,filter] duration-fast ease-out active:scale-[0.96]"
    >
      {t("continueWithGoogle")}
    </a>
  );
}
