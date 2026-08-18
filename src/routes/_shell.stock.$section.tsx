import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { ArrowLeft, Boxes, PackageCheck, Plus, Trash } from "lucide-react";
import { useMemo, useState } from "react";

import {
  DataTable,
  EmptyState,
  Money,
  Page,
  PageHeader,
  PendingDecision,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/kit";
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
import { todayLabel } from "@/mock/format";
import { STOCK_SECTIONS } from "@/mock/stock-sections";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/_shell/stock/$section")({
  head: () => ({
    meta: [
      { title: "Stock Module · BillerPe" },
      { name: "description", content: "Raw materials, suppliers, purchases, recipes, wastage and valuation." },
      { property: "og:title", content: "Stock Module · BillerPe" },
      { property: "og:description", content: "Inventory module detail in the BillerPe restaurant POS." },
    ],
  }),
  component: StockSectionPage,
});

function StockSectionPage() {
  const { section } = useParams({ from: "/_shell/stock/$section" });
  const meta = STOCK_SECTIONS.find((s) => s.slug === section);
  const store = useStore();

  const materialName = (id: string) => store.rawMaterials.find((m) => m.id === id)?.name ?? "—";
  const materialUnit = (id: string) => store.rawMaterials.find((m) => m.id === id)?.unit ?? "";

  if (!meta) {
    return (
      <Page>
        <EmptyState
          icon={Boxes}
          title="Unknown stock module"
          description="This module does not exist in the prototype."
          action={
            <Button asChild variant="outline">
              <Link to="/stock">Back to Stock</Link>
            </Button>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        icon={Boxes}
        title={meta.name}
        description={meta.desc}
        actions={
          <Button asChild variant="outline">
            <Link to="/stock">
              <ArrowLeft className="size-4" /> All modules
            </Link>
          </Button>
        }
      />

      {meta.pending ? (
        <PendingDecision
          title={`${meta.name} is not specified yet`}
          note="The BillerPe V2 scope marks this module as an open decision. No business rule has been confirmed, so the prototype deliberately shows no invented workflow."
        />
      ) : null}

      {section === "raw-materials" ? <RawMaterials /> : null}
      {section === "suppliers" ? <Suppliers /> : null}
      {section === "purchases" ? <Purchases /> : null}
      {section === "recipes" ? <Recipes /> : null}
      {section === "semi-finished" ? <SemiFinishedList /> : null}
      {section === "wastage" ? <WastageList /> : null}
      {section === "closing-stock" ? <ClosingStock /> : null}
      {section === "low-stock" ? <LowStock /> : null}
    </Page>
  );

  function RawMaterials() {
    return (
      <SectionCard title={`${store.rawMaterials.length} materials`} bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={store.rawMaterials}
          keyFn={(m) => m.id}
          columns={[
            { key: "name", header: "Material", cell: (m) => <span className="font-medium">{m.name}</span> },
            { key: "cat", header: "Category", cell: (m) => m.category },
            {
              key: "stock",
              header: "In stock",
              cell: (m) => (
                <span className="num">
                  {m.stock} {m.unit}
                </span>
              ),
            },
            {
              key: "reorder",
              header: "Reorder",
              cell: (m) => (
                <span className="num">
                  {m.reorderLevel} {m.unit}
                </span>
              ),
            },
            { key: "rate", header: "Rate", cell: (m) => <Money value={m.rate} /> },
            { key: "value", header: "Value", cell: (m) => <Money value={Math.round(m.stock * m.rate)} /> },
            {
              key: "status",
              header: "Status",
              cell: (m) => (
                <StatusBadge status={m.stock <= m.reorderLevel ? "Conflict" : "Active"} />
              ),
            },
          ]}
          mobileCard={(m) => (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground num">
                  {m.stock} {m.unit} · ₹{m.rate}/{m.unit}
                </p>
              </div>
              <Money value={Math.round(m.stock * m.rate)} className="font-semibold" />
            </div>
          )}
        />
      </SectionCard>
    );
  }

  function Suppliers() {
    return (
      <SectionCard title="Supplier master" bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={store.suppliers}
          keyFn={(s) => s.id}
          columns={[
            { key: "name", header: "Supplier", cell: (s) => <span className="font-medium">{s.name}</span> },
            { key: "contact", header: "Contact", cell: (s) => s.contact },
            { key: "phone", header: "Phone", cell: (s) => <span className="num">{s.phone}</span> },
            { key: "gstin", header: "GSTIN", cell: (s) => <span className="num">{s.gstin}</span> },
            {
              key: "out",
              header: "Outstanding",
              cell: (s) => (
                <Money value={s.outstanding} className={s.outstanding ? "font-semibold text-primary" : ""} />
              ),
            },
          ]}
        />
      </SectionCard>
    );
  }

  function Purchases() {
    const total = (id: string) => {
      const po = store.purchaseOrders.find((p) => p.id === id);
      return (po?.lines ?? []).reduce((s, l) => s + l.qty * l.rate, 0);
    };
    return (
      <SectionCard title="Purchase orders" bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={store.purchaseOrders}
          keyFn={(p) => p.id}
          columns={[
            { key: "po", header: "PO No", cell: (p) => <span className="font-medium num">{p.poNo}</span> },
            {
              key: "supplier",
              header: "Supplier",
              cell: (p) => store.suppliers.find((s) => s.id === p.supplierId)?.name ?? "—",
            },
            { key: "date", header: "Date", cell: (p) => <span className="num">{p.date}</span> },
            {
              key: "lines",
              header: "Items",
              cell: (p) => (
                <div className="space-y-0.5 text-xs text-muted-foreground">
                  {p.lines.map((l) => (
                    <p key={l.materialId} className="num">
                      {materialName(l.materialId)} · {l.qty} @ ₹{l.rate}
                    </p>
                  ))}
                </div>
              ),
            },
            { key: "value", header: "Value", cell: (p) => <Money value={total(p.id)} /> },
            { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
            {
              key: "action",
              header: "",
              cell: (p) =>
                p.status === "Received" ? null : (
                  <Button size="sm" variant="outline" onClick={() => store.receivePurchaseOrder(p.id)}>
                    <PackageCheck className="size-4" /> Receive
                  </Button>
                ),
            },
          ]}
        />
      </SectionCard>
    );
  }

  function Recipes() {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {store.recipes.map((r) => {
          const cost = r.components.reduce((s, c) => {
            const m = store.rawMaterials.find((x) => x.id === c.materialId);
            return s + (m ? (c.qty / (m.unit === "gm" || m.unit === "ml" ? 1000 : 1)) * m.rate : 0);
          }, 0);
          return (
            <SectionCard
              key={r.id}
              title={r.itemName}
              description={`Yields ${r.yieldQty} ${r.yieldUnit}`}
              bodyClassName="p-3 sm:p-4"
            >
              <ul className="divide-y divide-border text-sm">
                {r.components.map((c) => (
                  <li key={c.materialId} className="flex justify-between py-2">
                    <span>{materialName(c.materialId)}</span>
                    <span className="num text-muted-foreground">
                      {c.qty} {materialUnit(c.materialId)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Estimated material cost</span>
                <Money value={Math.round(cost)} className="font-semibold" />
              </div>
            </SectionCard>
          );
        })}
      </div>
    );
  }

  function SemiFinishedList() {
    const [produce, setProduce] = useState<{ id: string; batches: string } | null>(null);
    return (
      <>
        <div className="grid gap-4 lg:grid-cols-2">
          {store.semiFinished.map((sf) => (
            <SectionCard
              key={sf.id}
              title={sf.name}
              description={`Batch of ${sf.batchQty} ${sf.unit} · in stock ${sf.stock} ${sf.unit}`}
              actions={
                <Button size="sm" onClick={() => setProduce({ id: sf.id, batches: "1" })}>
                  <Plus className="size-4" /> Produce
                </Button>
              }
              bodyClassName="p-3 sm:p-4"
            >
              <ul className="divide-y divide-border text-sm">
                {sf.components.map((c) => (
                  <li key={c.materialId} className="flex justify-between py-2">
                    <span>{materialName(c.materialId)}</span>
                    <span className="num text-muted-foreground">
                      {c.qty} {materialUnit(c.materialId)}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>

        <Dialog open={!!produce} onOpenChange={(o) => !o && setProduce(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Produce batches</DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label>Number of batches</Label>
              <Input
                type="number"
                value={produce?.batches ?? ""}
                onChange={(e) => produce && setProduce({ ...produce, batches: e.target.value })}
              />
              <p className="pt-1 text-xs text-muted-foreground">
                Producing consumes the component materials from raw material stock.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProduce(null)}>
                Cancel
              </Button>
              <Button
                disabled={!produce || Number(produce.batches) <= 0}
                onClick={() => {
                  if (!produce) return;
                  store.produceSemiFinished(produce.id, Number(produce.batches));
                  setProduce(null);
                }}
              >
                Produce
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  function WastageList() {
    const [draft, setDraft] = useState<{ materialId: string; qty: string; reason: string } | null>(
      null,
    );
    return (
      <>
        <SectionCard
          title="Recorded wastage"
          actions={
            <Button
              size="sm"
              onClick={() =>
                setDraft({ materialId: store.rawMaterials[0]?.id ?? "", qty: "", reason: "" })
              }
            >
              <Trash className="size-4" /> Record wastage
            </Button>
          }
          bodyClassName="p-3 sm:p-4"
        >
          <DataTable
            rows={store.wastages}
            keyFn={(w) => w.id}
            empty={<EmptyState icon={Trash} title="No wastage recorded" compact />}
            columns={[
              { key: "date", header: "Date", cell: (w) => <span className="num">{w.date}</span> },
              {
                key: "mat",
                header: "Material",
                cell: (w) => <span className="font-medium">{materialName(w.materialId)}</span>,
              },
              {
                key: "qty",
                header: "Qty",
                cell: (w) => (
                  <span className="num">
                    {w.qty} {materialUnit(w.materialId)}
                  </span>
                ),
              },
              { key: "reason", header: "Reason", cell: (w) => w.reason },
              { key: "by", header: "By", cell: (w) => w.recordedBy },
            ]}
          />
        </SectionCard>

        <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record wastage</DialogTitle>
            </DialogHeader>
            {draft ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Material</Label>
                  <Select
                    value={draft.materialId}
                    onValueChange={(v) => setDraft({ ...draft, materialId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {store.rawMaterials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Quantity ({materialUnit(draft.materialId)})</Label>
                  <Input
                    type="number"
                    value={draft.qty}
                    onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reason</Label>
                  <Input
                    value={draft.reason}
                    onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                    placeholder="Spoilage, preparation loss…"
                  />
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button
                disabled={!draft || Number(draft.qty) <= 0 || !draft.reason.trim()}
                onClick={() => {
                  if (!draft) return;
                  store.addWastage({
                    materialId: draft.materialId,
                    qty: Number(draft.qty),
                    reason: draft.reason.trim(),
                    date: todayLabel,
                    recordedBy: store.currentUser.name,
                  });
                  setDraft(null);
                }}
              >
                Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  function ClosingStock() {
    const groups = useMemo(() => {
      const map = new Map<string, { qtyValue: number; count: number }>();
      store.rawMaterials.forEach((m) => {
        const g = map.get(m.category) ?? { qtyValue: 0, count: 0 };
        g.qtyValue += m.stock * m.rate;
        g.count += 1;
        map.set(m.category, g);
      });
      return [...map.entries()];
    }, []);
    const total = store.rawMaterials.reduce((s, m) => s + m.stock * m.rate, 0);

    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total valuation" value={<Money value={Math.round(total)} />} tone="primary" />
          {groups.map(([name, g]) => (
            <StatCard
              key={name}
              label={name}
              value={<Money value={Math.round(g.qtyValue)} />}
              hint={`${g.count} materials`}
            />
          ))}
        </div>
        <SectionCard title="Closing stock by material" bodyClassName="p-3 sm:p-4">
          <DataTable
            rows={[...store.rawMaterials].sort((a, b) => b.stock * b.rate - a.stock * a.rate)}
            keyFn={(m) => m.id}
            columns={[
              { key: "name", header: "Material", cell: (m) => <span className="font-medium">{m.name}</span> },
              {
                key: "stock",
                header: "Closing qty",
                cell: (m) => (
                  <span className="num">
                    {m.stock} {m.unit}
                  </span>
                ),
              },
              { key: "rate", header: "Rate", cell: (m) => <Money value={m.rate} /> },
              { key: "value", header: "Value", cell: (m) => <Money value={Math.round(m.stock * m.rate)} /> },
            ]}
          />
        </SectionCard>
      </>
    );
  }

  function LowStock() {
    const low = store.rawMaterials.filter((m) => m.stock <= m.reorderLevel);
    return (
      <SectionCard title={`${low.length} materials need reordering`} bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={low}
          keyFn={(m) => m.id}
          empty={<EmptyState icon={Boxes} title="Everything is above reorder level" compact />}
          columns={[
            { key: "name", header: "Material", cell: (m) => <span className="font-medium">{m.name}</span> },
            {
              key: "stock",
              header: "In stock",
              cell: (m) => (
                <span className="num text-primary">
                  {m.stock} {m.unit}
                </span>
              ),
            },
            {
              key: "reorder",
              header: "Reorder level",
              cell: (m) => (
                <span className="num">
                  {m.reorderLevel} {m.unit}
                </span>
              ),
            },
            {
              key: "short",
              header: "Shortfall",
              cell: (m) => (
                <span className="num">
                  {Math.max(0, Math.round((m.reorderLevel - m.stock) * 100) / 100)} {m.unit}
                </span>
              ),
            },
          ]}
        />
      </SectionCard>
    );
  }
}
