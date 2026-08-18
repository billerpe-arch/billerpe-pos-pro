import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/support/help")({
  head: () => ({
    meta: [
      { title: "Help & Support · BillerPe" },
      { name: "description", content: "Help & Support in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Help & Support · BillerPe" },
      { property: "og:description", content: "Help & Support in BillerPe V2 restaurant POS." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <Page>
      <PageHeader title="Help & Support" />
    </Page>
  );
}
