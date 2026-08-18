import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  ChefHat,
  IndianRupee,
  LayoutDashboard,
  Package,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";

import { DataTable, Money, Page, PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { hourlyOrders, salesTrend } from "@/mock/data";
import { todayLabel } from "@/mock/format";
import { orderTotals, useStore } from "@/mock/store";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · BillerPe" },
      {
        name: "description",
        content:
          "Live sales, covers, average bill value, kitchen load and low-stock alerts for today's service.",
      },
      { property: "og:title", content: "Dashboard · BillerPe" },
      {
        property: "og:description",
        content: "Live sales, covers, kitchen load and stock alerts at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const store = useStore();
  const navigate = useNavigate();

  const settled = store.orders.filter((o) => o.status === "Settled");
  const sales = settled.reduce((s, o) => s + orderTotals(o).grand, 0);
  const covers = settled.reduce((s, o) => s + o.guests, 0);
  const running = store.orders.filter((o) => ["Running", "Held", "Bill Generated"].includes(o.status));
  const avgBill = settled.length ? Math.round(sales / settled.length) : 0;
  const lowStock = store.rawMaterials.filter((m) => m.stock <= m.reorderLevel);
  const openKots = store.kots.filter((k) => !["Served", "Cancelled"].includes(k.status));
  const maxTrend = Math.max(...salesTrend.map((d) => d.sales));
  const maxHour = Math.max(...hourlyOrders.map((d) => d.orders));

  return (
    <Page>
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description={`Business date ${todayLabel} · ${store.currentUser.name} (${store.currentUser.role})`}
        actions={
          <Button onClick={() => navigate({ to: "/table-grid" })}>
            Go to floor <ArrowRight className="size-4" />
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="primary"
          label="Net sales"
          value={<Money value={sales} />}
          icon={IndianRupee}
          delta="+12.4%"
          hint="vs yesterday"
        />
        <StatCard label="Bills settled" value={settled.length} icon={Receipt} hint={`${covers} covers`} />
        <StatCard label="Avg. bill value" value={<Money value={avgBill} />} icon={TrendingUp} hint="Dine-in + pickup" />
        <StatCard
          label="Running orders"
          value={running.length}
          icon={Users}
          tone={running.length ? "info" : "default"}
          hint={`${openKots.length} KOTs in kitchen`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Sales — last 7 days" className="lg:col-span-2">
          <div className="flex h-52 items-end gap-3">
            {salesTrend.map((d) => (
              <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="num text-[11px] text-muted-foreground">
                  {Math.round(d.sales / 1000)}k
                </span>
                <div
                  className="w-full rounded-t-lg bg-primary/85 transition-all"
                  style={{ height: `${(d.sales / maxTrend) * 100}%` }}
                />
                <span className="text-[11px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Kitchen load" description="Open KOTs by station">
          <ul className="space-y-3">
            {["Kitchen", "Tandoor", "Chinese", "Beverages", "Dessert"].map((station) => {
              const n = openKots.filter((k) => k.station === station).length;
              return (
                <li key={station}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{station}</span>
                    <span className="num font-semibold">{n}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface-muted">
                    <div
                      className="h-1.5 rounded-full bg-info"
                      style={{ width: `${Math.min(100, n * 25)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <Button variant="outline" className="mt-4 w-full" onClick={() => navigate({ to: "/kds" })}>
            <ChefHat className="size-4" /> Open kitchen display
          </Button>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Hourly order flow" className="lg:col-span-2">
          <div className="flex h-40 items-end gap-2">
            {hourlyOrders.map((h) => (
              <div key={h.hour} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-info/80"
                  style={{ height: `${(h.orders / maxHour) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{h.hour}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Low stock alerts"
          description={`${lowStock.length} items at or below reorder level`}
          actions={
            <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/stock" })}>
              View
            </Button>
          }
        >
          <ul className="space-y-2">
            {lowStock.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0 text-warning" />
                  <span className="truncate">{m.name}</span>
                </span>
                <span className="num shrink-0 text-xs text-muted-foreground">
                  {m.stock} / {m.reorderLevel} {m.unit}
                </span>
              </li>
            ))}
            {!lowStock.length ? (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="size-4" /> All materials healthy
              </li>
            ) : null}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Live orders"
        description="Tap a row to continue the order"
        className="mt-4"
        bodyClassName="p-0 sm:p-0"
      >
        <div className="p-4 sm:p-5">
          <DataTable
            rows={running}
            keyFn={(o) => o.id}
            onRowClick={(o) =>
              navigate({ to: "/table-grid/order/$orderId", params: { orderId: o.id } })
            }
            columns={[
              { key: "no", header: "Order", cell: (o) => <span className="num">#{o.orderNo}</span> },
              { key: "table", header: "Table", cell: (o) => o.tableLabel },
              { key: "type", header: "Type", cell: (o) => o.type },
              { key: "guests", header: "Guests", cell: (o) => <span className="num">{o.guests}</span> },
              { key: "kot", header: "KOTs", cell: (o) => <span className="num">{o.kotRounds}</span> },
              { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
              {
                key: "total",
                header: "Total",
                className: "text-right",
                cell: (o) => <Money value={orderTotals(o).grand} className="font-semibold" />,
              },
            ]}
          />
        </div>
      </SectionCard>
    </Page>
  );
}
