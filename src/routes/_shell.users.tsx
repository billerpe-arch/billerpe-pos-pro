import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";

import { DataTable, Page, PageHeader, SectionCard, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/mock/store";
import type { Role, User } from "@/mock/types";

export const Route = createFileRoute("/_shell/users")({
  head: () => ({
    meta: [
      { title: "Manage Users · BillerPe" },
      { name: "description", content: "Staff accounts, roles and the permissions each role carries." },
      { property: "og:title", content: "Manage Users · BillerPe" },
      { property: "og:description", content: "Staff accounts and role permissions in BillerPe." },
    ],
  }),
  component: UsersPage,
});

const roles: Role[] = [
  "Owner",
  "Manager",
  "Cashier",
  "Captain",
  "Kitchen Staff",
  "Inventory Manager",
  "Accountant",
];

const permissions: Record<Role, string[]> = {
  Owner: ["Full access", "User management", "Reports", "Approvals", "Settings"],
  Manager: ["Billing", "Discount approval", "Reports", "Cash session", "Stock"],
  Cashier: ["Billing", "Settlement", "Cash session", "Day-wise reports"],
  Captain: ["Take orders", "KOT", "Table merge & transfer", "Reservations"],
  "Kitchen Staff": ["Kitchen display", "KOT status updates"],
  "Inventory Manager": ["Stock", "Purchases", "Recipes", "Wastage"],
  Accountant: ["Expenses", "Finance reports", "Tax report", "Cash sessions"],
};

function UsersPage() {
  const store = useStore();
  const [draft, setDraft] = useState<User | null>(null);

  const newUser = (): User => ({
    id: "",
    name: "",
    role: "Captain",
    mobile: "",
    email: "",
    status: "Active",
    pin: "1234",
  });

  return (
    <Page>
      <PageHeader
        icon={Users}
        title="Manage Users"
        description="Every staff account maps to exactly one role. Permissions follow the role."
        actions={
          <Button onClick={() => setDraft(newUser())}>
            <Plus className="size-4" /> Add user
          </Button>
        }
      />

      <SectionCard title={`${store.users.length} staff accounts`} bodyClassName="p-3 sm:p-4">
        <DataTable
          rows={store.users}
          keyFn={(u) => u.id}
          onRowClick={(u) => setDraft({ ...u })}
          columns={[
            {
              key: "name",
              header: "Name",
              cell: (u) => (
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              ),
            },
            { key: "role", header: "Role", cell: (u) => u.role },
            { key: "mobile", header: "Mobile", cell: (u) => <span className="num">{u.mobile}</span> },
            { key: "status", header: "Status", cell: (u) => <StatusBadge status={u.status} /> },
          ]}
          mobileCard={(u) => (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">
                  {u.role} · <span className="num">{u.mobile}</span>
                </p>
              </div>
              <StatusBadge status={u.status} />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title="Role permissions"
        description="Reference matrix used across the prototype."
        bodyClassName="p-3 sm:p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {roles.map((r) => (
            <div key={r} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <p className="text-sm font-semibold">{r}</p>
                <span className="ml-auto text-xs text-muted-foreground num">
                  {store.users.filter((u) => u.role === r).length}
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {permissions[r].map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit user" : "Add user"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Mobile</Label>
                  <Input
                    value={draft.mobile}
                    onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Login PIN</Label>
                  <Input
                    value={draft.pin}
                    maxLength={4}
                    onChange={(e) => setDraft({ ...draft, pin: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={draft.role}
                  onValueChange={(v) => setDraft({ ...draft, role: v as Role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="pt-1 text-xs text-muted-foreground">
                  {permissions[draft.role].join(" · ")}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Inactive staff cannot log in.</p>
                </div>
                <Switch
                  checked={draft.status === "Active"}
                  onCheckedChange={(v) => setDraft({ ...draft, status: v ? "Active" : "Inactive" })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={!draft?.name.trim()}
              onClick={() => {
                if (!draft) return;
                store.upsertUser(draft);
                setDraft(null);
              }}
            >
              Save user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
