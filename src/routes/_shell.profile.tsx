import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({
    meta: [
      { title: "Profile · BillerPe" },
      { name: "description", content: "Profile in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Profile · BillerPe" },
      { property: "og:description", content: "Profile in BillerPe V2 restaurant POS." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <Page>
      <PageHeader title="Profile" />
    </Page>
  );
}
