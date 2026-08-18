import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/stock/$section")({
  head: () => ({
    meta: [
      { title: "Stock · BillerPe" },
      { name: "description", content: "Stock in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Stock · BillerPe" },
      { property: "og:description", content: "Stock in BillerPe V2 restaurant POS." },
    ],
  }),
  component: StockSectionPage,
});

function StockSectionPage() {
  return (
    <Page>
      <PageHeader title="Stock" />
    </Page>
  );
}
