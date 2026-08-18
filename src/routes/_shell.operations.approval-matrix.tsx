import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/operations/approval-matrix")({
  head: () => ({
    meta: [
      { title: "Approval Matrix · BillerPe" },
      { name: "description", content: "Approval Matrix in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Approval Matrix · BillerPe" },
      { property: "og:description", content: "Approval Matrix in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ApprovalMatrixPage,
});

function ApprovalMatrixPage() {
  return (
    <Page>
      <PageHeader title="Approval Matrix" />
    </Page>
  );
}
