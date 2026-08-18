import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations · BillerPe" },
      { name: "description", content: "Reservations in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Reservations · BillerPe" },
      { property: "og:description", content: "Reservations in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ReservationsPage,
});

function ReservationsPage() {
  return (
    <Page>
      <PageHeader title="Reservations" />
    </Page>
  );
}
