import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/menu/categories")({
  head: () => ({
    meta: [
      { title: "Menu Categories · BillerPe" },
      { name: "description", content: "Menu Categories in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Menu Categories · BillerPe" },
      { property: "og:description", content: "Menu Categories in BillerPe V2 restaurant POS." },
    ],
  }),
  component: MenuCategoriesPage,
});

function MenuCategoriesPage() {
  return (
    <Page>
      <PageHeader title="Menu Categories" />
    </Page>
  );
}
