import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/users")({
  head: () => ({
    meta: [
      { title: "Manage Users · BillerPe" },
      { name: "description", content: "Manage Users in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Manage Users · BillerPe" },
      { property: "og:description", content: "Manage Users in BillerPe V2 restaurant POS." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <Page>
      <PageHeader title="Manage Users" />
    </Page>
  );
}
