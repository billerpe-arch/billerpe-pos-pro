import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/expense/entries")({
  head: () => ({
    meta: [
      { title: "Expense Entries · BillerPe" },
      { name: "description", content: "Expense Entries in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Expense Entries · BillerPe" },
      { property: "og:description", content: "Expense Entries in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ExpenseEntriesPage,
});

function ExpenseEntriesPage() {
  return (
    <Page>
      <PageHeader title="Expense Entries" />
    </Page>
  );
}
