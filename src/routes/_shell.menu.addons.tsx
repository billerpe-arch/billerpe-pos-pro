import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/menu/addons")({
  head: () => ({
    meta: [
      { title: "Addons · BillerPe" },
      { name: "description", content: "Addons in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Addons · BillerPe" },
      { property: "og:description", content: "Addons in BillerPe V2 restaurant POS." },
    ],
  }),
  component: MenuAddonsPage,
});

function MenuAddonsPage() {
  return (
    <Page>
      <PageHeader title="Addons" />
    </Page>
  );
}
