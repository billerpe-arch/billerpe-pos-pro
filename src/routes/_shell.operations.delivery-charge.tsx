import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { useState } from "react";

import { Money, Page, PageHeader, SectionCard, StatCard } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/_shell/operations/delivery-charge")({
  head: () => ({
    meta: [
      { title: "Delivery & Packaging · BillerPe" },
      { name: "description", content: "Default delivery and packaging charges applied to pickup orders." },
      { property: "og:title", content: "Delivery & Packaging · BillerPe" },
      { property: "og:description", content: "Default delivery and packaging charge configuration." },
    ],
  }),
  component: DeliveryChargePage,
});

function DeliveryChargePage() {
  const store = useStore();
  const [delivery, setDelivery] = useState(String(store.deliveryCharge));
  const [packaging, setPackaging] = useState(String(store.packagingCharge));

  return (
    <Page>
      <PageHeader
        icon={Truck}
        title="Delivery & Packaging Charge"
        description="These defaults pre-fill the charge fields on the order cart; billers can still override per order."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Current delivery charge" value={<Money value={store.deliveryCharge} />} tone="primary" />
        <StatCard label="Current packaging charge" value={<Money value={store.packagingCharge} />} />
      </div>

      <SectionCard title="Defaults" bodyClassName="p-3 sm:p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Delivery charge (₹)</Label>
            <Input type="number" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Packaging charge (₹)</Label>
            <Input type="number" value={packaging} onChange={(e) => setPackaging(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => store.setDeliverySettings(Number(delivery), Number(packaging))}>
            Save defaults
          </Button>
        </div>
      </SectionCard>
    </Page>
  );
}
