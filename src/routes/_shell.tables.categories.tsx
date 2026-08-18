import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/tables/categories")({
  head: () => ({
    meta: [
      { title: "Table Categories · BillerPe" },
      { name: "description", content: "Table Categories in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Table Categories · BillerPe" },
      { property: "og:description", content: "Table Categories in BillerPe V2 restaurant POS." },
    ],
  }),
  component: TableCategoriesPage,
});

function TableCategoriesPage() {
  return (
    <Page>
      <PageHeader title="Table Categories" />
    </Page>
  );
}
