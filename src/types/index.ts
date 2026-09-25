export type Role = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  pin?: string;
  permissions?: string[];
  lastLogin?: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  pin?: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'split';
export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number; // e.g. 0.018 for 18g espresso beans
  unit: string;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  price: number;
  cost: number;
  image: string;
  description?: string;
  recipe: RecipeIngredient[];
  availableSizes?: { name: string; priceDelta: number }[];
  availableAddons?: { name: string; price: number }[];
  isAvailable?: boolean;
}

export interface CafeSettings {
  cafeName: string;
  cafeNameAr: string;
  tagline: string;
  logoType: 'text' | 'image' | 'initials';
  logoText: string;
  logoImage?: string;
  phone: string;
  address: string;
  currency: string;
  taxNumber?: string;
  commercialRegister?: string;
  taxRate: number;
  taxEnabled: boolean;
  serviceChargeRate: number;
  serviceChargeEnabled: boolean;
  wifiSsid?: string;
  wifiPassword?: string;
  receiptFooterMsg?: string;
  instagramHandle?: string;
  facebookPage?: string;
  ps4SingleRate: number;
  ps4MultiRate: number;
  ps5SingleRate: number;
  ps5MultiRate: number;
}

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedAddons?: string[];
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  items: CartItem[];
  type: OrderType;
  tableId?: string;
  tableName?: string;
  playstationId?: string;
  playstationName?: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  status: OrderStatus;
  timestamp: string; // ISO string
  customerName?: string;
  customerPhone?: string;
}

export type PSModel = 'PS4' | 'PS5';
export type PSMode = 'single' | 'multi'; // فردي / زوجي
export type PSStatus = 'idle' | 'active';

export interface PlayStationDevice {
  id: string;
  deviceNumber: number;
  model: PSModel;
  status: PSStatus;
  mode: PSMode;
  startTime?: string; // ISO timestamp
  elapsedSeconds: number;
  singleHourlyRate: number; // E.g. PS4: 30 EGP/hr, PS5: 40 EGP/hr
  multiHourlyRate: number;  // E.g. PS4: 40 EGP/hr, PS5: 50 EGP/hr
  timeCost: number;
  linkedOrders: CartItem[];
  customerName?: string;
  targetMinutes?: number; // Optional session time limit (e.g. 30, 60, 90, 120 minutes)
  timeLimitReached?: boolean;
}

export type TableStatus = 'empty' | 'busy' | 'reserved';

export interface Table {
  id: string;
  number: number;
  zone: 'internal' | 'outdoor';
  capacity: number;
  status: TableStatus;
  guestCount: number;
  activeOrders: CartItem[];
  openedAt?: string;
}

export type StockStatus = 'available' | 'low' | 'alert' | 'depleted';

export interface InventoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  unit: string; // kg, L, قطعة, علبة
  currentStock: number;
  minAlert: number;
  costPerUnit: number;
  status: StockStatus;
  lastUpdated: string;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: 'sale_deduction' | 'manual_intake' | 'audit_adjustment' | 'waste';
  amount: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  cashier: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'supplies' | 'utilities' | 'maintenance' | 'staff' | 'other';
  amount: number;
  notes?: string;
  cashier: string;
  timestamp: string;
}

export interface Shift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  cashSales: number;
  cardSales: number;
  expensesTotal: number;
  expectedDrawerCash: number;
  actualDrawerCash?: number;
  difference?: number; // عجز أو زيادة
  status: 'open' | 'closed';
  closingNotes?: string;
}

export interface DaySummary {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrder: number;
  cashSales: number;
  cardSales: number;
  totalCost: number;
  expenses: number;
  estimatedProfit: number;
  salesByChannel: {
    dineIn: number;
    takeaway: number;
    delivery: number;
  };
  hourlyTraffic: { hour: string; count: number; sales: number }[];
}

export interface TestResult {
  id: string;
  title: string;
  category: 'auth' | 'pos' | 'inventory' | 'playstation' | 'shift';
  passed: boolean;
  message: string;
  durationMs: number;
  details?: string[];
}

export type NotificationType = 'stock_alert' | 'playstation_timer' | 'system' | 'order';
export type NotificationSeverity = 'warning' | 'danger' | 'info' | 'success';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  targetId?: string; // e.g. productId or psDeviceId
  targetView?: 'inventory' | 'playstation' | 'pos' | 'dashboard';
  severity: NotificationSeverity;
  data?: Record<string, any>;
}
