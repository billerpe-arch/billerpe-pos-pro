import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/menu/items")({
  head: () => ({
    meta: [
      { title: "Menu Items · BillerPe" },
      { name: "description", content: "Menu Items in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Menu Items · BillerPe" },
      { property: "og:description", content: "Menu Items in BillerPe V2 restaurant POS." },
    ],
  }),
  component: MenuItemsPage,
});

function MenuItemsPage() {
  return (
    <Page>
      <PageHeader title="Menu Items" />
    </Page>
  );
}
