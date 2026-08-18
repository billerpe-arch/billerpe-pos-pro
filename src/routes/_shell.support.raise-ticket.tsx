import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/support/raise-ticket")({
  head: () => ({
    meta: [
      { title: "Raise Ticket · BillerPe" },
      { name: "description", content: "Raise Ticket in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Raise Ticket · BillerPe" },
      { property: "og:description", content: "Raise Ticket in BillerPe V2 restaurant POS." },
    ],
  }),
  component: RaiseTicketPage,
});

function RaiseTicketPage() {
  return (
    <Page>
      <PageHeader title="Raise Ticket" />
    </Page>
  );
}
