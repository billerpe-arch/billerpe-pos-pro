import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/operations/")({
  head: () => ({
    meta: [
      { title: "Operations · BillerPe" },
      { name: "description", content: "Operations in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Operations · BillerPe" },
      { property: "og:description", content: "Operations in BillerPe V2 restaurant POS." },
    ],
  }),
  component: OperationsPage,
});

function OperationsPage() {
  return (
    <Page>
      <PageHeader title="Operations" />
    </Page>
  );
}
