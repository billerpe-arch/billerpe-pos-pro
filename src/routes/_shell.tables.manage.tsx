import { createFileRoute } from "@tanstack/react-router";
import { Grid2x2, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/mock/store";
import type { RestaurantTable } from "@/mock/types";

export const Route = createFileRoute("/_shell/tables/manage")({
  head: () => ({
    meta: [
      { title: "Manage Tables · BillerPe" },
      { name: "description", content: "Add, rename and re-seat every table across the floor sections." },
      { property: "og:title", content: "Manage Tables · BillerPe" },
      { property: "og:description", content: "Add, rename and re-seat BillerPe restaurant tables." },
    ],
  }),
  component: ManageTablesPage,
});

function ManageTablesPage() {
  const store = useStore();
  const [draft, setDraft] = useState<RestaurantTable | null>(null);
  const [cat, setCat] = useState("all");

  const rows = store.tables.filter((t) => cat === "all" || t.categoryId === cat);
  const catName = (id: string) => store.tableCategories.find((c) => c.id === id)?.name ?? "—";

  return (
    <Page>
      <PageHeader
        icon={Grid2x2}
        title="Manage Tables"
        description="Tables occupied by a running order cannot be deleted."
        actions={
          <Button
            onClick={() =>
              setDraft({
                id: "",
                name: "",
                categoryId: store.tableCategories[0]?.id ?? "",
                seats: 4,
                status: "Free",
              })
            }
          >
            <Plus className="size-4" /> New table
          </Button>
        }
      />

      <SectionCard bodyClassName="p-3 sm:p-4">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            {store.tableCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-3">
          <DataTable
            rows={rows}
            keyFn={(t) => t.id}
            onRowClick={(t) => setDraft({ ...t })}
            columns={[
              { key: "name", header: "Table", cell: (t) => <span className="font-medium">{t.name}</span> },
              { key: "cat", header: "Section", cell: (t) => catName(t.categoryId) },
              { key: "seats", header: "Seats", cell: (t) => <span className="num">{t.seats}</span> },
              { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
            ]}
            mobileCard={(t) => (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {catName(t.categoryId)} · <span className="num">{t.seats}</span> seats
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            )}
          />
        </div>
      </SectionCard>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit table" : "New table"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Table name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. OutDoor T5"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Section</Label>
                  <Select
                    value={draft.categoryId}
                    onValueChange={(v) => setDraft({ ...draft, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {store.tableCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Seats</Label>
                  <Input
                    type="number"
                    value={draft.seats}
                    onChange={(e) => setDraft({ ...draft, seats: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-between">
            {draft?.id ? (
              <Button
                variant="ghost"
                className="text-primary"
                disabled={draft.status !== "Free"}
                onClick={() => {
                  store.removeTable(draft.id);
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
                  store.upsertTable(draft);
                  setDraft(null);
                }}
              >
                Save table
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
