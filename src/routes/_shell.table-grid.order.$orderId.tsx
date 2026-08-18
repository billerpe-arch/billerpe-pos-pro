import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/table-grid/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order & Cart · BillerPe" },
      { name: "description", content: "Order & Cart in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Order & Cart · BillerPe" },
      { property: "og:description", content: "Order & Cart in BillerPe V2 restaurant POS." },
    ],
  }),
  component: OrderCartPage,
});

function OrderCartPage() {
  return (
    <Page>
      <PageHeader title="Order & Cart" />
    </Page>
  );
}
