/**
 * HUB CAFE System - Database Schemas & Data Models
 * Designed for MongoDB (Mongoose) & Firebase Firestore collections
 */

export interface MongoSchemaDefinitions {
  UserSchema: object;
  ProductSchema: object;
  InventorySchema: object;
  OrderSchema: object;
  PlayStationSchema: object;
  TableSchema: object;
  ShiftSchema: object;
  ExpenseSchema: object;
  DayReportSchema: object;
}

// 1. User & Authentication Schema (MongoDB / Firestore)
export const UserSchema = {
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'cashier', 'manager'], default: 'cashier' },
  pinCode: { type: String, required: true }, // 4-digit fast cashier pin
  active: { type: Boolean, default: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
};

// 2. Product & Recipe Schema (Inventory Linkage)
export const ProductSchema = {
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['قهوة ساخنة', 'قهوة مثلجة', 'ماتشا', 'وافل', 'مشروبات منعشة', 'إضافات'],
    required: true 
  },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String },
  availableSizes: [{
    name: { type: String },
    priceDelta: { type: Number, default: 0 }
  }],
  availableAddons: [{
    name: { type: String },
    price: { type: Number }
  }],
  recipe: [{
    inventoryItemId: { type: String, ref: 'Inventory', required: true },
    quantity: { type: Number, required: true }, // e.g. 0.018 for 18g espresso
    unit: { type: String, required: true }      // kg, L, piece
  }],
  inStock: { type: Boolean, default: true },
};

// 3. Inventory & Raw Materials Schema
export const InventorySchema = {
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  unit: { type: String, enum: ['kg', 'L', 'قطعة', 'علبة'], required: true },
  currentStock: { type: Number, required: true, min: 0 },
  minAlert: { type: Number, required: true },
  costPerUnit: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['available', 'low', 'alert', 'depleted'],
    default: 'available' 
  },
  lastUpdated: { type: Date, default: Date.now }
};

// 4. Order Schema (POS & Cashier)
export const OrderSchema = {
  orderNumber: { type: Number, required: true, unique: true },
  type: { type: String, enum: ['dine_in', 'takeaway', 'delivery'], required: true },
  tableId: { type: String, ref: 'Table' },
  playstationId: { type: String, ref: 'PlayStation' },
  items: [{
    productId: { type: String, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String },
    selectedAddons: [{ type: String }],
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    notes: { type: String }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'split'], required: true },
  cashierName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'completed', 'cancelled'], default: 'completed' },
  customerName: { type: String },
  customerPhone: { type: String },
  createdAt: { type: Date, default: Date.now }
};

// 5. PlayStation Session Schema
export const PlayStationSchema = {
  deviceNumber: { type: Number, required: true },
  model: { type: String, enum: ['PS4', 'PS5'], required: true },
  status: { type: String, enum: ['idle', 'active'], default: 'idle' },
  mode: { type: String, enum: ['single', 'multi'], default: 'single' },
  singleHourlyRate: { type: Number, required: true },
  multiHourlyRate: { type: Number, required: true },
  startTime: { type: Date },
  elapsedSeconds: { type: Number, default: 0 },
  timeCost: { type: Number, default: 0 },
  linkedOrders: [{
    productId: { type: String, ref: 'Product' },
    productName: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    totalPrice: { type: Number }
  }],
  customerName: { type: String }
};

// 6. Table & Hall Management Schema
export const TableSchema = {
  number: { type: Number, required: true, unique: true },
  zone: { type: String, enum: ['internal', 'outdoor'], required: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['empty', 'busy', 'reserved'], default: 'empty' },
  guestCount: { type: Number, default: 0 },
  activeOrders: [{ type: Object }]
};

// 7. Shifts & Cash Drawer Reconciliation Schema
export const ShiftSchema = {
  cashierName: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  startingCash: { type: Number, required: true },
  cashSales: { type: Number, default: 0 },
  cardSales: { type: Number, default: 0 },
  expensesTotal: { type: Number, default: 0 },
  expectedDrawerCash: { type: Number, required: true },
  actualDrawerCash: { type: Number },
  difference: { type: Number, default: 0 }, // Variance (عجز أو زيادة)
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  closingNotes: { type: String }
};

// 8. Expense Schema
export const ExpenseSchema = {
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['supplies', 'utilities', 'maintenance', 'staff', 'other'],
    required: true 
  },
  amount: { type: Number, required: true },
  cashier: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
};

// 9. Day Summary & Report Schema
export const DayReportSchema = {
  date: { type: String, required: true, unique: true },
  totalSales: { type: Number, required: true },
  orderCount: { type: Number, required: true },
  averageOrder: { type: Number, required: true },
  cashSales: { type: Number, required: true },
  cardSales: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  expenses: { type: Number, required: true },
  estimatedProfit: { type: Number, required: true },
  salesByChannel: {
    dineIn: { type: Number, default: 0 },
    takeaway: { type: Number, default: 0 },
    delivery: { type: Number, default: 0 }
  },
  hourlyTraffic: [{
    hour: { type: String },
    count: { type: Number },
    sales: { type: Number }
  }]
};
