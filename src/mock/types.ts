export type Role =
  | "Owner"
  | "Manager"
  | "Cashier"
  | "Captain"
  | "Kitchen Staff"
  | "Inventory Manager"
  | "Accountant";

export interface User {
  id: string;
  name: string;
  role: Role;
  mobile: string;
  email: string;
  status: "Active" | "Inactive";
  pin: string;
}

export type TableStatus = "Free" | "Held" | "Running" | "Bill Generated" | "Reserved";

export interface TableCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface RestaurantTable {
  id: string;
  name: string;
  categoryId: string;
  seats: number;
  status: TableStatus;
  guests?: number;
  orderId?: string;
  reservationId?: string;
  occupiedSince?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  itemCount?: number;
  active: boolean;
}

export interface VariantOption {
  id: string;
  name: string;
  price: number;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export interface AddonGroup {
  id: string;
  name: string;
  min: number;
  max: number;
  selection: "Single" | "Multiple";
  options: AddonOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  favourite: boolean;
  active: boolean;
  veg: boolean;
  station: "Kitchen" | "Tandoor" | "Chinese" | "Beverages" | "Dessert";
  variants?: VariantOption[];
  addonGroupIds?: string[];
}

export type OrderType = "Dine In" | "Pickup";
export type OrderStatus = "Held" | "Running" | "Bill Generated" | "Settled" | "Cancelled";
export type PaymentMode = "Cash" | "Card" | "UPI" | "Due" | "Split";

export interface OrderLine {
  id: string;
  itemId: string;
  name: string;
  qty: number;
  price: number;
  variant?: string;
  addons?: { name: string; price: number }[];
  kotRound: number;
  originTable?: string;
  note?: string;
}

export interface PaymentSplit {
  mode: Exclude<PaymentMode, "Split">;
  amount: number;
}

export interface Order {
  id: string;
  orderNo: number;
  type: OrderType;
  tableId?: string;
  tableLabel: string;
  guests: number;
  status: OrderStatus;
  lines: OrderLine[];
  kotRounds: number;
  customerName?: string;
  customerPhone?: string;
  discount?: { label: string; amount: number; approvalFlagged?: boolean };
  deliveryCharge?: number;
  packagingCharge?: number;
  payments?: PaymentSplit[];
  paymentMode?: PaymentMode;
  businessDate: string;
  createdAt: string;
  settledAt?: string;
  createdBy: string;
  mergedFrom?: string[];
  itemised: boolean;
  fallbackTotal?: number;
}

export type KotStatus =
  | "Pending"
  | "Printed"
  | "Accepted"
  | "Preparing"
  | "Ready"
  | "Served"
  | "Cancelled";

export interface Kot {
  id: string;
  kotNo: number;
  orderId: string;
  tableLabel: string;
  round: number;
  station: MenuItem["station"];
  status: KotStatus;
  createdAt: string;
  items: { name: string; qty: number; note?: string }[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  orders: number;
  lastVisit: string;
}

export type ReservationStatus =
  | "Booked"
  | "Confirmed"
  | "Seated"
  | "Completed"
  | "Cancelled"
  | "No Show";

export interface Reservation {
  id: string;
  customerName: string;
  mobile: string;
  party: number;
  tableId: string;
  tableLabel: string;
  date: string;
  time: string;
  status: ReservationStatus;
  releaseMode: "Manual" | "Auto";
  graceSeconds: number;
  note?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  purchaseUnit: string;
  conversion: number;
  stock: number;
  reorderLevel: number;
  rate: number;
  category: string;
}

export interface Recipe {
  id: string;
  itemName: string;
  yieldQty: number;
  yieldUnit: string;
  components: { materialId: string; qty: number }[];
}

export interface SemiFinished {
  id: string;
  name: string;
  unit: string;
  batchQty: number;
  stock: number;
  components: { materialId: string; qty: number }[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  gstin: string;
  outstanding: number;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierId: string;
  date: string;
  status: "Draft" | "Ordered" | "Received" | "Partially Received";
  lines: { materialId: string; qty: number; rate: number }[];
}

export interface Wastage {
  id: string;
  materialId: string;
  qty: number;
  reason: string;
  date: string;
  recordedBy: string;
}

export interface ExpenseHead {
  id: string;
  name: string;
  type: "Fixed" | "Variable";
  active: boolean;
}

export interface Expense {
  id: string;
  headId: string;
  amount: number;
  date: string;
  mode: "Cash" | "Bank" | "UPI";
  note: string;
  createdBy: string;
}

export interface CashMovement {
  id: string;
  type: "Opening" | "Add" | "Withdraw" | "Expense" | "Settlement";
  amount: number;
  reason: string;
  at: string;
  by: string;
}

export interface CashSession {
  id: string;
  openedAt: string;
  openedBy: string;
  openingFloat: number;
  status: "Open" | "Closed";
  movements: CashMovement[];
  closedAt?: string;
  countedCash?: number;
  variance?: number;
  varianceReason?: string;
}

export type ConnectionState =
  | "online"
  | "offline"
  | "syncing"
  | "sync-error"
  | "conflict"
  | "local-server-down"
  | "offline-limit-exceeded";

export interface Device {
  id: string;
  name: string;
  type: "POS Terminal" | "Tablet" | "KDS Screen" | "Mobile";
  status: "Online" | "Offline" | "Blocked";
  lastSeen: string;
  ip: string;
  registeredOn: string;
}

export interface Printer {
  id: string;
  name: string;
  type: "Thermal 80mm" | "Thermal 58mm" | "A4 Laser";
  connection: "LAN" | "USB" | "Bluetooth";
  role: "Bill" | "KOT" | "Both";
  categories: string[];
  status: "Ready" | "Offline" | "Paper Out";
}

export interface SyncItem {
  id: string;
  entity: string;
  reference: string;
  action: string;
  status: "Pending" | "Synced" | "Failed" | "Conflict";
  conflictTier?: "Auto-Resolved" | "Needs Review";
  queuedAt: string;
  device: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "order" | "stock" | "sync" | "cash" | "system";
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  before: string;
  after: string;
  device: string;
  ip: string;
  at: string;
  reason?: string;
}

export interface NotificationSetting {
  trigger: string;
  whatsapp: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface ApprovalRule {
  id: string;
  domain: string;
  threshold: string;
  approver: Role;
  enabled: boolean;
  locked: boolean;
  note?: string;
}
