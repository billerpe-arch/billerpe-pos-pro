import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/reports/")({
  head: () => ({
    meta: [
      { title: "Reports · BillerPe" },
      { name: "description", content: "Reports in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Reports · BillerPe" },
      { property: "og:description", content: "Reports in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <Page>
      <PageHeader title="Reports" />
    </Page>
  );
}
