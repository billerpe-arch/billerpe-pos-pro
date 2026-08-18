import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ---------------- page primitives ---------------- */

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8", className)}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  icon: Icon,
  tabs,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
  tabs?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
              <Icon className="size-5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            {description ? (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {tabs ? <div className="mt-4">{tabs}</div> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
        className,
      )}
    >
      {title ? (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------------- stats ---------------- */

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  delta,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning" | "info";
  delta?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-surface border-border",
    primary: "bg-primary text-primary-foreground border-transparent",
    success: "bg-success-soft border-transparent",
    warning: "bg-warning-soft border-transparent",
    info: "bg-info-soft border-transparent",
  };
  const muted =
    tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("rounded-2xl border p-4 shadow-card", tones[tone])}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-xs font-medium uppercase tracking-wide", muted)}>{label}</p>
        {Icon ? <Icon className={cn("size-4 shrink-0", muted)} /> : null}
      </div>
      <p className="num mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint || delta ? (
        <p className={cn("mt-1 text-xs", muted)}>
          {delta ? <span className="font-medium">{delta}</span> : null}
          {delta && hint ? " · " : null}
          {hint}
        </p>
      ) : null}
    </motion.div>
  );
}

/* ---------------- status ---------------- */

const statusTone: Record<string, string> = {
  Free: "bg-status-free text-status-free-foreground",
  Held: "bg-status-held text-status-held-foreground",
  Running: "bg-status-running text-status-running-foreground",
  "Bill Generated": "bg-status-billed text-status-billed-foreground",
  Reserved: "bg-status-reserved text-status-reserved-foreground",
  Settled: "bg-success-soft text-success",
  Cancelled: "bg-muted text-muted-foreground",
  Pending: "bg-status-held text-status-held-foreground",
  Printed: "bg-info-soft text-info",
  Accepted: "bg-info-soft text-info",
  Preparing: "bg-warning-soft text-warning",
  Ready: "bg-success-soft text-success",
  Served: "bg-muted text-muted-foreground",
  Booked: "bg-status-held text-status-held-foreground",
  Confirmed: "bg-status-reserved text-status-reserved-foreground",
  Seated: "bg-status-running text-status-running-foreground",
  Completed: "bg-success-soft text-success",
  "No Show": "bg-primary-soft text-primary-soft-foreground",
  Online: "bg-success-soft text-success",
  Offline: "bg-muted text-muted-foreground",
  Blocked: "bg-primary-soft text-primary-soft-foreground",
  Synced: "bg-success-soft text-success",
  Failed: "bg-primary-soft text-primary-soft-foreground",
  Conflict: "bg-warning-soft text-warning",
  Active: "bg-success-soft text-success",
  Inactive: "bg-muted text-muted-foreground",
  Ready_: "bg-success-soft text-success",
  Received: "bg-success-soft text-success",
  Ordered: "bg-info-soft text-info",
  Draft: "bg-muted text-muted-foreground",
  Open: "bg-success-soft text-success",
  Closed: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  className,
  dot = true,
}: {
  status: string;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        statusTone[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current opacity-70" /> : null}
      {status}
    </span>
  );
}

/* ---------------- states ---------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/60 text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-surface text-muted-foreground shadow-card">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-lg bg-surface-muted" />
      ))}
    </div>
  );
}

export function PendingDecision({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-xl border border-dashed border-warning/40 bg-warning-soft/60 p-4">
      <p className="text-sm font-semibold text-warning">{title}</p>
      <p className="mt-1 text-xs text-warning/90">{note}</p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-warning/80">
        Implementation decision required — no business rule confirmed
      </p>
    </div>
  );
}

/* ---------------- tables ---------------- */

export function DataTable<T>({
  rows,
  columns,
  keyFn,
  onRowClick,
  empty,
  mobileCard,
}: {
  rows: T[];
  columns: { key: string; header: ReactNode; cell: (row: T) => ReactNode; className?: string }[];
  keyFn: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  mobileCard?: (row: T) => ReactNode;
}) {
  if (!rows.length && empty) return <>{empty}</>;
  return (
    <>
      <div className="hidden overflow-x-auto md:block scrollbar-slim">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={keyFn(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-border/70 last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-surface-muted",
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-3 py-3 align-middle", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <div
            key={keyFn(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className="rounded-xl border border-border bg-surface p-3 shadow-card"
          >
            {mobileCard ? (
              mobileCard(row)
            ) : (
              <dl className="space-y-1.5">
                {columns.map((c) => (
                  <div key={c.key} className="flex items-start justify-between gap-3 text-sm">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {c.header}
                    </dt>
                    <dd className="min-w-0 text-right">{c.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function Money({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("num", className)}>
      ₹{value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
    </span>
  );
}
