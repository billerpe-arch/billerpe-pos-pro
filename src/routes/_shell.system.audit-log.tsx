import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/system/audit-log")({
  head: () => ({
    meta: [
      { title: "Audit Log · BillerPe" },
      { name: "description", content: "Audit Log in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Audit Log · BillerPe" },
      { property: "og:description", content: "Audit Log in BillerPe V2 restaurant POS." },
    ],
  }),
  component: AuditLogPage,
});

function AuditLogPage() {
  return (
    <Page>
      <PageHeader title="Audit Log" />
    </Page>
  );
}
