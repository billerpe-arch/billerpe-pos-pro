import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/menu/variants")({
  head: () => ({
    meta: [
      { title: "Variants · BillerPe" },
      { name: "description", content: "Variants in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Variants · BillerPe" },
      { property: "og:description", content: "Variants in BillerPe V2 restaurant POS." },
    ],
  }),
  component: MenuVariantsPage,
});

function MenuVariantsPage() {
  return (
    <Page>
      <PageHeader title="Variants" />
    </Page>
  );
}
