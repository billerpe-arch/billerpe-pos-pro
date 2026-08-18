import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import * as seed from "./data";
import * as stockSeed from "./stock-seed";
import * as opsSeed from "./ops-seed";
import { nowStamp, todayLabel } from "./format";
import type {
  AppNotification,
  DueBill,
  InvoiceFormat,
  Kitchen,
  PromoCode,
  ServiceChargeRule,
  TaxRule,
  FranchiseRequisition,
  ProductionRun,
  RecipeGroup,
  RequisitionStatus,
  StockAdjustment,
  StockMovement,
  StockUnit,
  ApprovalRule,
  AuditLog,
  CashSession,
  ConnectionState,
  Customer,
  Device,
  Expense,
  ExpenseHead,
  Kot,
  MenuCategory,
  MenuItem,
  NotificationSetting,
  Order,
  OrderLine,
  PaymentSplit,
  Printer,
  PurchaseOrder,
  RawMaterial,
  Recipe,
  Reservation,
  RestaurantTable,
  Role,
  SemiFinished,
  Supplier,
  SyncItem,
  TableCategory,
  User,
  Wastage,
} from "./types";

let seq = 1000;
const uid = (p: string) => `${p}-${++seq}`;

export interface AddLineInput {
  itemId: string;
  qty?: number;
  variant?: string;
  addons?: { name: string; price: number }[];
  note?: string;
}

interface State {
  authed: boolean;
  deviceRegistered: boolean;
  currentUserId: string;
  tables: RestaurantTable[];
  tableCategories: TableCategory[];
  orders: Order[];
  kots: Kot[];
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  users: User[];
  customers: Customer[];
  reservations: Reservation[];
  expenses: Expense[];
  expenseHeads: ExpenseHead[];
  rawMaterials: RawMaterial[];
  recipes: Recipe[];
  semiFinished: SemiFinished[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  wastages: Wastage[];
  units: StockUnit[];
  stockMovements: StockMovement[];
  stockAdjustments: StockAdjustment[];
  productionRuns: ProductionRun[];
  requisitions: FranchiseRequisition[];
  cashSessions: CashSession[];
  devices: Device[];
  printers: Printer[];
  syncItems: SyncItem[];
  notifications: AppNotification[];
  notificationSettings: NotificationSetting[];
  auditLogs: AuditLog[];
  approvalRules: ApprovalRule[];
  connection: ConnectionState;
  deliveryCharge: number;
  packagingCharge: number;
  maxOfflineDays: number;
  /* operations */
  serviceCharge: ServiceChargeRule;
  taxRules: TaxRule[];
  invoiceFormat: InvoiceFormat;
  promoCodes: PromoCode[];
  kitchens: Kitchen[];
  displayMode: "Keyboard" | "Touch";
  menuImages: boolean;
  dueBills: DueBill[];
}

const initialState: State = {
  authed: false,
  deviceRegistered: false,
  currentUserId: seed.CURRENT_USER_ID,
  tables: seed.tables,
  tableCategories: seed.tableCategories,
  orders: [...seed.liveOrders, ...seed.historyOrders],
  kots: seed.kots,
  menuItems: seed.menuItems,
  menuCategories: seed.menuCategories,
  users: seed.users,
  customers: seed.customers,
  reservations: seed.reservations,
  expenses: seed.expenses,
  expenseHeads: seed.expenseHeads,
  rawMaterials: seed.rawMaterials,
  recipes: stockSeed.recipes,
  semiFinished: seed.semiFinished,
  suppliers: seed.suppliers,
  purchaseOrders: stockSeed.purchaseOrders,
  wastages: seed.wastages,
  units: stockSeed.units,
  stockMovements: stockSeed.stockMovements,
  stockAdjustments: stockSeed.stockAdjustments,
  productionRuns: stockSeed.productionRuns,
  requisitions: stockSeed.requisitions,
  cashSessions: seed.pastCashSessions,
  devices: seed.devices,
  printers: seed.printers,
  syncItems: seed.syncItems,
  notifications: seed.notifications,
  notificationSettings: seed.notificationSettings,
  auditLogs: seed.auditLogs,
  approvalRules: seed.approvalRules,
  connection: "online",
  deliveryCharge: seed.DELIVERY_SETTINGS.deliveryCharge,
  packagingCharge: seed.DELIVERY_SETTINGS.packagingCharge,
  maxOfflineDays: seed.OFFLINE_SETTINGS.maxOfflineDays,
  serviceCharge: opsSeed.serviceCharge,
  taxRules: opsSeed.taxRules,
  invoiceFormat: opsSeed.invoiceFormat,
  promoCodes: opsSeed.promoCodes,
  kitchens: opsSeed.kitchens,
  displayMode: "Touch",
  menuImages: true,
  dueBills: opsSeed.dueBills,
};

export function lineTotal(l: OrderLine) {
  const addons = (l.addons ?? []).reduce((s, a) => s + a.price, 0);
  return (l.price + addons) * l.qty;
}

export function orderTotals(order: Order | undefined) {
  if (!order) {
    return { subtotal: 0, cgst: 0, sgst: 0, discount: 0, charges: 0, grand: 0 };
  }
  const subtotal = order.itemised
    ? order.lines.reduce((s, l) => s + lineTotal(l), 0)
    : (order.fallbackTotal ?? 0);
  const discount = order.discount?.amount ?? 0;
  const charges = (order.deliveryCharge ?? 0) + (order.packagingCharge ?? 0);
  const taxable = Math.max(0, subtotal - discount);
  const cgst = Math.round(taxable * (seed.RESTAURANT.cgst / 100) * 100) / 100;
  const sgst = Math.round(taxable * (seed.RESTAURANT.sgst / 100) * 100) / 100;
  const grand = Math.round((taxable + cgst + sgst + charges) * 100) / 100;
  return { subtotal, cgst, sgst, discount, charges, grand };
}

interface Ctx extends State {
  currentUser: User;
  transactionsBlocked: boolean;
  /* auth */
  registerDevice: () => void;
  login: (userId?: string) => void;
  logout: () => void;
  /* helpers */
  tableLabel: (tableId: string) => string;
  tableById: (id: string) => RestaurantTable | undefined;
  orderById: (id: string) => Order | undefined;
  orderForTable: (tableId: string) => Order | undefined;
  /* order lifecycle */
  startOrder: (tableId: string, guests: number) => string;
  startTakeAway: () => string;
  addLine: (orderId: string, input: AddLineInput) => void;
  changeQty: (orderId: string, lineId: string, delta: number) => void;
  removeLine: (orderId: string, lineId: string) => void;
  holdOrder: (orderId: string) => void;
  saveOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  generateKot: (orderId: string) => void;
  applyDiscount: (orderId: string, label: string, amount: number) => void;
  setCustomer: (orderId: string, name: string, phone: string) => void;
  setCharges: (orderId: string, delivery: number, packaging: number) => void;
  generateBill: (orderId: string) => void;
  settleOrder: (orderId: string, payments: PaymentSplit[]) => void;
  mergeTables: (sourceTableId: string, destTableId: string) => void;
  transferTable: (orderId: string, destTableId: string) => void;
  /* kds */
  setKotStatus: (kotId: string, status: Kot["status"]) => void;
  /* reservations */
  addReservation: (r: Omit<Reservation, "id">) => void;
  setReservationStatus: (id: string, status: Reservation["status"]) => void;
  setReleaseMode: (id: string, mode: "Manual" | "Auto") => void;
  /* cash */
  openSession: (float: number) => void;
  addCash: (amount: number, reason: string) => void;
  withdrawCash: (amount: number, reason: string) => boolean;
  attachExpense: (headId: string, amount: number, note: string) => void;
  closeSession: (counted: number, reason: string) => void;
  sessionBalance: () => number;
  openSessionRecord: () => CashSession | undefined;
  /* generic crud */
  upsertMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;
  upsertMenuCategory: (c: MenuCategory) => void;
  upsertTable: (t: RestaurantTable) => void;
  removeTable: (id: string) => void;
  upsertTableCategory: (c: TableCategory) => void;
  upsertUser: (u: User) => void;
  upsertExpense: (e: Expense) => void;
  upsertExpenseHead: (h: ExpenseHead) => void;
  upsertRawMaterial: (m: RawMaterial) => void;
  upsertSupplier: (s: Supplier) => void;
  upsertPurchaseOrder: (p: PurchaseOrder) => void;
  receivePurchaseOrder: (id: string) => void;
  addWastage: (w: Omit<Wastage, "id">) => void;
  produceSemiFinished: (id: string, batches: number) => void;
  /* stock module */
  upsertUnit: (u: StockUnit) => void;
  savePurchase: (po: PurchaseOrder, opts?: { receive?: boolean }) => void;
  payPurchaseOrder: (id: string, amount: number) => void;
  cancelPurchaseOrder: (id: string) => void;
  poTotals: (po: PurchaseOrder) => { subtotal: number; tax: number; discount: number; grand: number };
  saveStockCount: (rows: { materialId: string; countedQty: number }[], note?: string) => void;
  addWastageBatch: (
    rows: { materialId: string; qty: number; reason: string; notes?: string }[],
  ) => void;
  upsertSemiFinished: (sf: SemiFinished) => void;
  removeSemiFinished: (id: string) => void;
  recordProduction: (semiId: string, qty: number, notes?: string) => void;
  semiUnitCost: (semiId: string) => number;
  upsertRecipe: (r: Recipe) => void;
  removeRecipe: (id: string) => void;
  recipeGroupCost: (g: RecipeGroup) => number;
  createRequisition: (
    items: { materialId: string; orderedQty: number; unitPrice: number }[],
    remarks?: string,
  ) => void;
  setRequisitionStatus: (id: string, status: RequisitionStatus) => void;
  setRequisitionQty: (id: string, materialId: string, qty: number) => void;
  removeRequisition: (id: string) => void;
  fulfilRequisition: (id: string) => void;
  /* system */
  setConnection: (state: ConnectionState) => void;
  syncNow: () => void;
  retrySync: (id?: string) => void;
  resolveConflict: (id: string) => void;
  setDeviceStatus: (id: string, status: Device["status"]) => void;
  renameDevice: (id: string, name: string) => void;
  deregisterDevice: (id: string) => void;
  upsertPrinter: (p: Printer) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleNotificationSetting: (trigger: string, channel: "whatsapp" | "sms" | "inApp") => void;
  toggleApprovalRule: (id: string) => void;
  updateApprovalThreshold: (id: string, threshold: string, approver: Role) => void;
  setDeliverySettings: (delivery: number, packaging: number) => void;
  /* operations */
  setServiceCharge: (rule: ServiceChargeRule) => void;
  upsertTaxRule: (rule: TaxRule) => void;
  removeTaxRule: (id: string) => void;
  toggleTaxRule: (id: string) => void;
  setInvoiceFormat: (fmt: InvoiceFormat) => void;
  setGstCalculation: (on: boolean) => void;
  upsertPromo: (promo: PromoCode) => void;
  togglePromo: (id: string) => void;
  upsertKitchen: (kitchen: Kitchen) => void;
  removeKitchen: (id: string) => void;
  removePrinter: (id: string) => void;
  setDisplayMode: (mode: "Keyboard" | "Touch") => void;
  setMenuImages: (on: boolean) => void;
  upsertCustomer: (customer: Customer) => void;
  toggleCustomer: (id: string) => void;
  settleDueBills: (ids: string[], mode: "Cash" | "Card" | "UPI") => void;
  setMaxOfflineDays: (days: number) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<State>(initialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("billerpe.session");
    if (saved) {
      const parsed = JSON.parse(saved) as { userId: string; device: boolean };
      set((p) => ({
        ...p,
        authed: true,
        deviceRegistered: parsed.device,
        currentUserId: parsed.userId,
      }));
    }
  }, []);

