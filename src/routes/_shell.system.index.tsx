import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/system/")({
  head: () => ({
    meta: [
      { title: "Local Server & Sync · BillerPe" },
      { name: "description", content: "Local Server & Sync in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Local Server & Sync · BillerPe" },
      { property: "og:description", content: "Local Server & Sync in BillerPe V2 restaurant POS." },
    ],
  }),
  component: SystemPage,
});

function SystemPage() {
  return (
    <Page>
      <PageHeader title="Local Server & Sync" />
    </Page>
  );
}
