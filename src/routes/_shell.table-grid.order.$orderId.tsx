import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BadgePercent,
  ChefHat,
  Minus,
  Pause,
  Plus,
  Printer,
  Receipt,
  Save,
  Search,
  Star,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, Money, StatusBadge } from "@/components/kit";
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
import { RESTAURANT, addonGroups } from "@/mock/data";
import { lineTotal, orderTotals, useStore } from "@/mock/store";
import type { MenuItem, PaymentSplit } from "@/mock/types";

export const Route = createFileRoute("/_shell/table-grid/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order & Cart · BillerPe" },
      {
        name: "description",
        content: "Take orders, punch KOT rounds, apply discounts and settle bills with split payments.",
      },
      { property: "og:title", content: "Order & Cart · BillerPe" },
      {
        property: "og:description",
        content: "Menu punching, KOT rounds, discounts and split settlement.",
      },
    ],
  }),
  component: OrderCartPage,
});

function OrderCartPage() {
  const { orderId } = Route.useParams();
  const store = useStore();
  const navigate = useNavigate();
  const order = store.orderById(orderId);

  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [configItem, setConfigItem] = useState<MenuItem | null>(null);
  const [variant, setVariant] = useState<string>("");
  const [addons, setAddons] = useState<{ name: string; price: number }[]>([]);
  const [note, setNote] = useState("");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [settleOpen, setSettleOpen] = useState(false);
  const [splits, setSplits] = useState<PaymentSplit[]>([]);

  const totals = orderTotals(order);

  const items = useMemo(
    () =>
      store.menuItems.filter(
        (i) =>
          i.active &&
          (categoryId === "all" ||
            (categoryId === "fav" ? i.favourite : i.categoryId === categoryId)) &&
          i.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [store.menuItems, categoryId, query],
  );

  if (!order) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Receipt}
          title="Order not found"
          description="This order may have been settled or cancelled."
          action={<Button onClick={() => navigate({ to: "/table-grid" })}>Back to tables</Button>}
        />
      </div>
    );
  }

  const pendingRound = order.lines.some((l) => l.kotRound > order.kotRounds);
  const settled = order.status === "Settled" || order.status === "Cancelled";

  const addToCart = (item: MenuItem) => {
    if (item.variants?.length || item.addonGroupIds?.length) {
      setConfigItem(item);
      setVariant(item.variants?.[0]?.name ?? "");
      setAddons([]);
      setNote("");
      return;
    }
    store.addLine(order.id, { itemId: item.id, qty: 1 });
  };

  const paid = splits.reduce((s, p) => s + p.amount, 0);
  const due = Math.round((totals.grand - paid) * 100) / 100;

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-1">
      {/* menu side */}
      <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/table-grid" })}>
            <ArrowLeft className="size-4" /> Tables
          </Button>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu items…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 scrollbar-slim">
          {[
            { id: "all", name: "All" },
            { id: "fav", name: "★ Favourites" },
            ...store.menuCategories.filter((c) => c.active),
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                categoryId === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-muted text-muted-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-slim">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.97 }}
                disabled={settled}
                onClick={() => addToCart(item)}
                className="flex flex-col justify-between rounded-xl border border-border bg-surface p-3 text-left shadow-card transition-colors hover:border-primary/40 disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-[3px] border",
                      item.veg ? "border-success" : "border-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        item.veg ? "bg-success" : "bg-primary",
                      )}
                    />
                  </span>
                  {item.favourite ? <Star className="size-3.5 fill-warning text-warning" /> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium">{item.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Money value={item.price} className="text-sm font-semibold" />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {item.station}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* cart side */}
      <aside className="flex min-h-0 flex-col bg-surface">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {order.tableLabel} · #{order.orderNo}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.type} · {order.guests} guests · KOT rounds {order.kotRounds}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <button
            onClick={() => setCustomerOpen(true)}
            className="mt-2 flex w-full items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-left text-xs"
          >
            <User className="size-3.5 text-muted-foreground" />
            {order.customerName ? (
              <span>
                {order.customerName} · <span className="num">{order.customerPhone}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Attach customer (optional)</span>
            )}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-slim">
          {order.lines.length === 0 ? (
            <EmptyState
              compact
              icon={Receipt}
              title="Cart is empty"
              description="Tap menu items on the left to punch them into this order."
            />
          ) : (
            <ul className="space-y-2">
              {order.lines.map((l) => (
                <li key={l.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.variant ? `${l.variant} · ` : ""}
                        <span className="num">₹{l.price}</span>
                        {l.originTable ? ` · from ${l.originTable}` : ""}
                      </p>
                      {l.addons?.length ? (
                        <p className="text-[11px] text-muted-foreground">
                          + {l.addons.map((a) => a.name).join(", ")}
                        </p>
                      ) : null}
                      {l.note ? (
                        <p className="mt-1 text-[11px] italic text-warning">“{l.note}”</p>
                      ) : null}
                      <span className="mt-1 inline-block rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {l.kotRound > order.kotRounds ? "New — not sent" : `KOT ${l.kotRound}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Money value={lineTotal(l)} className="text-sm font-semibold" />
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          disabled={settled}
                          onClick={() => store.changeQty(order.id, l.id, -1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="num w-6 text-center text-sm font-semibold">{l.qty}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          disabled={settled}
                          onClick={() => store.changeQty(order.id, l.id, 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-primary"
                          disabled={settled}
                          onClick={() => store.removeLine(order.id, l.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-4">
          <dl className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={totals.subtotal} />
            {totals.discount ? (
              <Row label={`Discount (${order.discount?.label})`} value={-totals.discount} />
            ) : null}
            <Row label={`CGST ${RESTAURANT.cgst}%`} value={totals.cgst} />
            <Row label={`SGST ${RESTAURANT.sgst}%`} value={totals.sgst} />
            {totals.charges ? <Row label="Charges" value={totals.charges} /> : null}
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>
                <Money value={totals.grand} />
              </dd>
            </div>
          </dl>

          {order.discount?.approvalFlagged ? (
            <p className="mt-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
              Discount above threshold — manager approval recorded in audit log.
            </p>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={settled}
              onClick={() => store.holdOrder(order.id)}
            >
              <Pause className="size-4" /> Hold
            </Button>
            <Button variant="outline" disabled={settled} onClick={() => store.saveOrder(order.id)}>
              <Save className="size-4" /> Save
            </Button>
            <Button
              variant="outline"
              disabled={settled}
              onClick={() => setDiscountOpen(true)}
            >
              <BadgePercent className="size-4" /> Discount
            </Button>
            <Button
              variant="outline"
              disabled={settled}
              onClick={() => store.generateKot(order.id)}
              className={cn(pendingRound && "border-primary text-primary")}
            >
              <ChefHat className="size-4" /> Send KOT
            </Button>
            <Button
              variant="secondary"
              className="col-span-2"
              disabled={settled || !order.lines.length}
              onClick={() => {
                store.generateBill(order.id);
              }}
            >
              <Printer className="size-4" /> Generate Bill
            </Button>
            <Button
              className="col-span-2"
              disabled={settled || !order.lines.length}
              onClick={() => {
                setSplits([{ mode: "Cash", amount: totals.grand }]);
                setSettleOpen(true);
              }}
            >
              <Wallet className="size-4" /> Settle · <Money value={totals.grand} />
            </Button>
          </div>
        </div>
      </aside>

      {/* item config */}
      <Dialog open={!!configItem} onOpenChange={(o) => !o && setConfigItem(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{configItem?.name}</DialogTitle>
            <DialogDescription>Choose variant, addons and kitchen instructions.</DialogDescription>
          </DialogHeader>

          {configItem?.variants?.length ? (
            <div>
              <Label>Variant</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {configItem.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v.name)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm",
                      variant === v.name ? "border-primary bg-primary-soft" : "border-border",
                    )}
                  >
                    {v.name} · <span className="num">₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {configItem?.addonGroupIds?.map((gid) => {
            const group = addonGroups.find((g) => g.id === gid);
            if (!group) return null;
            return (
              <div key={gid}>
                <Label>
                  {group.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({group.selection}, max {group.max})
                  </span>
                </Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {group.options.map((o) => {
                    const on = addons.some((a) => a.name === o.name);
                    return (
                      <button
                        key={o.id}
                        onClick={() =>
                          setAddons((prev) =>
                            on
                              ? prev.filter((a) => a.name !== o.name)
                              : group.selection === "Single"
                                ? [
                                    ...prev.filter(
                                      (a) => !group.options.some((x) => x.name === a.name),
                                    ),
                                    { name: o.name, price: o.price },
                                  ]
                                : [...prev, { name: o.name, price: o.price }],
                          )
                        }
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm",
                          on ? "border-primary bg-primary-soft" : "border-border",
                        )}
                      >
                        {o.name}
                        {o.price ? <span className="num"> +₹{o.price}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div>
            <Label htmlFor="note">Kitchen note</Label>
            <Input
              id="note"
              className="mt-1.5"
              placeholder="e.g. less spicy, no onion"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                if (!configItem) return;
                store.addLine(order.id, {
                  itemId: configItem.id,
                  qty: 1,
                  variant: variant || undefined,
                  addons: addons.length ? addons : undefined,
                  note: note || undefined,
                });
                setConfigItem(null);
              }}
            >
              <Plus className="size-4" /> Add to order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* discount */}
      <Dialog open={discountOpen} onOpenChange={setDiscountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply discount</DialogTitle>
            <DialogDescription>
              Discounts above 20% require manager approval and are audit-logged.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            {(["percent", "flat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDiscountType(t)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                  discountType === t ? "border-primary bg-primary-soft" : "border-border",
                )}
              >
                {t === "percent" ? "Percentage" : "Flat amount"}
              </button>
            ))}
          </div>
          <Input
            type="number"
            className="num"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                store.applyDiscount(order.id, "None", 0);
                setDiscountOpen(false);
              }}
            >
              Remove discount
            </Button>
            <Button
              onClick={() => {
                const amount =
                  discountType === "percent"
                    ? Math.round(totals.subtotal * (discountValue / 100))
                    : discountValue;
                store.applyDiscount(
                  order.id,
                  discountType === "percent" ? `${discountValue}%` : `Flat ₹${discountValue}`,
                  amount,
                );
                setDiscountOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* customer */}
      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach customer</DialogTitle>
            <DialogDescription>Used for bill delivery and repeat-visit reports.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cname">Name</Label>
              <Input
                id="cname"
                className="mt-1.5"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cphone">Mobile</Label>
              <Input
                id="cphone"
                className="num mt-1.5"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {store.customers.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCustName(c.name);
                    setCustPhone(c.phone);
                  }}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                store.setCustomer(order.id, custName, custPhone);
                setCustomerOpen(false);
              }}
            >
              Save customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* settle */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settle bill · {order.tableLabel}</DialogTitle>
            <DialogDescription>
              Single or split payment. Amounts must add up to the bill total.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-surface-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span>Bill total</span>
              <Money value={totals.grand} className="font-semibold" />
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span>Balance</span>
              <Money value={due} className={cn("font-semibold", due !== 0 && "text-primary")} />
            </div>
          </div>

          <div className="space-y-2">
            {splits.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={p.mode}
                  onChange={(e) =>
                    setSplits((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, mode: e.target.value as PaymentSplit["mode"] } : x,
                      ),
                    )
                  }
                  className="h-10 rounded-lg border border-input bg-surface px-2 text-sm"
                >
                  {(["Cash", "Card", "UPI", "Due"] as const).map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  className="num"
                  value={p.amount}
                  onChange={(e) =>
                    setSplits((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, amount: Number(e.target.value) || 0 } : x,
                      ),
                    )
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSplits((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSplits((prev) => [...prev, { mode: "UPI", amount: Math.max(0, due) }])}
            >
              <Plus className="size-4" /> Add payment mode
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                if (Math.abs(due) > 0.5) {
                  toast.error("Split does not match bill total", {
                    description: `Balance of ₹${due.toLocaleString("en-IN")} remaining.`,
                  });
                  return;
                }
                store.settleOrder(order.id, splits);
                setSettleOpen(false);
                navigate({ to: "/table-grid" });
              }}
            >
              <Wallet className="size-4" /> Confirm settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>
        <Money value={value} />
      </dd>
    </div>
  );
}
