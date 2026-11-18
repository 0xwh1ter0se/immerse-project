import { PAYMENT_PLANS } from "@immerse/shared";
import { notFound } from "next/navigation";
import { InvoiceDetail } from "../../../components/payment/InvoiceDetail";

type CheckoutPageProps = {
  searchParams: Promise<{ planSlug?: string | string[] }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const planSlug = typeof params.planSlug === "string" ? params.planSlug : undefined;
  const plan = PAYMENT_PLANS.find(
    (candidate) => candidate.slug === planSlug && candidate.priceIdr > 0,
  );

  if (!plan) {
    notFound();
  }

  return <InvoiceDetail plan={plan} />;
}
