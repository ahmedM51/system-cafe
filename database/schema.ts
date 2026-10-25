import mongoose, { Schema, model, models, Model, HydratedDocument } from 'mongoose';

// ==========================================
// 1. USER SCHEMA & MODEL
// ==========================================
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  avatar?: string;
  phone?: string;
  pin?: string;
  password?: string;
  permissions: string[];
  authProvider?: string;
  googleId?: string;
  tokenVerified?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'cashier'],
      default: 'cashier',
      required: true,
    },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    pin: { type: String, default: '1234' },
    password: { type: String, select: false },
    permissions: {
      type: [String],
      default: ['pos', 'tables', 'orders', 'playstation', 'shifts'],
    },
    authProvider: { type: String, default: 'local' },
    googleId: { type: String, default: null },
    tokenVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'hub_users',
  }
);

export const UserModel: Model<IUser> =
  models.User || model<IUser>('User', UserSchema);

// ==========================================
// 2. ORDER SCHEMA & MODEL
// ==========================================
export interface ICartItem {
  cartId: string;
  productId: string;
  productNameAr: string;
  productNameEn?: string;
  category?: string;
  quantity: number;
  selectedSize?: string;
  selectedAddons?: string[];
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export const CartItemSchema = new Schema<ICartItem>(
  {
    cartId: { type: String, required: true },
    productId: { type: String, required: true },
    productNameAr: { type: String, required: true },
    productNameEn: { type: String },
    category: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String },
    selectedAddons: { type: [String], default: [] },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    notes: { type: String },
  },
  { _id: false }
);

export interface IOrder {
  id: string;
  orderNumber: number;
  items: ICartItem[];
  type: 'dine_in' | 'takeaway' | 'delivery';
  tableId?: string;
  tableName?: string;
  playstationId?: string;
  playstationName?: string;
  subtotal: number;
  discount: number;
  tax?: number;
  serviceCharge?: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'split';
  cashierName: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;

export const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: Number, required: true, index: true },
    items: { type: [CartItemSchema], required: true },
    type: {
      type: String,
      enum: ['dine_in', 'takeaway', 'delivery'],
      default: 'takeaway',
      required: true,
    },
    tableId: { type: String },
    tableName: { type: String },
    playstationId: { type: String },
    playstationName: { type: String },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'split'],
      default: 'cash',
      required: true,
    },
    cashierName: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'completed', 'cancelled'],
      default: 'completed',
      required: true,
      index: true,
    },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    notes: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: 'hub_orders',
  }
);

export const OrderModel: Model<IOrder> =
  models.Order || model<IOrder>('Order', OrderSchema);

// ==========================================
// 3. INVENTORY ITEM SCHEMA & MODEL
// ==========================================
export interface IInventoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  currentStock: number;
  minAlert: number;
  costPerUnit: number;
  status: 'available' | 'low' | 'alert' | 'depleted';
  supplier?: string;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InventoryItemDocument = HydratedDocument<IInventoryItem>;

export const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    nameAr: { type: String, required: true, trim: true },
    nameEn: { type: String, default: '', trim: true },
    unit: { type: String, required: true, default: 'قطعة' },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    minAlert: { type: Number, required: true, default: 5, min: 0 },
    costPerUnit: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['available', 'low', 'alert', 'depleted'],
      default: 'available',
      index: true,
    },
    supplier: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'hub_inventory',
  }
);

// Automatic status recalculation pre-save middleware
InventoryItemSchema.pre('save', function () {
  if (this.currentStock <= 0) {
    this.status = 'depleted';
  } else if (this.currentStock <= this.minAlert * 0.5) {
    this.status = 'alert';
  } else if (this.currentStock <= this.minAlert) {
    this.status = 'low';
  } else {
    this.status = 'available';
  }
  this.lastUpdated = new Date();
});

export const InventoryItemModel: Model<IInventoryItem> =
  models.InventoryItem ||
  model<IInventoryItem>('InventoryItem', InventoryItemSchema);

// ==========================================
// 4. PLAYSTATION SESSION SCHEMA & MODEL
// ==========================================
export interface IPlayStationSession {
  id: string;
  sessionId: string;
  deviceNumber: number;
  model: 'PS4' | 'PS5';
  status: 'idle' | 'active' | 'completed' | 'cancelled';
  mode: 'single' | 'multi';
  customerName?: string;
  customerPhone?: string;
  startTime: Date;
  endTime?: Date;
  elapsedSeconds: number;
  targetMinutes?: number | null;
  singleHourlyRate: number;
  multiHourlyRate: number;
  hourlyRateApplied: number;
  timeCost: number;
  ordersCost: number;
  totalCost: number;
  linkedOrders: ICartItem[];
  timeLimitReached: boolean;
  notes?: string;
  cashierName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PlayStationSessionDocument = HydratedDocument<IPlayStationSession>;

export const PlayStationSessionSchema = new Schema<IPlayStationSession>(
  {
    id: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    deviceNumber: { type: Number, required: true, index: true },
    model: {
      type: String,
      enum: ['PS4', 'PS5'],
      required: true,
    },
    status: {
      type: String,
      enum: ['idle', 'active', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    mode: {
      type: String,
      enum: ['single', 'multi'],
      default: 'single',
      required: true,
    },
    customerName: { type: String, default: 'عميل عام' },
    customerPhone: { type: String, default: '' },
    startTime: { type: Date, default: Date.now, required: true },
    endTime: { type: Date },
    elapsedSeconds: { type: Number, default: 0, min: 0 },
    targetMinutes: { type: Number, default: null },
    singleHourlyRate: { type: Number, required: true, default: 30 },
    multiHourlyRate: { type: Number, required: true, default: 40 },
    hourlyRateApplied: { type: Number, required: true, default: 30 },
    timeCost: { type: Number, default: 0, min: 0 },
    ordersCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    linkedOrders: { type: [CartItemSchema], default: [] },
    timeLimitReached: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    cashierName: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'hub_playstation_sessions',
  }
);

export const PlayStationSessionModel: Model<IPlayStationSession> =
  models.PlayStationSession ||
  model<IPlayStationSession>(
    'PlayStationSession',
    PlayStationSessionSchema
  );

// ==========================================
// EXPORTS BUNDLE
// ==========================================
export const Schemas = {
  User: UserSchema,
  Order: OrderSchema,
  InventoryItem: InventoryItemSchema,
  PlayStationSession: PlayStationSessionSchema,
};

export const Models = {
  User: UserModel,
  Order: OrderModel,
  InventoryItem: InventoryItemModel,
  PlayStationSession: PlayStationSessionModel,
};

export default Models;
