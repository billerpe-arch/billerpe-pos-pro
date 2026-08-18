import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Boxes, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { Money, Page, PageHeader, SectionCard, StatCard } from "@/components/kit";
import { cn } from "@/lib/utils";
import { STOCK_SECTIONS } from "@/mock/stock-sections";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/_shell/stock/")({
  head: () => ({
    meta: [
      { title: "Stock Management · BillerPe" },
      { name: "description", content: "Raw materials, purchases, recipes, wastage and closing stock valuation." },
      { property: "og:title", content: "Stock Management · BillerPe" },
      { property: "og:description", content: "Inventory control hub for the BillerPe restaurant POS." },
    ],
  }),
  component: StockPage,
});

function StockPage() {
  const store = useStore();

  const stats = useMemo(() => {
    const value = store.rawMaterials.reduce((s, m) => s + m.stock * m.rate, 0);
    const low = store.rawMaterials.filter((m) => m.stock <= m.reorderLevel);
    const openPo = store.purchaseOrders.filter((p) => p.status !== "Received");
    return { value, low, openPo };
  }, [store.rawMaterials, store.purchaseOrders]);

  return (
    <Page>
      <PageHeader
        icon={Boxes}
        title="Stock Management"
        description="Eleven inventory modules. Three are still awaiting a confirmed business rule."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stock valuation" value={<Money value={stats.value} />} tone="primary" />
        <StatCard label="Raw materials" value={store.rawMaterials.length} />
        <StatCard label="Below reorder" value={stats.low.length} tone="warning" />
        <StatCard label="Open purchase orders" value={stats.openPo.length} tone="info" />
      </div>

      {stats.low.length ? (
        <SectionCard title="Low stock alerts" bodyClassName="p-3 sm:p-4">
          <ul className="grid gap-2 sm:grid-cols-2">
            {stats.low.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-soft/60 px-3 py-2.5"
              >
                <AlertTriangle className="size-4 shrink-0 text-warning" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="num">
                      {m.stock} {m.unit}
                    </span>{" "}
                    of reorder level{" "}
                    <span className="num">
                      {m.reorderLevel} {m.unit}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      <SectionCard title="Modules" bodyClassName="p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {STOCK_SECTIONS.map((s) => (
            <Link
              key={s.slug}
              to="/stock/$section"
              params={{ section: s.slug }}
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary/40 hover:bg-surface-muted",
                s.pending && "border-dashed",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {s.name}
                  {s.pending ? (
                    <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                      Pending
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </SectionCard>
    </Page>
  );
}
