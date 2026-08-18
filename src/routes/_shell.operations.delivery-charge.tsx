import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/operations/delivery-charge")({
  head: () => ({
    meta: [
      { title: "Delivery & Packaging Charge · BillerPe" },
      { name: "description", content: "Delivery & Packaging Charge in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Delivery & Packaging Charge · BillerPe" },
      { property: "og:description", content: "Delivery & Packaging Charge in BillerPe V2 restaurant POS." },
    ],
  }),
  component: DeliveryChargePage,
});

function DeliveryChargePage() {
  return (
    <Page>
      <PageHeader title="Delivery & Packaging Charge" />
    </Page>
  );
}
