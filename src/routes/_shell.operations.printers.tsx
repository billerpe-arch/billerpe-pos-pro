import { createFileRoute } from "@tanstack/react-router";
import { Printer as PrinterIcon, TestTube2 } from "lucide-react";
import { toast } from "sonner";

import { DataTable, Page, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/mock/store";
import type { Printer } from "@/mock/types";

export const Route = createFileRoute("/_shell/operations/printers")({
  head: () => ({
    meta: [
      { title: "Printer Settings · BillerPe" },
      { name: "description", content: "Bill and KOT printers, connection type and category routing." },
      { property: "og:title", content: "Printer Settings · BillerPe" },
      { property: "og:description", content: "Configure bill and KOT printers for the outlet." },
    ],
  }),
  component: PrinterSettingsPage,
});

function PrinterSettingsPage() {
  const store = useStore();

  return (
    <Page>
      <PageHeader
        icon={PrinterIcon}
        title="Printer Settings"
        description="KOT printers route by menu category, so each station prints only its own tickets."
      />

      <SectionCard title="Configured printers" bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={store.printers}
          keyFn={(p) => p.id}
          columns={[
            { key: "name", header: "Printer", cell: (p) => <span className="font-medium">{p.name}</span> },
            { key: "type", header: "Type", cell: (p) => p.type },
            { key: "conn", header: "Connection", cell: (p) => p.connection },
            {
              key: "role",
              header: "Role",
              cell: (p) => (
                <Select
                  value={p.role}
                  onValueChange={(v) => store.upsertPrinter({ ...p, role: v as Printer["role"] })}
                >
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bill">Bill</SelectItem>
                    <SelectItem value="KOT">KOT</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
            {
              key: "cats",
              header: "Categories",
              cell: (p) =>
                p.categories.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {p.categories.map((c) => (
                      <span key={c} className="rounded-full bg-surface-muted px-2 py-0.5 text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">All</span>
                ),
            },
            { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
            {
              key: "test",
              header: "",
              cell: (p) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    p.status === "Ready"
                      ? toast.success("Test print sent", { description: p.name })
                      : toast.error("Printer not ready", { description: `${p.name} · ${p.status}` })
                  }
                >
                  <TestTube2 className="size-4" /> Test
                </Button>
              ),
            },
          ]}
          mobileCard={(p) => (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.type} · {p.connection} · {p.role}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          )}
        />
      </SectionCard>
    </Page>
  );
}
