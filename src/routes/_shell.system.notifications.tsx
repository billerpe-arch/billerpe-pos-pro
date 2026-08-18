import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_shell/system/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Settings · BillerPe" },
      { name: "description", content: "Notification Settings in BillerPe V2 restaurant POS." },
      { property: "og:title", content: "Notification Settings · BillerPe" },
      { property: "og:description", content: "Notification Settings in BillerPe V2 restaurant POS." },
    ],
  }),
  component: NotificationSettingsPage,
});

function NotificationSettingsPage() {
  return (
    <Page>
      <PageHeader title="Notification Settings" />
    </Page>
  );
}
