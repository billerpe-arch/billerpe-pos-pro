import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/orders/")({
  head: () => ({
    meta: [
      { title: "Orders · BillerPe" },
      { name: "description", content: "Orders in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Orders · BillerPe" },
      { property: "og:description", content: "Orders in BillerPe V2 restaurant POS." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <Page>
      <PageHeader title="Orders" />
    </Page>
  );
}
