import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/operations/printers")({
  head: () => ({
    meta: [
      { title: "Printer Settings · BillerPe" },
      { name: "description", content: "Printer Settings in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Printer Settings · BillerPe" },
      { property: "og:description", content: "Printer Settings in BillerPe V2 restaurant POS." },
    ],
  }),
  component: PrinterSettingsPage,
});

function PrinterSettingsPage() {
  return (
    <Page>
      <PageHeader title="Printer Settings" />
    </Page>
  );
}
