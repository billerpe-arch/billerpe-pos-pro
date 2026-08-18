import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable, EmptyState, Money, Page, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { orderTotals, useStore } from "@/mock/store";
import type { OrderStatus } from "@/mock/types";

export const Route = createFileRoute("/_shell/orders/")({
  head: () => ({
    meta: [
      { title: "Orders · BillerPe" },
      {
        name: "description",
        content: "Search, filter and reprint every dine-in and pickup order for the business date.",
      },
      { property: "og:title", content: "Orders · BillerPe" },
      { property: "og:description", content: "All dine-in and pickup orders with filters." },
    ],
  }),
  component: OrdersPage,
});

const filters: ("All" | OrderStatus)[] = [
  "All",
  "Running",
  "Held",
  "Bill Generated",
  "Settled",
  "Cancelled",
];

function OrdersPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      [...store.orders]
        .sort((a, b) => b.orderNo - a.orderNo)
        .filter((o) => status === "All" || o.status === status)
        .filter(
          (o) =>
            !q ||
            String(o.orderNo).includes(q) ||
            o.tableLabel.toLowerCase().includes(q.toLowerCase()) ||
            (o.customerName ?? "").toLowerCase().includes(q.toLowerCase()),
        ),
    [store.orders, status, q],
  );

  return (
    <Page>
      <PageHeader
        icon={Receipt}
        title="Orders"
        description="Every order created on this business date, across all terminals."
      />

      <SectionCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  status === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-muted text-muted-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order no, table, customer"
              className="pl-9"
            />
          </div>
        </div>

        <DataTable
          rows={rows}
          keyFn={(o) => o.id}
          onRowClick={(o) => navigate({ to: "/orders/$orderId", params: { orderId: o.id } })}
          empty={<EmptyState icon={Receipt} title="No orders match" description="Try another filter." />}
          columns={[
            { key: "no", header: "Order", cell: (o) => <span className="num font-medium">#{o.orderNo}</span> },
            { key: "table", header: "Table", cell: (o) => o.tableLabel },
            { key: "type", header: "Type", cell: (o) => o.type },
            {
              key: "cust",
              header: "Customer",
              cell: (o) => o.customerName ?? <span className="text-muted-foreground">—</span>,
            },
            { key: "time", header: "Created", cell: (o) => <span className="num">{o.createdAt}</span> },
            { key: "pay", header: "Payment", cell: (o) => o.paymentMode ?? "—" },
            { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
            {
              key: "total",
              header: "Total",
              className: "text-right",
              cell: (o) => <Money value={orderTotals(o).grand} className="font-semibold" />,
            },
          ]}
        />
      </SectionCard>
    </Page>
  );
}