  const patch = useCallback((fn: (p: State) => State) => set(fn), []);

  const currentUser = useMemo(
    () => s.users.find((u) => u.id === s.currentUserId) ?? s.users[0],
    [s.users, s.currentUserId],
  );

  const tableLabel = useCallback(
    (tableId: string) => {
      const t = s.tables.find((x) => x.id === tableId);
      if (!t) return "Take Away";
      const cat = s.tableCategories.find((c) => c.id === t.categoryId);
      return `${cat?.name ?? ""} · ${t.name}`;
    },
    [s.tables, s.tableCategories],
  );

  const log = useCallback(
    (action: string, entity: string, before: string, after: string, reason?: string) => {
      const entry: AuditLog = {
        id: uid("a"),
        userId: s.currentUserId,
        userName: currentUser?.name ?? "Taj",
        action,
        entity,
        before,
        after,
        device: "Counter POS",
        ip: "192.168.1.14",
        at: nowStamp(),
        ...(reason ? { reason } : {}),
      };
      patch((p) => ({ ...p, auditLogs: [entry, ...p.auditLogs] }));
    },
    [currentUser, patch, s.currentUserId],
  );

  const transactionsBlocked = s.connection === "offline-limit-exceeded";

  const guardBlocked = useCallback(() => {
    if (s.connection === "offline-limit-exceeded") {
      toast.error("New transactions are blocked", {
        description: `This device has been offline longer than the ${s.maxOfflineDays}-day limit. Reconnect and sync to resume billing.`,
      });
      return true;
    }
    return false;
  }, [s.connection, s.maxOfflineDays]);

  const nextOrderNo = useCallback(
    () => Math.max(...s.orders.map((o) => o.orderNo), 100) + 1,
    [s.orders],
  );


