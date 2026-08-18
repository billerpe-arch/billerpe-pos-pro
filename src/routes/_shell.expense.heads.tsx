import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/expense/heads")({
  head: () => ({
    meta: [
      { title: "Expense Heads · BillerPe" },
      { name: "description", content: "Expense Heads in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Expense Heads · BillerPe" },
      { property: "og:description", content: "Expense Heads in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ExpenseHeadsPage,
});

function ExpenseHeadsPage() {
  return (
    <Page>
      <PageHeader title="Expense Heads" />
    </Page>
  );
}
