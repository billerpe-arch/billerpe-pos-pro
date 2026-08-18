import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BadgePercent,
  Bell,
  ChevronRight,
  Monitor,
  Printer,
  ScrollText,
  ServerCog,
  Settings2,
  Truck,
} from "lucide-react";

import { Page, PageHeader, SectionCard } from "@/components/kit";

export const Route = createFileRoute("/_shell/operations/")({
  head: () => ({
    meta: [
      { title: "Operations · BillerPe" },
      { name: "description", content: "Printers, display, charges, approvals and system tools for the outlet." },
      { property: "og:title", content: "Operations · BillerPe" },
      { property: "og:description", content: "Outlet operations and configuration hub." },
    ],
  }),
  component: OperationsPage,
});

const tiles = [
  { to: "/operations/printers", name: "Printer Settings", desc: "Bill and KOT printers with category routing", icon: Printer },
  { to: "/operations/display", name: "Display Settings", desc: "Biller grid density and table card display", icon: Monitor },
  { to: "/operations/delivery-charge", name: "Delivery & Packaging", desc: "Default charges applied to pickup orders", icon: Truck },
  { to: "/operations/approval-matrix", name: "Approval Matrix", desc: "Discount approval thresholds and approvers", icon: BadgePercent },
  { to: "/system", name: "Local Server & Sync", desc: "Devices, sync queue and connection state", icon: ServerCog },
  { to: "/system/audit-log", name: "Audit Log", desc: "Who changed what, when and from which device", icon: ScrollText },
  { to: "/system/notifications", name: "Notification Settings", desc: "WhatsApp, SMS and in-app triggers", icon: Bell },
] as const;

const deferred = [
  "Multi Outlet",
  "Central Kitchen",
  "QR Ordering",
  "Loyalty Program",
  "Membership",
  "Wallet & Gift Card",
  "Owner Mobile App",
  "Purchase Approval Workflow",
  "AI Insights",
];

function OperationsPage() {
  return (
    <Page>
      <PageHeader
        icon={Settings2}
        title="Operations"
        description="Seven configuration areas are live in this prototype. Nine are explicitly out of MVP scope."
      />

      <SectionCard title="Available" bodyClassName="p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary/40 hover:bg-surface-muted"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <t.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Deferred to a later phase"
        description="Listed for transparency — intentionally not built in the MVP prototype."
        bodyClassName="p-3 sm:p-4"
      >
        <div className="flex flex-wrap gap-2">
          {deferred.map((d) => (
            <span
              key={d}
              className="rounded-full border border-dashed border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>
      </SectionCard>
    </Page>
  );
}
