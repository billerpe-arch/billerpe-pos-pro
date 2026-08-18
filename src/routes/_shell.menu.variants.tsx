import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { useMemo } from "react";

import { DataTable, Money, Page, PageHeader, SectionCard } from "@/components/kit";
import { variantMasters } from "@/mock/data";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/_shell/menu/variants")({
  head: () => ({
    meta: [
      { title: "Variants · BillerPe" },
      { name: "description", content: "Portion and size variants shared across menu items." },
      { property: "og:title", content: "Variants · BillerPe" },
      { property: "og:description", content: "Portion and size variants used by BillerPe menu items." },
    ],
  }),
  component: MenuVariantsPage,
});

function MenuVariantsPage() {
  const store = useStore();

  const usage = useMemo(
    () =>
      variantMasters.map((v) => ({
        ...v,
        items: store.menuItems.filter((i) => (i.variants ?? []).some((x) => x.name === v.name)),
      })),
    [store.menuItems],
  );

  return (
    <Page>
      <PageHeader
        icon={Layers}
        title="Variants"
        description="Variants change the base price of an item at the point of billing."
      />

      <SectionCard title="Variant master" bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={usage}
          keyFn={(v) => v.id}
          columns={[
            { key: "name", header: "Variant", cell: (v) => <span className="font-medium">{v.name}</span> },
            { key: "price", header: "Default price", cell: (v) => <Money value={v.price} /> },
            { key: "count", header: "Used by", cell: (v) => `${v.items.length} items` },
          ]}
        />
      </SectionCard>

      <SectionCard title="Items with variants" bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={store.menuItems.filter((i) => i.variants?.length)}
          keyFn={(i) => i.id}
          columns={[
            { key: "item", header: "Item", cell: (i) => <span className="font-medium">{i.name}</span> },
            {
              key: "variants",
              header: "Variants",
              cell: (i) => (
                <div className="flex flex-wrap gap-1.5">
                  {(i.variants ?? []).map((v) => (
                    <span
                      key={v.id}
                      className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium"
                    >
                      {v.name} · <span className="num">₹{v.price}</span>
                    </span>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </SectionCard>
    </Page>
  );
}
