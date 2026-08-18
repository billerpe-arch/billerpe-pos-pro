import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/stock/")({
  head: () => ({
    meta: [
      { title: "Stock Management · BillerPe" },
      { name: "description", content: "Stock Management in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Stock Management · BillerPe" },
      { property: "og:description", content: "Stock Management in BillerPe V2 restaurant POS." },
    ],
  }),
  component: StockPage,
});

function StockPage() {
  return (
    <Page>
      <PageHeader title="Stock Management" />
    </Page>
  );
}
