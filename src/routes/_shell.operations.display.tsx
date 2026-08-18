import { createFileRoute } from "@tanstack/react-router";
import { Monitor } from "lucide-react";
import { useState } from "react";

import { Page, PageHeader, SectionCard } from "@/components/kit";
import { Switch } from "@/components/ui/switch";
import { RESTAURANT } from "@/mock/data";

export const Route = createFileRoute("/_shell/operations/display")({
  head: () => ({
    meta: [
      { title: "Display Settings · BillerPe" },
      { name: "description", content: "Control what the biller grid and table cards show during service." },
      { property: "og:title", content: "Display Settings · BillerPe" },
      { property: "og:description", content: "Biller grid and table card display preferences." },
    ],
  }),
  component: DisplaySettingsPage,
});

const options = [
  { key: "guests", label: "Show guest count on table cards", desc: "Displays covers under the table name." },
  { key: "timer", label: "Show occupied timer", desc: "Elapsed time since the table went running." },
  { key: "amount", label: "Show running amount", desc: "Live bill value on each occupied table card." },
  { key: "veg", label: "Show veg / non-veg markers", desc: "Green and red markers on menu items." },
  { key: "images", label: "Show item images", desc: "Turn off for a denser, faster item grid." },
  { key: "favourites", label: "Favourites first", desc: "Pin favourite items to the top of every category." },
];

function DisplaySettingsPage() {
  const [state, setState] = useState<Record<string, boolean>>({
    guests: true,
    timer: true,
    amount: true,
    veg: true,
    images: false,
    favourites: true,
  });

  return (
    <Page>
      <PageHeader
        icon={Monitor}
        title="Display Settings"
        description={`Applies to every POS terminal registered to ${RESTAURANT.name}.`}
      />

      <SectionCard title="Biller & table grid" bodyClassName="p-3 sm:p-4">
        <ul className="divide-y divide-border">
          {options.map((o) => (
            <li key={o.key} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">{o.label}</p>
                <p className="text-xs text-muted-foreground">{o.desc}</p>
              </div>
              <Switch
                checked={!!state[o.key]}
                onCheckedChange={(v) => setState((p) => ({ ...p, [o.key]: v }))}
              />
            </li>
          ))}
        </ul>
      </SectionCard>
    </Page>
  );
}
