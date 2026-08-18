import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Detail · BillerPe" },
      { name: "description", content: "Order Detail in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Order Detail · BillerPe" },
      { property: "og:description", content: "Order Detail in BillerPe V2 restaurant POS." },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  return (
    <Page>
      <PageHeader title="Order Detail" />
    </Page>
  );
}
