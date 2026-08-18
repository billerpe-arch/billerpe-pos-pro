import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Star, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable, EmptyState, Money, Page, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useStore } from "@/mock/store";
import type { MenuItem } from "@/mock/types";

export const Route = createFileRoute("/_shell/menu/items")({
  head: () => ({
    meta: [
      { title: "Menu Items · BillerPe" },
      { name: "description", content: "Manage dishes, prices, stations, variants and availability." },
      { property: "og:title", content: "Menu Items · BillerPe" },
      { property: "og:description", content: "Manage dishes, prices and kitchen stations in BillerPe." },
    ],
  }),
  component: MenuItemsPage,
});

const stations: MenuItem["station"][] = ["Kitchen", "Tandoor", "Chinese", "Beverages", "Dessert"];

function MenuItemsPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [draft, setDraft] = useState<MenuItem | null>(null);

  const rows = useMemo(
    () =>
      store.menuItems
        .filter((i) => cat === "all" || i.categoryId === cat)
        .filter((i) => !q || i.name.toLowerCase().includes(q.toLowerCase())),
    [store.menuItems, cat, q],
  );

  const catName = (id: string) => store.menuCategories.find((c) => c.id === id)?.name ?? "—";

  const newItem = (): MenuItem => ({
    id: "",
    name: "",
    categoryId: store.menuCategories[0]?.id ?? "",
    price: 0,
    favourite: false,
    active: true,
    veg: true,
    station: "Kitchen",
  });

  return (
    <Page>
      <PageHeader
        icon={UtensilsCrossed}
        title="Menu Items"
        description="Price, station routing and availability for every dish on the biller grid."
        actions={
          <Button onClick={() => setDraft(newItem())}>
            <Plus className="size-4" /> New item
          </Button>
        }
      />

      <SectionCard bodyClassName="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search items"
              className="pl-9"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {store.menuCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3">
          <DataTable
            rows={rows}
            keyFn={(i) => i.id}
            onRowClick={(i) => setDraft({ ...i })}
            empty={<EmptyState icon={UtensilsCrossed} title="No items match" compact />}
            columns={[
              {
                key: "name",
                header: "Item",
                cell: (i) => (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-3 shrink-0 rounded-[3px] border-2 p-0.5",
                        i.veg ? "border-success" : "border-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "block size-full rounded-full",
                          i.veg ? "bg-success" : "bg-primary",
                        )}
                      />
                    </span>
                    <span className="font-medium">{i.name}</span>
                    {i.favourite ? <Star className="size-3.5 fill-warning text-warning" /> : null}
                  </div>
                ),
              },
              { key: "cat", header: "Category", cell: (i) => catName(i.categoryId) },
              { key: "station", header: "Station", cell: (i) => i.station },
              {
                key: "variants",
                header: "Variants",
                cell: (i) => (i.variants?.length ? `${i.variants.length}` : "—"),
              },
              { key: "price", header: "Price", cell: (i) => <Money value={i.price} /> },
              {
                key: "status",
                header: "Status",
                cell: (i) => <StatusBadge status={i.active ? "Active" : "Inactive"} />,
              },
            ]}
            mobileCard={(i) => (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {catName(i.categoryId)} · {i.station}
                  </p>
                </div>
                <div className="text-right">
                  <Money value={i.price} className="font-semibold" />
                  <div className="mt-1">
                    <StatusBadge status={i.active ? "Active" : "Inactive"} />
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </SectionCard>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit item" : "New item"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Item name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Paneer Tikka"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={draft.categoryId}
                    onValueChange={(v) => setDraft({ ...draft, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {store.menuCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Kitchen station</Label>
                  <Select
                    value={draft.station}
                    onValueChange={(v) => setDraft({ ...draft, station: v as MenuItem["station"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Base price (₹)</Label>
                <Input
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["Veg", "veg"],
                    ["Favourite", "favourite"],
                    ["Active", "active"],
                  ] as const
                ).map(([label, key]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <Switch
                      checked={draft[key]}
                      onCheckedChange={(v) => setDraft({ ...draft, [key]: v })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-between">
            {draft?.id ? (
              <Button
                variant="ghost"
                className="text-primary"
                onClick={() => {
                  store.removeMenuItem(draft.id);
                  setDraft(null);
                }}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button
                disabled={!draft?.name.trim()}
                onClick={() => {
                  if (!draft) return;
                  store.upsertMenuItem(draft);
                  setDraft(null);
                }}
              >
                Save item
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
