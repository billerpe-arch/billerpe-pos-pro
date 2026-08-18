import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/cash-session")({
  head: () => ({
    meta: [
      { title: "Opening & Closing · BillerPe" },
      { name: "description", content: "Opening & Closing in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Opening & Closing · BillerPe" },
      { property: "og:description", content: "Opening & Closing in BillerPe V2 restaurant POS." },
    ],
  }),
  component: CashSessionPage,
});

function CashSessionPage() {
  return (
    <Page>
      <PageHeader title="Opening & Closing" />
    </Page>
  );
}
