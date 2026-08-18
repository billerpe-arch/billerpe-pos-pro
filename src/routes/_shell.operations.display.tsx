import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/operations/display")({
  head: () => ({
    meta: [
      { title: "Display Settings · BillerPe" },
      { name: "description", content: "Display Settings in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Display Settings · BillerPe" },
      { property: "og:description", content: "Display Settings in BillerPe V2 restaurant POS." },
    ],
  }),
  component: DisplaySettingsPage,
});

function DisplaySettingsPage() {
  return (
    <Page>
      <PageHeader title="Display Settings" />
    </Page>
  );
}
