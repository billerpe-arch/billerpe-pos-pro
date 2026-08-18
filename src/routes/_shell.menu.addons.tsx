import { createFileRoute } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";

import { Money, Page, PageHeader, SectionCard } from "@/components/kit";
import { addonGroups } from "@/mock/data";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/_shell/menu/addons")({
  head: () => ({
    meta: [
      { title: "Addons · BillerPe" },
      { name: "description", content: "Addon groups, selection rules and the items that use them." },
      { property: "og:title", content: "Addons · BillerPe" },
      { property: "og:description", content: "Addon groups and selection rules in BillerPe." },
    ],
  }),
  component: MenuAddonsPage,
});

function MenuAddonsPage() {
  const store = useStore();

  return (
    <Page>
      <PageHeader
        icon={PlusCircle}
        title="Addons"
        description="Addon groups attach to items and add their price on top of the line total."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {addonGroups.map((g) => {
          const items = store.menuItems.filter((i) => (i.addonGroupIds ?? []).includes(g.id));
          return (
            <SectionCard
              key={g.id}
              title={g.name}
              description={`${g.selection} select · min ${g.min}, max ${g.max}`}
              bodyClassName="p-3 sm:p-4"
            >
              <ul className="divide-y divide-border">
                {g.options.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{o.name}</span>
                    <Money value={o.price} className="font-medium" />
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                {items.length ? (
                  items.map((i) => (
                    <span
                      key={i.id}
                      className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium"
                    >
                      {i.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Not attached to any item yet.</span>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </Page>
  );
}