  const poTotals = useCallback((po: PurchaseOrder) => {
    const subtotal = po.lines.reduce((sum, l) => sum + l.qty * l.rate, 0);
    const tax = po.lines.reduce((sum, l) => sum + (l.qty * l.rate * (l.taxPct ?? 0)) / 100, 0);
    const discount =
      po.discountType === "percent"
        ? (subtotal * (po.discountValue ?? 0)) / 100
        : (po.discountValue ?? 0);
    const grand = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      grand,
    };
  }, []);

  const semiUnitCost = useCallback(
    (semiId: string) => {
      const sf = s.semiFinished.find((x) => x.id === semiId);
      if (!sf) return 0;
      return sf.components.reduce((sum, c) => {
        const m = s.rawMaterials.find((x) => x.id === c.materialId);
        return sum + (m ? m.rate * c.qty : 0);
      }, 0);
    },
    [s.semiFinished, s.rawMaterials],
  );

  const movement = (
    kind: StockMovement["kind"],
    refType: StockMovement["refType"],
    refId: string,
    qty: number,
    value: number,
    reference: string,
    by: string,
  ): StockMovement => ({
    id: uid("mv"),
    kind,
    refType,
    refId,
    qty: Math.round(qty * 1000) / 1000,
    value: Math.round(value * 100) / 100,
    reference,
    at: nowStamp(),
    by,
  });

  const value: Ctx = {
    ...s,
    currentUser,
    transactionsBlocked,
    tableLabel,
    tableById: (id) => s.tables.find((t) => t.id === id),
    orderById: (id) => s.orders.find((o) => o.id === id),
    orderForTable: (tableId) =>
      s.orders.find(
        (o) => o.tableId === tableId && ["Held", "Running", "Bill Generated"].includes(o.status),
      ),

    registerDevice: () => {
      patch((p) => ({ ...p, deviceRegistered: true }));
      toast.success("Device registered", { description: "Counter POS · 192.168.1.14" });
    },
    login: (userId) => {
      const id = userId ?? s.currentUserId;
      patch((p) => ({ ...p, authed: true, currentUserId: id, deviceRegistered: true }));
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "billerpe.session",
          JSON.stringify({ userId: id, device: true }),
        );
      }
    },
    logout: () => {
      patch((p) => ({ ...p, authed: false }));
      if (typeof window !== "undefined") window.localStorage.removeItem("billerpe.session");
    },

    startOrder: (tableId, guests) => {
      const id = uid("o");
      const label = tableLabel(tableId);
      patch((p) => ({
        ...p,
        tables: p.tables.map((t) =>
          t.id === tableId
            ? { ...t, status: "Running", guests, orderId: id, occupiedSince: nowStamp() }
            : t,
        ),
        orders: [
          {
            id,
            orderNo: Math.max(...p.orders.map((o) => o.orderNo), 100) + 1,
            type: "Dine In",
            tableId,
            tableLabel: label,
            guests,
            status: "Running",
            kotRounds: 0,
            lines: [],
            businessDate: todayLabel,
            createdAt: nowStamp(),
            createdBy: currentUser?.name ?? "Taj",
            itemised: true,
          },
          ...p.orders,
        ],
      }));
      return id;
    },

    startTakeAway: () => {
      const id = uid("o");
      patch((p) => ({
        ...p,
        orders: [
          {
            id,
            orderNo: Math.max(...p.orders.map((o) => o.orderNo), 100) + 1,
            type: "Pickup",
            tableLabel: "Take Away",
            guests: 1,
            status: "Running",
            kotRounds: 0,
            lines: [],
            packagingCharge: p.packagingCharge,
            businessDate: todayLabel,
            createdAt: nowStamp(),
            createdBy: currentUser?.name ?? "Taj",
            itemised: true,
          },
          ...p.orders,
        ],
      }));
      return id;
    },

    addLine: (orderId, input) => {
      const mi = s.menuItems.find((m) => m.id === input.itemId);
      if (!mi) return;
      const price = input.variant
        ? (mi.variants?.find((v) => v.name === input.variant)?.price ?? mi.price)
        : mi.price;
      patch((p) => ({
        ...p,
        orders: p.orders.map((o) => {
          if (o.id !== orderId) return o;
          const round = o.kotRounds + 1;
          const existing = o.lines.find(
            (l) =>
              l.itemId === input.itemId &&
              l.kotRound === round &&
              (l.variant ?? "") === (input.variant ?? "") &&
              JSON.stringify(l.addons ?? []) === JSON.stringify(input.addons ?? []),
          );
          if (existing) {
            return {
              ...o,
              lines: o.lines.map((l) =>
                l.id === existing.id ? { ...l, qty: l.qty + (input.qty ?? 1) } : l,
              ),
            };
          }
          const newLine: OrderLine = {
            id: uid("l"),
            itemId: mi.id,
            name: mi.name,
            qty: input.qty ?? 1,
            price,
            kotRound: round,
            ...(input.variant ? { variant: input.variant } : {}),
            ...(input.addons?.length ? { addons: input.addons } : {}),
            ...(input.note ? { note: input.note } : {}),
          };
          return { ...o, lines: [...o.lines, newLine] };
        }),
      }));
    },

    changeQty: (orderId, lineId, delta) =>
      patch((p) => ({
        ...p,
        orders: p.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                lines: o.lines
                  .map((l) => (l.id === lineId ? { ...l, qty: l.qty + delta } : l))
                  .filter((l) => l.qty > 0),
              }
            : o,
        ),
      })),

    removeLine: (orderId, lineId) =>
      patch((p) => ({
        ...p,
        orders: p.orders.map((o) =>
          o.id === orderId ? { ...o, lines: o.lines.filter((l) => l.id !== lineId) } : o,
        ),
      })),

    holdOrder: (orderId) => {
      const o = s.orders.find((x) => x.id === orderId);
      patch((p) => ({
        ...p,
        orders: p.orders.map((x) => (x.id === orderId ? { ...x, status: "Held" } : x)),
        tables: p.tables.map((t) => (t.id === o?.tableId ? { ...t, status: "Held" } : t)),
      }));
      toast.success(`Order #${o?.orderNo} held`, { description: o?.tableLabel });
    },

    saveOrder: (orderId) => {
      const o = s.orders.find((x) => x.id === orderId);
      patch((p) => ({
        ...p,
        orders: p.orders.map((x) => (x.id === orderId ? { ...x, status: "Running" } : x)),
        tables: p.tables.map((t) => (t.id === o?.tableId ? { ...t, status: "Running" } : t)),
      }));
      toast.success(`Order #${o?.orderNo} saved`, { description: o?.tableLabel });
    },

    cancelOrder: (orderId) => {
      const o = s.orders.find((x) => x.id === orderId);
      patch((p) => ({
        ...p,
        orders: p.orders.map((x) => (x.id === orderId ? { ...x, status: "Cancelled" } : x)),
        tables: p.tables.map((t) =>
          t.id === o?.tableId
            ? { ...t, status: "Free", guests: undefined, orderId: undefined }
            : t,
        ),
        kots: p.kots.map((k) => (k.orderId === orderId ? { ...k, status: "Cancelled" } : k)),
      }));
      log("Order Cancelled", `Order #${o?.orderNo}`, o?.status ?? "", "Cancelled");
      toast.success(`Order #${o?.orderNo} cancelled`);
    },

    generateKot: (orderId) => {
      if (guardBlocked()) return;
      const o = s.orders.find((x) => x.id === orderId);
      if (!o) return;
      const round = o.kotRounds + 1;
      const pending = o.lines.filter((l) => l.kotRound === round);
      if (!pending.length) {
        toast.info("Nothing new to send", { description: "Add items before generating a KOT." });
        return;
      }
      const byStation = new Map<MenuItem["station"], OrderLine[]>();
      pending.forEach((l) => {
        const st = s.menuItems.find((m) => m.id === l.itemId)?.station ?? "Kitchen";
        byStation.set(st, [...(byStation.get(st) ?? []), l]);
      });
      const newKots: Kot[] = [...byStation.entries()].map(([station, lines], i) => ({
        id: uid("k"),
        kotNo: Math.max(...s.kots.map((k) => k.kotNo), 300) + 1 + i,
        orderId,
        tableLabel: o.tableLabel,
        round,
        station,
        status: "Pending",
        createdAt: nowStamp(),
        items: lines.map((l) => ({
          name: `${l.name}${l.variant ? ` (${l.variant})` : ""}`,
          qty: l.qty,
          ...(l.note ? { note: l.note } : {}),
        })),
      }));
      patch((p) => ({
        ...p,
        kots: [...newKots, ...p.kots],
        orders: p.orders.map((x) =>
          x.id === orderId ? { ...x, kotRounds: round, status: "Running" } : x,
        ),
        tables: p.tables.map((t) => (t.id === o.tableId ? { ...t, status: "Running" } : t)),
        syncItems: [
          {
            id: uid("sy"),
            entity: "KOT",
            reference: `Round ${round} · ${o.tableLabel}`,
            action: "Create",
            status: p.connection === "online" ? "Synced" : "Pending",
            queuedAt: nowStamp(),
            device: "Counter POS",
          },
          ...p.syncItems,
        ],
        notifications: [
          {
            id: uid("n"),
            title: "KOT sent to kitchen",
            body: `Round ${round} · ${o.tableLabel} · ${pending.length} item(s).`,
            at: nowStamp(),
            read: false,
            kind: "order",
          },
          ...p.notifications,
        ],
      }));
      toast.success(`KOT round ${round} sent`, {
        description: `${newKots.length} station ticket(s) printed.`,
      });
    },

    applyDiscount: (orderId, label, amount) => {
      const o = s.orders.find((x) => x.id === orderId);
      if (!o) return;
      const rule = s.approvalRules.find((r) => r.domain === "Discount" && r.enabled);
      const subtotal = orderTotals(o).subtotal;
      const overThreshold = !!rule && (amount > 500 || (subtotal > 0 && amount / subtotal > 0.1));
      patch((p) => ({
        ...p,
        orders: p.orders.map((x) =>
          x.id === orderId
            ? { ...x, discount: { label, amount, approvalFlagged: overThreshold } }
            : x,
        ),
      }));
      log("Discount Applied", `Order #${o.orderNo}`, "₹0", `₹${amount} (${label})`);
      if (overThreshold) {
        toast.warning("Discount flagged for approval", {
          description: `Above the Approval Matrix threshold (${rule?.threshold}). Sent to ${rule?.approver}.`,
        });
      } else {
        toast.success(`Discount applied · ₹${amount}`);
      }
    },

    setCustomer: (orderId, name, phone) => {
      patch((p) => ({
        ...p,
        orders: p.orders.map((o) =>
          o.id === orderId ? { ...o, customerName: name, customerPhone: phone } : o,
        ),
        customers: p.customers.some((c) => c.phone === phone)
          ? p.customers
          : [{ id: uid("c"), name, phone, orders: 1, lastVisit: todayLabel }, ...p.customers],
      }));
      toast.success("Customer details saved");
    },

    setCharges: (orderId, delivery, packaging) => {
      patch((p) => ({
        ...p,
        orders: p.orders.map((o) =>
          o.id === orderId ? { ...o, deliveryCharge: delivery, packagingCharge: packaging } : o,
        ),
      }));
      toast.success("Charges updated");
    },

    generateBill: (orderId) => {
      if (guardBlocked()) return;
      const o = s.orders.find((x) => x.id === orderId);
      patch((p) => ({
        ...p,
        orders: p.orders.map((x) => (x.id === orderId ? { ...x, status: "Bill Generated" } : x)),
        tables: p.tables.map((t) => (t.id === o?.tableId ? { ...t, status: "Bill Generated" } : t)),
      }));
      toast.success(`Bill generated for #${o?.orderNo}`);
    },

    settleOrder: (orderId, payments) => {
      if (guardBlocked()) return;
      const o = s.orders.find((x) => x.id === orderId);
      if (!o) return;
      const mode = payments.length > 1 ? "Split" : payments[0].mode;
      const cashPortion = payments
        .filter((p) => p.mode === "Cash")
        .reduce((sum, p) => sum + p.amount, 0);
      const total = payments.reduce((sum, p) => sum + p.amount, 0);
      patch((p) => ({
        ...p,
        orders: p.orders.map((x) =>
          x.id === orderId
            ? {
                ...x,
                status: "Settled",
                payments,
                paymentMode: mode,
                settledAt: nowStamp(),
                fallbackTotal: total,
              }
            : x,
        ),
        tables: p.tables.map((t) =>
          t.id === o.tableId
            ? { ...t, status: "Free", guests: undefined, orderId: undefined, occupiedSince: undefined }
            : t,
        ),
        cashSessions: p.cashSessions.map((cs) =>
          cs.status === "Open" && cashPortion > 0
            ? {
                ...cs,
                movements: [
                  ...cs.movements,
                  {
                    id: uid("cm"),
                    type: "Settlement" as const,
                    amount: cashPortion,
                    reason: `Cash settlement · Order #${o.orderNo}`,
                    at: nowStamp(),
                    by: currentUser?.name ?? "Taj",
                  },
                ],
              }
            : cs,
        ),
        syncItems: [
          {
            id: uid("sy"),
            entity: "Bill",
            reference: `#${o.orderNo}`,
            action: "Settle",
            status: p.connection === "online" ? "Synced" : "Pending",
            queuedAt: nowStamp(),
            device: "Counter POS",
          },
          ...p.syncItems,
        ],
      }));
      log("Bill Settled", `Order #${o.orderNo}`, o.status, `Settled · ${mode} ₹${total}`);
      toast.success(`Order #${o.orderNo} settled`, {
        description: payments.map((p) => `${p.mode} ₹${p.amount}`).join(" + "),
      });
    },

    mergeTables: (sourceTableId, destTableId) => {
      if (guardBlocked()) return;
      const sourceLabel = tableLabel(sourceTableId);
      const destLabel = tableLabel(destTableId);
      const src = s.tables.find((t) => t.id === sourceTableId);
      const dst = s.tables.find((t) => t.id === destTableId);
      const srcOrder = s.orders.find(
        (o) =>
          o.tableId === sourceTableId && ["Held", "Running", "Bill Generated"].includes(o.status),
      );
      const dstOrder = s.orders.find(
        (o) => o.tableId === destTableId && ["Held", "Running", "Bill Generated"].includes(o.status),
      );
      if (!srcOrder) {
        toast.error("Source table has no active order");
        return;
      }
      if (dst?.status === "Reserved") {
        toast.error("Destination table is Reserved", {
          description: "Pick a different destination table.",
        });
        return;
      }
      const guests = (src?.guests ?? srcOrder.guests) + (dst?.guests ?? dstOrder?.guests ?? 0);
      const movedLines = srcOrder.lines.map((l) => ({
        ...l,
        originTable: l.originTable ?? sourceLabel,
        id: uid("l"),
      }));

      patch((p) => {
        let orders = p.orders;
        let targetOrderId = dstOrder?.id;
        if (dstOrder) {
          orders = orders.map((o) =>
            o.id === dstOrder.id
              ? {
                  ...o,
                  guests,
                  lines: [
                    ...o.lines.map((l) => ({ ...l, originTable: l.originTable ?? destLabel })),
                    ...movedLines,
                  ],
                  kotRounds: Math.max(o.kotRounds, srcOrder.kotRounds),
                  mergedFrom: [...(o.mergedFrom ?? []), sourceLabel],
                  status: "Running" as const,
                }
              : o,
          );
        } else {
          targetOrderId = srcOrder.id;
          orders = orders.map((o) =>
            o.id === srcOrder.id
              ? {
                  ...o,
                  tableId: destTableId,
                  tableLabel: destLabel,
                  guests,
                  lines: movedLines,
                  mergedFrom: [...(o.mergedFrom ?? []), sourceLabel],
                  status: "Running" as const,
                }
              : o,
          );
        }
        if (dstOrder) {
          orders = orders.filter((o) => o.id !== srcOrder.id);
        }
        return {
          ...p,
          orders,
          kots: p.kots.map((k) =>
            k.orderId === srcOrder.id && targetOrderId
              ? { ...k, orderId: targetOrderId, tableLabel: `${destLabel} (from ${sourceLabel})` }
              : k,
          ),
          tables: p.tables.map((t) => {
            if (t.id === sourceTableId)
              return {
                ...t,
                status: "Free" as const,
                guests: undefined,
                orderId: undefined,
                occupiedSince: undefined,
              };
            if (t.id === destTableId)
              return {
                ...t,
                status: "Running" as const,
                guests,
                orderId: targetOrderId,
                occupiedSince: t.occupiedSince ?? nowStamp(),
              };
            return t;
          }),
        };
      });
      log("Table Merged", `${sourceLabel} → ${destLabel}`, "2 orders", "1 combined order");
      toast.success(`Merged ${sourceLabel} into ${destLabel}`, {
        description: `Items grouped by origin · ${guests} guests · one combined bill. Merge cannot be undone.`,
      });
    },

    transferTable: (orderId, destTableId) => {
      if (guardBlocked()) return;
      const o = s.orders.find((x) => x.id === orderId);
      const dst = s.tables.find((t) => t.id === destTableId);
      if (!o || !dst) return;
      if (dst.status === "Reserved") {
        toast.error("Transfer blocked", { description: "The destination table is Reserved." });
        return;
      }
      const destOccupied = ["Running", "Bill Generated", "Held"].includes(dst.status);
      if (destOccupied && o.tableId) {
        value.mergeTables(o.tableId, destTableId);
        return;
      }
      const sourceTableId = o.tableId;
      const destLabel = tableLabel(destTableId);
      patch((p) => ({
        ...p,
        orders: p.orders.map((x) =>
          x.id === orderId ? { ...x, tableId: destTableId, tableLabel: destLabel } : x,
        ),
        kots: p.kots.map((k) => (k.orderId === orderId ? { ...k, tableLabel: destLabel } : k)),
        tables: p.tables.map((t) => {
          if (t.id === sourceTableId)
            return {
              ...t,
              status: "Free" as const,
              guests: undefined,
              orderId: undefined,
              occupiedSince: undefined,
            };
          if (t.id === destTableId)
            return {
              ...t,
              status: o.status === "Bill Generated" ? ("Bill Generated" as const) : ("Running" as const),
              guests: o.guests,
              orderId: o.id,
              occupiedSince: nowStamp(),
            };
          return t;
        }),
      }));
      log("Table Transferred", `${o.tableLabel} → ${destLabel}`, o.tableLabel, destLabel);
      toast.success(`Order moved to ${destLabel}`, { description: "Transfers cannot be reversed." });
    },

    setKotStatus: (kotId, status) => {
      patch((p) => ({
        ...p,
        kots: p.kots.map((k) => (k.id === kotId ? { ...k, status } : k)),
      }));
      toast.success(`KOT marked ${status}`);
    },

    addReservation: (r) => {
      const id = uid("r");
      patch((p) => ({
        ...p,
        reservations: [{ ...r, id }, ...p.reservations],
        tables: p.tables.map((t) =>
          t.id === r.tableId && t.status === "Free"
            ? { ...t, status: "Reserved", reservationId: id }
            : t,
        ),
        customers: p.customers.some((c) => c.phone === r.mobile)
          ? p.customers
          : [
              { id: uid("c"), name: r.customerName, phone: r.mobile, orders: 0, lastVisit: r.date },
              ...p.customers,
            ],
      }));
      toast.success("Reservation created", {
        description: `${r.customerName} · ${r.party} guests · ${r.tableLabel} · ${r.time}`,
      });
    },

    setReservationStatus: (id, status) => {
      const r = s.reservations.find((x) => x.id === id);
      patch((p) => ({
        ...p,
        reservations: p.reservations.map((x) => (x.id === id ? { ...x, status } : x)),
        tables: p.tables.map((t) => {
          if (t.id !== r?.tableId) return t;
          if (status === "Seated")
            return { ...t, status: "Running", guests: r?.party, reservationId: undefined };
          if (["Cancelled", "No Show", "Completed"].includes(status))
            return { ...t, status: "Free", reservationId: undefined };
          if (status === "Confirmed") return { ...t, status: "Reserved", reservationId: id };
          return t;
        }),
      }));
      toast.success(`Reservation ${status.toLowerCase()}`, { description: r?.customerName });
    },

    setReleaseMode: (id, mode) =>
      patch((p) => ({
        ...p,
        reservations: p.reservations.map((r) =>
          r.id === id ? { ...r, releaseMode: mode, graceSeconds: mode === "Auto" ? 60 : 900 } : r,
        ),
      })),

    openSession: (float) => {
      const session: CashSession = {
        id: uid("cs"),
        openedAt: nowStamp(),
        openedBy: currentUser?.name ?? "Taj",
        openingFloat: float,
        status: "Open",
        movements: [
          {
            id: uid("cm"),
            type: "Opening",
            amount: float,
            reason: "Opening float",
            at: nowStamp(),
            by: currentUser?.name ?? "Taj",
          },
        ],
      };
      patch((p) => ({ ...p, cashSessions: [session, ...p.cashSessions] }));
      toast.success("Cash session opened", { description: `Opening float ₹${float}` });
    },

    addCash: (amount, reason) => {
      patch((p) => ({
        ...p,
        cashSessions: p.cashSessions.map((cs) =>
          cs.status === "Open"
            ? {
                ...cs,
                movements: [
                  ...cs.movements,
                  {
                    id: uid("cm"),
                    type: "Add" as const,
                    amount,
                    reason,
                    at: nowStamp(),
                    by: currentUser?.name ?? "Taj",
                  },
                ],
              }
            : cs,
        ),
      }));
      toast.success(`₹${amount} added to drawer`, { description: reason });
    },

    withdrawCash: (amount, reason) => {
      const open = s.cashSessions.find((c) => c.status === "Open");
      const balance = open ? open.movements.reduce((sum, m) => sum + m.amount, 0) : 0;
      if (amount > balance) {
        toast.error("Withdrawal blocked", {
          description: `Amount exceeds the drawer balance of ₹${balance}. No override is available.`,
        });
        return false;
      }
      patch((p) => ({
        ...p,
        cashSessions: p.cashSessions.map((cs) =>
          cs.status === "Open"
            ? {
                ...cs,
                movements: [
                  ...cs.movements,
                  {
                    id: uid("cm"),
                    type: "Withdraw" as const,
                    amount: -amount,
                    reason,
                    at: nowStamp(),
                    by: currentUser?.name ?? "Taj",
                  },
                ],
              }
            : cs,
        ),
      }));
      log("Cash Withdrawn", "Cash Session", `₹${balance}`, `₹${balance - amount}`, reason);
      toast.success(`₹${amount} withdrawn`, { description: reason });
      return true;
    },

    attachExpense: (headId, amount, note) => {
      const head = s.expenseHeads.find((h) => h.id === headId);
      patch((p) => ({
        ...p,
        expenses: [
          {
            id: uid("e"),
            headId,
            amount,
            date: todayLabel,
            mode: "Cash",
            note,
            createdBy: currentUser?.name ?? "Taj",
          },
          ...p.expenses,
        ],
        cashSessions: p.cashSessions.map((cs) =>
          cs.status === "Open"
            ? {
                ...cs,
                movements: [
                  ...cs.movements,
                  {
                    id: uid("cm"),
                    type: "Expense" as const,
                    amount: -amount,
                    reason: `${head?.name ?? "Expense"} — ${note}`,
                    at: nowStamp(),
                    by: currentUser?.name ?? "Taj",
                  },
                ],
              }
            : cs,
        ),
      }));
      toast.success("Expense attached to session", { description: `${head?.name} · ₹${amount}` });
    },

    closeSession: (counted, reason) => {
      const open = s.cashSessions.find((c) => c.status === "Open");
      if (!open) return;
      const expected = open.movements.reduce((sum, m) => sum + m.amount, 0);
      patch((p) => ({
        ...p,
        cashSessions: p.cashSessions.map((cs) =>
          cs.id === open.id
            ? {
                ...cs,
                status: "Closed",
                closedAt: nowStamp(),
                countedCash: counted,
                variance: counted - expected,
                ...(reason ? { varianceReason: reason } : {}),
              }
            : cs,
        ),
      }));
      log("Cash Session Closed", open.id, `Expected ₹${expected}`, `Counted ₹${counted}`, reason);
      toast.success("Cash session closed", {
        description:
          counted === expected
            ? "No variance recorded."
            : `Variance ₹${counted - expected} recorded with explanation.`,
      });
    },

    sessionBalance: () => {
      const open = s.cashSessions.find((c) => c.status === "Open");
      return open ? open.movements.reduce((sum, m) => sum + m.amount, 0) : 0;
    },
    openSessionRecord: () => s.cashSessions.find((c) => c.status === "Open"),

    upsertMenuItem: (item) => {
      patch((p) => ({
        ...p,
        menuItems: p.menuItems.some((m) => m.id === item.id)
          ? p.menuItems.map((m) => (m.id === item.id ? item : m))
          : [{ ...item, id: item.id || uid("m") }, ...p.menuItems],
      }));
      toast.success("Menu item saved", { description: item.name });
    },
    removeMenuItem: (id) => {
      patch((p) => ({ ...p, menuItems: p.menuItems.filter((m) => m.id !== id) }));
      toast.success("Menu item removed");
    },
    upsertMenuCategory: (c) => {
      patch((p) => ({
        ...p,
        menuCategories: p.menuCategories.some((x) => x.id === c.id)
          ? p.menuCategories.map((x) => (x.id === c.id ? c : x))
          : [...p.menuCategories, { ...c, id: c.id || uid("mc") }],
      }));
      toast.success("Category saved", { description: c.name });
    },
    upsertTable: (t) => {
      patch((p) => ({
        ...p,
        tables: p.tables.some((x) => x.id === t.id)
          ? p.tables.map((x) => (x.id === t.id ? t : x))
          : [...p.tables, { ...t, id: t.id || uid("t") }],
      }));
      toast.success("Table saved", { description: t.name });
    },
    removeTable: (id) => {
      patch((p) => ({ ...p, tables: p.tables.filter((t) => t.id !== id) }));
      toast.success("Table removed");
    },
    upsertTableCategory: (c) => {
      patch((p) => ({
        ...p,
        tableCategories: p.tableCategories.some((x) => x.id === c.id)
          ? p.tableCategories.map((x) => (x.id === c.id ? c : x))
          : [...p.tableCategories, { ...c, id: c.id || uid("tc") }],
      }));
      toast.success("Table category saved");
    },
    upsertUser: (u) => {
      patch((p) => ({
        ...p,
        users: p.users.some((x) => x.id === u.id)
          ? p.users.map((x) => (x.id === u.id ? u : x))
          : [...p.users, { ...u, id: u.id || uid("u") }],
      }));
      log("User Saved", u.name, "—", `${u.role} · ${u.status}`);
      toast.success("User saved", { description: `${u.name} · ${u.role}` });
    },
    upsertExpense: (e) => {
      patch((p) => ({
        ...p,
        expenses: p.expenses.some((x) => x.id === e.id)
          ? p.expenses.map((x) => (x.id === e.id ? e : x))
          : [{ ...e, id: e.id || uid("e") }, ...p.expenses],
      }));
      toast.success("Expense saved");
    },
    upsertExpenseHead: (h) => {
      patch((p) => ({
        ...p,
        expenseHeads: p.expenseHeads.some((x) => x.id === h.id)
          ? p.expenseHeads.map((x) => (x.id === h.id ? h : x))
          : [...p.expenseHeads, { ...h, id: h.id || uid("eh") }],
      }));
      toast.success("Expense head saved");
    },
    upsertRawMaterial: (m) => {
      patch((p) => ({
        ...p,
        rawMaterials: p.rawMaterials.some((x) => x.id === m.id)
          ? p.rawMaterials.map((x) => (x.id === m.id ? m : x))
          : [...p.rawMaterials, { ...m, id: m.id || uid("rm") }],
      }));
      toast.success("Raw material saved");
    },
    upsertSupplier: (sup) => {
      patch((p) => ({
        ...p,
        suppliers: p.suppliers.some((x) => x.id === sup.id)
          ? p.suppliers.map((x) => (x.id === sup.id ? sup : x))
          : [...p.suppliers, { ...sup, id: sup.id || uid("s") }],
      }));
      toast.success("Supplier saved");
    },
    upsertPurchaseOrder: (po) => {
      patch((p) => ({
        ...p,
        purchaseOrders: p.purchaseOrders.some((x) => x.id === po.id)
          ? p.purchaseOrders.map((x) => (x.id === po.id ? po : x))
          : [{ ...po, id: po.id || uid("po") }, ...p.purchaseOrders],
      }));
      toast.success("Purchase order saved", { description: po.poNo });
    },
    receivePurchaseOrder: (id) => {
      const po = s.purchaseOrders.find((x) => x.id === id);
      if (!po) return;
      patch((p) => ({
        ...p,
        purchaseOrders: p.purchaseOrders.map((x) =>
          x.id === id ? { ...x, status: "Received" } : x,
        ),
        rawMaterials: p.rawMaterials.map((m) => {
          const l = po.lines.find((x) => x.materialId === m.id);
          return l ? { ...m, stock: m.stock + l.qty * m.conversion } : m;
        }),
      }));
      log("Purchase Received", po.poNo, "Ordered", "Received");
      toast.success(`${po.poNo} received`, { description: "Stock levels updated." });
    },
    addWastage: (w) => {
      patch((p) => ({
        ...p,
        wastages: [{ ...w, id: uid("w") }, ...p.wastages],
        rawMaterials: p.rawMaterials.map((m) =>
          m.id === w.materialId ? { ...m, stock: Math.max(0, m.stock - w.qty) } : m,
        ),
      }));
      toast.success("Wastage recorded");
    },
    produceSemiFinished: (id, batches) => {
      const sf = s.semiFinished.find((x) => x.id === id);
      if (!sf) return;
      patch((p) => ({
        ...p,
        semiFinished: p.semiFinished.map((x) =>
          x.id === id ? { ...x, stock: x.stock + x.batchQty * batches } : x,
        ),
        rawMaterials: p.rawMaterials.map((m) => {
          const c = sf.components.find((x) => x.materialId === m.id);
          return c ? { ...m, stock: Math.max(0, m.stock - c.qty * batches) } : m;
        }),
      }));
      toast.success("Production recorded", {
        description: `${batches} × ${sf.batchQty} ${sf.unit} of ${sf.name}`,
      });
    },

    /* ---------------- stock module ---------------- */
    upsertUnit: (u) => {
      patch((p) => ({
        ...p,
        units: p.units.some((x) => x.id === u.id)
          ? p.units.map((x) => (x.id === u.id ? u : x))
          : [...p.units, { ...u, id: u.id || uid("u") }],
      }));
      toast.success("Unit saved");
    },
    poTotals,
    savePurchase: (po, opts) => {
      const receive = opts?.receive ?? po.status === "Received";
      const totals = poTotals(po);
      const who = currentUser?.name ?? "Taj";
      const isNew = !s.purchaseOrders.some((x) => x.id === po.id);
      const id = po.id || uid("po");
      const record: PurchaseOrder = { ...po, id, status: receive ? "Received" : po.status };
      patch((p) => {
        const already = p.purchaseOrders.find((x) => x.id === id);
        const wasReceived = already?.status === "Received";
        const applyStock = receive && !wasReceived;
        const moves: StockMovement[] = [];
        const rawMaterials = p.rawMaterials.map((m) => {
          const l = record.lines.find((x) => x.materialId === m.id);
          if (!l || !applyStock) return m;
          const inQty = l.qty * m.conversion;
          const inCost = l.rate / m.conversion;
          const newStock = m.stock + inQty;
          // weighted average costing
          const rate =
            newStock > 0 ? (m.stock * m.rate + inQty * inCost) / newStock : inCost;
          moves.push(
            movement("Purchase", "raw", m.id, inQty, l.qty * l.rate, record.poNo, who),
          );
          return { ...m, stock: newStock, rate: Math.round(rate * 10000) / 10000 };
        });
        const due = Math.max(0, totals.grand - (record.paidAmount ?? 0));
        const prevDue = already
          ? Math.max(0, poTotals(already).grand - (already.paidAmount ?? 0))
          : 0;
        return {
          ...p,
          purchaseOrders: already
            ? p.purchaseOrders.map((x) => (x.id === id ? record : x))
            : [record, ...p.purchaseOrders],
          rawMaterials,
          stockMovements: [...moves, ...p.stockMovements],
          suppliers: p.suppliers.map((sup) =>
            sup.id === record.supplierId
              ? { ...sup, outstanding: Math.max(0, sup.outstanding - prevDue + due) }
              : sup,
          ),
        };
      });
      log(isNew ? "Purchase Created" : "Purchase Updated", record.poNo, "—", record.status);
      toast.success(receive ? `${record.poNo} received` : `${record.poNo} saved`, {
        description: receive
          ? "Stock, supplier outstanding and reports updated."
          : "Draft saved. Stock updates on receipt.",
      });
    },
    payPurchaseOrder: (id, amount) => {
      const po = s.purchaseOrders.find((x) => x.id === id);
      if (!po) return;
      const grand = poTotals(po).grand;
      const paid = Math.min(grand, (po.paidAmount ?? 0) + amount);
      patch((p) => ({
        ...p,
        purchaseOrders: p.purchaseOrders.map((x) =>
          x.id === id
            ? {
                ...x,
                paidAmount: paid,
                paymentStatus: paid >= grand ? "Paid" : paid > 0 ? "Partial" : "Unpaid",
              }
            : x,
        ),
        suppliers: p.suppliers.map((sup) =>
          sup.id === po.supplierId
            ? { ...sup, outstanding: Math.max(0, sup.outstanding - amount) }
            : sup,
        ),
      }));
      toast.success("Payment recorded", { description: `${po.poNo} · ₹${amount}` });
    },
    cancelPurchaseOrder: (id) => {
      const po = s.purchaseOrders.find((x) => x.id === id);
      if (!po) return;
      const due = Math.max(0, poTotals(po).grand - (po.paidAmount ?? 0));
      patch((p) => ({
        ...p,
        purchaseOrders: p.purchaseOrders.map((x) =>
          x.id === id ? { ...x, status: "Cancelled" } : x,
        ),
        suppliers: p.suppliers.map((sup) =>
          sup.id === po.supplierId
            ? { ...sup, outstanding: Math.max(0, sup.outstanding - due) }
            : sup,
        ),
      }));
      toast.success(`${po.poNo} cancelled`);
    },
    saveStockCount: (rows, note) => {
      const who = currentUser?.name ?? "Taj";
      const changed = rows.filter((r) => {
        const m = s.rawMaterials.find((x) => x.id === r.materialId);
        return m && Math.abs(m.stock - r.countedQty) > 0.0001;
      });
      if (!changed.length) {
        toast.info("Nothing to save", { description: "No counted quantity differs from system stock." });
        return;
      }
      patch((p) => {
        const adjustments: StockAdjustment[] = [];
        const moves: StockMovement[] = [];
        const rawMaterials = p.rawMaterials.map((m) => {
          const r = changed.find((x) => x.materialId === m.id);
          if (!r) return m;
          const variance = r.countedQty - m.stock;
          adjustments.push({
            id: uid("sa"),
            materialId: m.id,
            systemQty: m.stock,
            countedQty: r.countedQty,
            variance,
            value: Math.round(variance * m.rate * 100) / 100,
            date: todayLabel,
            by: who,
            ...(note ? { note } : {}),
          });
          moves.push(
            movement("Adjustment", "raw", m.id, variance, variance * m.rate, note ?? "Physical count", who),
          );
          return { ...m, stock: r.countedQty };
        });
        return {
          ...p,
          rawMaterials,
          stockAdjustments: [...adjustments, ...p.stockAdjustments],
          stockMovements: [...moves, ...p.stockMovements],
        };
      });
      log("Stock Reconciled", `${changed.length} materials`, "System stock", "Physical count");
      toast.success(`${changed.length} row${changed.length > 1 ? "s" : ""} reconciled`, {
        description: "Current stock and adjustment history updated.",
      });
    },
    addWastageBatch: (rows) => {
      const who = currentUser?.name ?? "Taj";
      const valid = rows.filter((r) => r.materialId && r.qty > 0);
      if (!valid.length) {
        toast.error("Add at least one wastage row");
        return;
      }
      patch((p) => {
        const moves: StockMovement[] = [];
        const entries: Wastage[] = [];
        const rawMaterials = p.rawMaterials.map((m) => {
          const mine = valid.filter((r) => r.materialId === m.id);
          if (!mine.length) return m;
          let stock = m.stock;
          mine.forEach((r) => {
            stock = Math.max(0, stock - r.qty);
            entries.push({
              id: uid("w"),
              materialId: m.id,
              qty: r.qty,
              reason: r.reason || "Not specified",
              date: todayLabel,
              recordedBy: who,
              cost: Math.round(r.qty * m.rate * 100) / 100,
              ...(r.notes ? { notes: r.notes } : {}),
            });
            moves.push(movement("Wastage", "raw", m.id, -r.qty, -r.qty * m.rate, r.reason || "Wastage", who));
          });
          return { ...m, stock };
        });
        return {
          ...p,
          rawMaterials,
          wastages: [...entries, ...p.wastages],
          stockMovements: [...moves, ...p.stockMovements],
        };
      });
      toast.success(`Wastage posted for ${valid.length} item${valid.length > 1 ? "s" : ""}`, {
        description: "Stock reduced and cost captured.",
      });
    },
    upsertSemiFinished: (sf) => {
      patch((p) => ({
        ...p,
        semiFinished: p.semiFinished.some((x) => x.id === sf.id)
          ? p.semiFinished.map((x) => (x.id === sf.id ? sf : x))
          : [...p.semiFinished, { ...sf, id: sf.id || uid("sf") }],
      }));
      toast.success("Semi-finished item saved");
    },
    removeSemiFinished: (id) => {
      patch((p) => ({ ...p, semiFinished: p.semiFinished.filter((x) => x.id !== id) }));
      toast.success("Semi-finished item deleted");
    },
    semiUnitCost,
    recordProduction: (semiId, qty, notes) => {
      const sf = s.semiFinished.find((x) => x.id === semiId);
      if (!sf || qty <= 0) return;
      const who = currentUser?.name ?? "Taj";
      const cost = semiUnitCost(semiId) * qty;
      patch((p) => {
        const moves: StockMovement[] = [];
        const rawMaterials = p.rawMaterials.map((m) => {
          const c = sf.components.find((x) => x.materialId === m.id);
          if (!c) return m;
          const used = c.qty * qty;
          moves.push(movement("Production Out", "raw", m.id, -used, -used * m.rate, sf.name, who));
          return { ...m, stock: Math.max(0, m.stock - used) };
        });
        moves.push(movement("Production In", "semi", sf.id, qty, cost, "Production run", who));
        return {
          ...p,
          rawMaterials,
          semiFinished: p.semiFinished.map((x) =>
            x.id === semiId ? { ...x, stock: Math.round((x.stock + qty) * 1000) / 1000 } : x,
          ),
          productionRuns: [
            {
              id: uid("pr"),
              semiId,
              qty,
              cost: Math.round(cost * 100) / 100,
              at: nowStamp(),
              by: who,
              ...(notes ? { notes } : {}),
            },
            ...p.productionRuns,
          ],
          stockMovements: [...moves, ...p.stockMovements],
        };
      });
      log("Production Recorded", sf.name, "—", `${qty} ${sf.unit}`);
      toast.success("Production recorded", {
        description: `${qty} ${sf.unit} of ${sf.name} · raw materials consumed`,
      });
    },
    upsertRecipe: (r) => {
      patch((p) => ({
        ...p,
        recipes: p.recipes.some((x) => x.id === r.id)
          ? p.recipes.map((x) => (x.id === r.id ? r : x))
          : [...p.recipes, { ...r, id: r.id || uid("rc") }],
      }));
      toast.success("Recipe saved", { description: r.itemName });
    },
    removeRecipe: (id) => {
      patch((p) => ({ ...p, recipes: p.recipes.filter((x) => x.id !== id) }));
      toast.success("Recipe deleted");
    },
    recipeGroupCost: (g) =>
      Math.round(
        g.lines.reduce((sum, l) => {
          if (l.type === "raw") {
            const m = s.rawMaterials.find((x) => x.id === l.refId);
            return sum + (m ? m.rate * l.qty : 0);
          }
          return sum + semiUnitCost(l.refId) * l.qty;
        }, 0) * 100,
      ) / 100,
    createRequisition: (items, remarks) => {
      const valid = items.filter((i) => i.orderedQty > 0);
      if (!valid.length) {
        toast.error("Add at least one material");
        return;
      }
      const no = `REQ-2026-${String(
        Math.max(
          ...s.requisitions.map((r) => Number(r.reqNo.split("-").pop())).filter((n) => !Number.isNaN(n)),
          0,
        ) + 1,
      ).padStart(3, "0")}`;
      patch((p) => ({
        ...p,
        requisitions: [
          {
            id: uid("fr"),
            reqNo: no,
            date: todayLabel,
            status: "Pending",
            raisedBy: currentUser?.name ?? "Taj",
            items: valid,
            ...(remarks ? { remarks } : {}),
          },
          ...p.requisitions,
        ],
      }));
      toast.success("Requisition placed", { description: `${no} · awaiting merchant approval` });
    },
    setRequisitionStatus: (id, status) => {
      patch((p) => ({
        ...p,
        requisitions: p.requisitions.map((r) => (r.id === id ? { ...r, status } : r)),
      }));
      toast.success(`Requisition ${status.toLowerCase()}`);
    },
    setRequisitionQty: (id, materialId, qty) =>
      patch((p) => ({
        ...p,
        requisitions: p.requisitions.map((r) =>
          r.id === id
            ? {
                ...r,
                items: r.items.map((i) =>
                  i.materialId === materialId ? { ...i, orderedQty: Math.max(0, qty) } : i,
                ),
              }
            : r,
        ),
      })),
    removeRequisition: (id) => {
      patch((p) => ({ ...p, requisitions: p.requisitions.filter((r) => r.id !== id) }));
      toast.success("Requisition deleted");
    },
    fulfilRequisition: (id) => {
      const req = s.requisitions.find((r) => r.id === id);
      if (!req || req.purchaseOrderId) return;
      const poId = uid("po");
      const poNo = `PO-2026-${String(
        Math.max(
          ...s.purchaseOrders
            .map((x) => Number(x.poNo.split("-").pop()))
            .filter((n) => !Number.isNaN(n)),
          0,
        ) + 1,
      ).padStart(3, "0")}`;
      const who = currentUser?.name ?? "Taj";
      const supplierId = s.suppliers[0]?.id ?? "s1";
      const po: PurchaseOrder = {
        id: poId,
        poNo,
        supplierId,
        date: todayLabel,
        status: "Received",
        paymentStatus: "Unpaid",
        paidAmount: 0,
        requisitionId: req.id,
        lines: req.items.map((i) => ({
          materialId: i.materialId,
          qty: i.approvedQty ?? i.orderedQty,
          rate: i.unitPrice,
          taxPct: 5,
        })),
      };
      const due = poTotals(po).grand;
      patch((p) => {
        const moves: StockMovement[] = [];
        const rawMaterials = p.rawMaterials.map((m) => {
          const l = po.lines.find((x) => x.materialId === m.id);
          if (!l) return m;
          const inQty = l.qty * m.conversion;
          moves.push(movement("Purchase", "raw", m.id, inQty, l.qty * l.rate, poNo, who));
          return { ...m, stock: m.stock + inQty };
        });
        return {
          ...p,
          rawMaterials,
          purchaseOrders: [po, ...p.purchaseOrders],
          stockMovements: [...moves, ...p.stockMovements],
          requisitions: p.requisitions.map((r) =>
            r.id === id ? { ...r, status: "Delivered", purchaseOrderId: poId } : r,
          ),
          suppliers: p.suppliers.map((sup) =>
            sup.id === supplierId ? { ...sup, outstanding: sup.outstanding + due } : sup,
          ),
        };
      });
      toast.success("Requisition fulfilled", { description: `${poNo} created and stock received` });
    },

    setConnection: (state) => {
      patch((p) => ({ ...p, connection: state }));
      if (state === "online") {
        patch((p) => ({ ...p, connection: "syncing" }));
        setTimeout(() => {
          set((p) => ({
            ...p,
            connection: "online",
            syncItems: p.syncItems.map((i) =>
              i.status === "Pending" ? { ...i, status: "Synced" } : i,
            ),
          }));
          toast.success("All changes synced");
        }, 1600);
      }
    },
    syncNow: () => {
      patch((p) => ({ ...p, connection: "syncing" }));
      setTimeout(() => {
        set((p) => ({
          ...p,
          connection: "online",
          syncItems: p.syncItems.map((i) =>
            i.status === "Pending" ? { ...i, status: "Synced" } : i,
          ),
        }));
        toast.success("Sync complete", { description: "Local server is up to date." });
      }, 1600);
    },
    retrySync: (id) => {
      setTimeout(() => {
        set((p) => ({
          ...p,
          syncItems: p.syncItems.map((i) =>
            (id ? i.id === id : i.status === "Failed") && i.status !== "Conflict"
              ? { ...i, status: "Synced" }
              : i,
          ),
        }));
        toast.success(id ? "Record synced" : "All failed records retried");
      }, 900);
    },
    resolveConflict: (id) => {
      patch((p) => ({
        ...p,
        syncItems: p.syncItems.map((i) => (i.id === id ? { ...i, status: "Synced" } : i)),
      }));
      toast.success("Conflict resolved", { description: "Local version kept and pushed." });
    },
    setDeviceStatus: (id, status) => {
      patch((p) => ({ ...p, devices: p.devices.map((d) => (d.id === id ? { ...d, status } : d)) }));
      toast.success(`Device ${status.toLowerCase()}`);
    },
    renameDevice: (id, name) => {
      patch((p) => ({ ...p, devices: p.devices.map((d) => (d.id === id ? { ...d, name } : d)) }));
      toast.success("Device renamed");
    },
    deregisterDevice: (id) => {
      patch((p) => ({ ...p, devices: p.devices.filter((d) => d.id !== id) }));
      toast.success("Device deregistered");
    },
    upsertPrinter: (pr) => {
      patch((p) => ({
        ...p,
        printers: p.printers.some((x) => x.id === pr.id)
          ? p.printers.map((x) => (x.id === pr.id ? pr : x))
          : [...p.printers, { ...pr, id: pr.id || uid("p") }],
      }));
      toast.success("Printer saved", { description: pr.name });
    },
    markNotificationRead: (id) =>
      patch((p) => ({
        ...p,
        notifications: p.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),
    markAllNotificationsRead: () =>
      patch((p) => ({
        ...p,
        notifications: p.notifications.map((n) => ({ ...n, read: true })),
      })),
    toggleNotificationSetting: (trigger, channel) =>
      patch((p) => ({
        ...p,
        notificationSettings: p.notificationSettings.map((n) =>
          n.trigger === trigger ? { ...n, [channel]: !n[channel] } : n,
        ),
      })),
    toggleApprovalRule: (id) =>
      patch((p) => ({
        ...p,
        approvalRules: p.approvalRules.map((r) =>
          r.id === id && !r.locked ? { ...r, enabled: !r.enabled } : r,
        ),
      })),
    updateApprovalThreshold: (id, threshold, approver) => {
      patch((p) => ({
        ...p,
        approvalRules: p.approvalRules.map((r) =>
          r.id === id ? { ...r, threshold, approver } : r,
        ),
      }));
      toast.success("Approval rule updated");
    },
    setDeliverySettings: (delivery, packaging) => {
      patch((p) => ({ ...p, deliveryCharge: delivery, packagingCharge: packaging }));
      toast.success("Charge settings saved");
    },
    setServiceCharge: (rule) => {
      patch((p) => ({ ...p, serviceCharge: rule }));
      toast.success("Service charge rule saved");
    },
    upsertTaxRule: (rule) => {
      patch((p) => ({
        ...p,
        taxRules: p.taxRules.some((t) => t.id === rule.id)
          ? p.taxRules.map((t) => (t.id === rule.id ? rule : t))
          : [...p.taxRules, { ...rule, id: rule.id || uid("tax") }],
      }));
      toast.success("Tax rule saved", { description: rule.name });
    },
    removeTaxRule: (id) => {
      patch((p) => ({ ...p, taxRules: p.taxRules.filter((t) => t.id !== id) }));
      toast.success("Tax rule removed", {
        description: "Prototype only — the live delete endpoint needs a backend fix.",
      });
    },
    toggleTaxRule: (id) =>
      patch((p) => ({
        ...p,
        taxRules: p.taxRules.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
      })),
    setInvoiceFormat: (fmt) => {
      patch((p) => ({ ...p, invoiceFormat: fmt }));
      toast.success("Invoice format saved");
    },
    setGstCalculation: (on) => {
      patch((p) => ({ ...p, invoiceFormat: { ...p.invoiceFormat, gstCalculation: on } }));
      toast[on ? "success" : "warning"](
        on ? "GST calculation enabled" : "GST calculation disabled",
        {
          description: on
            ? "Active tax rules now calculate on bills."
            : "Configured tax rules will not calculate on bills.",
        },
      );
    },
    upsertPromo: (promo) => {
      patch((p) => ({
        ...p,
        promoCodes: p.promoCodes.some((x) => x.id === promo.id)
          ? p.promoCodes.map((x) => (x.id === promo.id ? promo : x))
          : [...p.promoCodes, { ...promo, id: promo.id || uid("pr") }],
      }));
      toast.success("Promo code saved", { description: promo.code });
    },
    togglePromo: (id) =>
      patch((p) => ({
        ...p,
        promoCodes: p.promoCodes.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
      })),
    upsertKitchen: (kitchen) => {
      patch((p) => ({
        ...p,
        kitchens: p.kitchens.some((k) => k.id === kitchen.id)
          ? p.kitchens.map((k) => (k.id === kitchen.id ? kitchen : k))
          : [...p.kitchens, { ...kitchen, id: kitchen.id || uid("k") }],
      }));
      toast.success("Kitchen saved", { description: kitchen.name });
    },
    removeKitchen: (id) => {
      patch((p) => ({ ...p, kitchens: p.kitchens.filter((k) => k.id !== id) }));
      toast.success("Kitchen removed");
    },
    removePrinter: (id) => {
      patch((p) => ({ ...p, printers: p.printers.filter((x) => x.id !== id) }));
      toast.success("Printer removed");
    },
    setDisplayMode: (mode) => {
      patch((p) => ({ ...p, displayMode: mode }));
      toast.success(`${mode} layout applied to this terminal`);
    },
    setMenuImages: (on) => {
      patch((p) => ({ ...p, menuImages: on }));
      toast.success(on ? "Item grid shows images" : "Item grid shows a compact list");
    },
    upsertCustomer: (customer) => {
      patch((p) => ({
        ...p,
        customers: p.customers.some((c) => c.id === customer.id)
          ? p.customers.map((c) => (c.id === customer.id ? customer : c))
          : [{ ...customer, id: customer.id || uid("c") }, ...p.customers],
      }));
      toast.success("Customer saved", { description: customer.name });
    },
    toggleCustomer: (id) =>
      patch((p) => ({
        ...p,
        customers: p.customers.map((c) =>
          c.id === id ? { ...c, active: c.active === false } : c,
        ),
      })),
    settleDueBills: (ids, mode) => {
      patch((p) => ({
        ...p,
        dueBills: p.dueBills.map((b) =>
          ids.includes(b.id) && b.status === "Due"
            ? { ...b, status: "Settled", settledMode: mode }
            : b,
        ),
      }));
      toast.success(
        ids.length > 1 ? `${ids.length} bills settled by ${mode}` : `Bill settled by ${mode}`,
      );
    },
    setMaxOfflineDays: (days) => {
      patch((p) => ({ ...p, maxOfflineDays: days }));
      toast.success(`Maximum offline duration set to ${days} day(s)`);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
