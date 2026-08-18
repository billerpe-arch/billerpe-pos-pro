import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/reports/$reportId")({
  head: () => ({
    meta: [
      { title: "Report · BillerPe" },
      { name: "description", content: "Report in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Report · BillerPe" },
      { property: "og:description", content: "Report in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ReportDetailPage,
});

function ReportDetailPage() {
  return (
    <Page>
      <PageHeader title="Report" />
    </Page>
  );
}
