import { CheckCircle2, IndianRupee, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable, EmptyState, Money, SectionCard, StatCard, StatusBadge } from "@/components/kit";
import { Notice, Toolbar } from "@/components/operations/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/mock/store";

const RANGES = [
  { id: "today", label: "Today", days: 0 },
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "all", label: "All time", days: 9999 },
];

export function DuePaymentSection() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [range, setRange] = useState("30");
  const [showSettled, setShowSettled] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"Cash" | "Card" | "UPI">("Cash");

  const days = RANGES.find((r) => r.id === range)?.days ?? 30;

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return store.dueBills.filter((b) => {
      if (!showSettled && b.status === "Settled") return false;
      if (b.daysAgo > days) return false;
      if (!t) return true;
      return (
        b.customerName.toLowerCase().includes(t) ||
        b.mobile.includes(t) ||
        b.billNo.toLowerCase().includes(t)
      );
    });
  }, [store.dueBills, q, days, showSettled]);

  const outstanding = store.dueBills
    .filter((b) => b.status === "Due")
    .reduce((s, b) => s + b.amount, 0);
  const aged = store.dueBills.filter((b) => b.status === "Due" && b.daysAgo > 7);
  const selectedTotal = rows
    .filter((b) => selected.includes(b.id) && b.status === "Due")
    .reduce((s, b) => s + b.amount, 0);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-4">
      <Notice tone="warning" title="This screen moves money — it is not a configuration page">
        Settling a bill here records the payment against the original order and clears it from the
        outstanding ledger immediately.
      </Notice>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total outstanding" value={<Money value={outstanding} />} tone="warning" />
        <StatCard
          label="Unpaid bills"
          value={String(store.dueBills.filter((b) => b.status === "Due").length)}
        />
        <StatCard
          label="Older than 7 days"
          value={<Money value={aged.reduce((s, b) => s + b.amount, 0)} />}
          hint={`${aged.length} bills need follow-up`}
        />
      </div>

      <SectionCard title="Unsettled bills" bodyClassName="p-3 sm:p-4">
        <Toolbar
          right={
            <>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={showSettled}
                  onCheckedChange={(v) => setShowSettled(!!v)}
                />
                Include settled
              </label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANGES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          }
        >
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search bill no, name or mobile"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </Toolbar>

        {selected.length ? (
          <div className="mb-3 flex flex-col gap-2 rounded-xl border border-primary/40 bg-primary-soft/40 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {selected.length} bills selected · <Money value={selectedTotal} />
            </p>
            <div className="flex items-center gap-2">
              <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  store.settleDueBills(selected, mode);
                  setSelected([]);
                }}
              >
                <CheckCircle2 className="size-4" /> Settle selected
              </Button>
            </div>
          </div>
        ) : null}

        <DataTable
          rows={rows}
          keyFn={(b) => b.id}
          empty={
            <EmptyState
              icon={IndianRupee}
              title="Nothing outstanding"
              description="No unsettled bills match these filters."
            />
          }
          columns={[
            {
              key: "sel",
              header: "",
              cell: (b) =>
                b.status === "Due" ? (
                  <Checkbox checked={selected.includes(b.id)} onCheckedChange={() => toggle(b.id)} />
                ) : null,
            },
            { key: "bill", header: "Bill", cell: (b) => <span className="font-medium">{b.billNo}</span> },
            {
              key: "cust",
              header: "Customer",
              cell: (b) => (
                <div>
                  <p>{b.customerName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{b.mobile}</p>
                </div>
              ),
            },
            { key: "date", header: "Date", cell: (b) => b.date },
            {
              key: "age",
              header: "Age",
              cell: (b) => (
                <span className={b.daysAgo > 7 && b.status === "Due" ? "text-warning" : ""}>
                  {b.daysAgo === 0 ? "Today" : `${b.daysAgo}d`}
                </span>
              ),
            },
            { key: "amt", header: "Amount", cell: (b) => <Money value={b.amount} /> },
            {
              key: "status",
              header: "Status",
              cell: (b) => (
                <StatusBadge status={b.status === "Settled" ? "Settled" : "Due"} />
              ),
            },
            {
              key: "act",
              header: "",
              cell: (b) =>
                b.status === "Due" ? (
                  <Button size="sm" variant="outline" onClick={() => store.settleDueBills([b.id], mode)}>
                    Settle {mode}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">{b.settledMode}</span>
                ),
            },
          ]}
          mobileCard={(b) => (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{b.billNo} · {b.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {b.date} · <Money value={b.amount} />
                </p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}
