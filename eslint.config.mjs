import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const nextConfig = [...nextCoreWebVitals, ...nextTypescript].map((config) => ({
  ...config,
  files: ["apps/web/**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
}));

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "apps/api/src/generated/prisma/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...nextConfig,
];
