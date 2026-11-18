import type { routing } from "./i18n/routing";
import type idMessages from "./messages/id.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof idMessages;
  }
}
