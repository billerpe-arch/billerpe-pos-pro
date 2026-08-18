import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · BillerPe" },
      { name: "description", content: "Dashboard in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Dashboard · BillerPe" },
      { property: "og:description", content: "Dashboard in BillerPe V2 restaurant POS." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <Page>
      <PageHeader title="Dashboard" />
    </Page>
  );
}
