import { createFileRoute } from "@tanstack/react-router";
import { LayoutList, Plus } from "lucide-react";
import { useState } from "react";

import { DataTable, Page, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
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
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/mock/store";
import type { MenuCategory } from "@/mock/types";

export const Route = createFileRoute("/_shell/menu/categories")({
  head: () => ({
    meta: [
      { title: "Menu Categories · BillerPe" },
      { name: "description", content: "Create and organise the menu categories shown on the biller screen." },
      { property: "og:title", content: "Menu Categories · BillerPe" },
      { property: "og:description", content: "Organise menu categories for the BillerPe biller screen." },
    ],
  }),
  component: MenuCategoriesPage,
});

const blank: MenuCategory = { id: "", name: "", active: true };

function MenuCategoriesPage() {
  const store = useStore();
  const [draft, setDraft] = useState<MenuCategory | null>(null);

  return (
    <Page>
      <PageHeader
        icon={LayoutList}
        title="Menu Categories"
        description="Categories drive the biller item grid, KOT routing and category-wise reports."
        actions={
          <Button onClick={() => setDraft({ ...blank })}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />

      <SectionCard title={`${store.menuCategories.length} categories`} bodyClassName="p-0 sm:p-0">
        <div className="p-2 sm:p-3">
          <DataTable
            rows={store.menuCategories}
            keyFn={(c) => c.id}
            onRowClick={(c) => setDraft({ ...c })}
            columns={[
              { key: "name", header: "Category", cell: (c) => <span className="font-medium">{c.name}</span> },
              {
                key: "items",
                header: "Items",
                cell: (c) => (
                  <span className="num">
                    {store.menuItems.filter((i) => i.categoryId === c.id).length}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (c) => <StatusBadge status={c.active ? "Active" : "Inactive"} />,
              },
            ]}
            mobileCard={(c) => (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {store.menuItems.filter((i) => i.categoryId === c.id).length} items
                  </p>
                </div>
                <StatusBadge status={c.active ? "Active" : "Inactive"} />
              </div>
            )}
          />
        </div>
      </SectionCard>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Category name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Gujarati Thali"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Inactive categories are hidden from billing.</p>
                </div>
                <Switch
                  checked={draft.active}
                  onCheckedChange={(v) => setDraft({ ...draft, active: v })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={!draft?.name.trim()}
              onClick={() => {
                if (!draft) return;
                store.upsertMenuCategory(draft);
                setDraft(null);
              }}
            >
              Save category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
