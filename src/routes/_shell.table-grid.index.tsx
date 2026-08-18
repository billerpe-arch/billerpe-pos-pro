import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeftRight,
  Grid2X2,
  LayoutGrid,
  Merge,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Page, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { elapsedFrom } from "@/mock/format";
import { orderTotals, useStore } from "@/mock/store";
import type { RestaurantTable, TableStatus } from "@/mock/types";

export const Route = createFileRoute("/_shell/table-grid/")({
  head: () => ({
    meta: [
      { title: "Table Grid · BillerPe" },
      {
        name: "description",
        content:
          "Live floor view of every table with status, guests, running totals, merge and transfer actions.",
      },
      { property: "og:title", content: "Table Grid · BillerPe" },
      {
        property: "og:description",
        content: "Live restaurant floor view with table status, merge and transfer.",
      },
    ],
  }),
  component: TableGridPage,
});

const statusStyles: Record<TableStatus, string> = {
  Free: "border-border bg-surface hover:border-primary/40",
  Held: "border-transparent bg-status-held text-status-held-foreground",
  Running: "border-transparent bg-status-running text-status-running-foreground",
  "Bill Generated": "border-transparent bg-status-billed text-status-billed-foreground",
  Reserved: "border-transparent bg-status-reserved text-status-reserved-foreground",
};

function TableGridPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TableStatus>("all");
  const [openTable, setOpenTable] = useState<RestaurantTable | null>(null);
  const [guests, setGuests] = useState(2);
  const [mergeFrom, setMergeFrom] = useState<RestaurantTable | null>(null);
  const [transferFrom, setTransferFrom] = useState<RestaurantTable | null>(null);

  const filtered = useMemo(
    () =>
      store.tables.filter(
        (t) =>
          (categoryId === "all" || t.categoryId === categoryId) &&
          (statusFilter === "all" || t.status === statusFilter),
      ),
    [store.tables, categoryId, statusFilter],
  );

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      Free: 0,
      Held: 0,
      Running: 0,
      "Bill Generated": 0,
      Reserved: 0,
    };
    store.tables.forEach((t) => (base[t.status] = (base[t.status] ?? 0) + 1));
    return base;
  }, [store.tables]);

  const freeTables = store.tables.filter((t) => t.status === "Free");

  const openBiller = (orderId: string) => {
    if (store.displayMode === "Keyboard") {
      navigate({ to: "/keyboard-billing/$orderId", params: { orderId } });
      return;
    }
    navigate({ to: "/table-grid/order/$orderId", params: { orderId } });
  };

  const openOrder = (table: RestaurantTable) => {
    if (store.transactionsBlocked) {
      toast.error("Transactions blocked", {
        description: "Reconnect to the local server or resolve the offline limit first.",
      });
      return;
    }
    if (table.orderId) {
      openBiller(table.orderId);
      return;
    }
    setOpenTable(table);
    setGuests(Math.min(table.seats, 2));
  };

  return (
    <Page>
      <PageHeader
        icon={LayoutGrid}
        title="Table Grid"
        description="Tap a free table to start an order, or an occupied table to continue it."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                const id = store.startTakeAway();
                openBiller(id);
              }}
            >
              <ShoppingBag className="size-4" /> New Pickup
            </Button>
            <Button onClick={() => navigate({ to: "/orders" })}>
              <Grid2X2 className="size-4" /> All Orders
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "Free", "Held", "Running", "Bill Generated", "Reserved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-primary/40",
            )}
          >
            {s === "all" ? `All (${store.tables.length})` : `${s} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryId("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            categoryId === "all" ? "bg-surface-muted" : "text-muted-foreground",
          )}
        >
          All sections
        </button>
        {store.tableCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              categoryId === c.id ? "bg-surface-muted" : "text-muted-foreground",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((t) => {
          const order = t.orderId ? store.orderById(t.orderId) : undefined;
          const totals = orderTotals(order);
          return (
            <motion.button
              key={t.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openOrder(t)}
              className={cn(
                "flex min-h-32 flex-col justify-between rounded-2xl border p-3 text-left shadow-card transition-colors",
                statusStyles[t.status],
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-base font-semibold">{t.name}</span>
                <span className="flex items-center gap-1 text-xs opacity-80">
                  <Users className="size-3.5" />
                  <span className="num">{t.guests ?? t.seats}</span>
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium opacity-90">{t.status}</p>
                {order ? (
                  <p className="num text-sm font-semibold">₹{totals.grand.toLocaleString("en-IN")}</p>
                ) : null}
                {t.occupiedSince ? (
                  <p className="text-[11px] opacity-75">{elapsedFrom(t.occupiedSince)}</p>
                ) : null}
                {order?.mergedFrom?.length ? (
                  <p className="text-[11px] opacity-75">Merged · {order.mergedFrom.join(", ")}</p>
                ) : null}
              </div>
              {t.status !== "Free" ? (
                <div className="mt-2 flex gap-1">
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMergeFrom(t);
                    }}
                    className="rounded-md bg-black/10 px-1.5 py-1 text-[11px] font-medium"
                  >
                    Merge
                  </span>
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTransferFrom(t);
                    }}
                    className="rounded-md bg-black/10 px-1.5 py-1 text-[11px] font-medium"
                  >
                    Transfer
                  </span>
                </div>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      <SectionCard title="Legend" className="mt-6">
        <div className="flex flex-wrap gap-2">
          {(["Free", "Held", "Running", "Bill Generated", "Reserved"] as TableStatus[]).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </SectionCard>

      <Dialog open={!!openTable} onOpenChange={(o) => !o && setOpenTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start order on {openTable?.name}</DialogTitle>
            <DialogDescription>
              Capacity {openTable?.seats} guests. Guest count is used for reports and covers.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="guests">Number of guests</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              className="num mt-1.5"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value) || 1)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTable(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!openTable) return;
                const id = store.startOrder(openTable.id, guests);
                setOpenTable(null);
                openBiller(id);
              }}
            >
              <Plus className="size-4" /> Start order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!mergeFrom} onOpenChange={(o) => !o && setMergeFrom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge {mergeFrom?.name} into…</DialogTitle>
            <DialogDescription>
              Items keep their origin table tag on the KOT and bill.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {store.tables
              .filter((t) => t.id !== mergeFrom?.id && t.status === "Running")
              .map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  onClick={() => {
                    if (!mergeFrom) return;
                    store.mergeTables(mergeFrom.id, t.id);
                    setMergeFrom(null);
                  }}
                >
                  <Merge className="size-4" /> {t.name}
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!transferFrom} onOpenChange={(o) => !o && setTransferFrom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer {transferFrom?.name} to…</DialogTitle>
            <DialogDescription>Only free tables can receive a transfer.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {freeTables.map((t) => (
              <Button
                key={t.id}
                variant="outline"
                onClick={() => {
                  if (!transferFrom?.orderId) return;
                  store.transferTable(transferFrom.orderId, t.id);
                  setTransferFrom(null);
                }}
              >
                <ArrowLeftRight className="size-4" /> {t.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
