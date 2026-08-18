import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/table-grid")({
  head: () => ({
    meta: [
      { title: "Table Grid · BillerPe" },
      { name: "description", content: "Table Grid in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Table Grid · BillerPe" },
      { property: "og:description", content: "Table Grid in BillerPe V2 restaurant POS." },
    ],
  }),
  component: TableGridPage,
});

function TableGridPage() {
  return (
    <Page>
      <PageHeader title="Table Grid" />
    </Page>
  );
}
