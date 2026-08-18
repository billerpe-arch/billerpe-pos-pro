import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/kds")({
  head: () => ({
    meta: [
      { title: "Kitchen Display · BillerPe" },
      { name: "description", content: "Kitchen Display in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Kitchen Display · BillerPe" },
      { property: "og:description", content: "Kitchen Display in BillerPe V2 restaurant POS." },
    ],
  }),
  component: KdsPage,
});

function KdsPage() {
  return (
    <Page>
      <PageHeader title="Kitchen Display" />
    </Page>
  );
}
