import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/tables/manage")({
  head: () => ({
    meta: [
      { title: "Manage Tables · BillerPe" },
      { name: "description", content: "Manage Tables in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Manage Tables · BillerPe" },
      { property: "og:description", content: "Manage Tables in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ManageTablesPage,
});

function ManageTablesPage() {
  return (
    <Page>
      <PageHeader title="Manage Tables" />
    </Page>
  );
}
