import express, { Request, Response } from 'express';
import { 
  INITIAL_PRODUCTS, INITIAL_INVENTORY, INITIAL_PLAYSTATION_DEVICES, 
  INITIAL_TABLES, INITIAL_EXPENSES, INITIAL_SHIFT, INITIAL_DAY_SUMMARY 
} from '../src/data/initialData';

export const createCafeApiRouter = () => {
  const router = express.Router();

  // In-memory data store for backend API demonstration
  let products = [...INITIAL_PRODUCTS];
  let inventory = [...INITIAL_INVENTORY];
  let playstations = [...INITIAL_PLAYSTATION_DEVICES];
  let tables = [...INITIAL_TABLES];
  let expenses = [...INITIAL_EXPENSES];
  let currentShift = { ...INITIAL_SHIFT };
  let daySummary = { ...INITIAL_DAY_SUMMARY };
  let orders: any[] = [];

  // 1. Products API
  router.get('/products', (req: Request, res: Response) => {
    res.json({ success: true, count: products.length, data: products });
  });

  // 2. Inventory API
  router.get('/inventory', (req: Request, res: Response) => {
    res.json({ success: true, data: inventory });
  });

  router.post('/inventory/adjust', (req: Request, res: Response) => {
    const { itemId, amount, reason } = req.body;
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.currentStock = Math.max(0, item.currentStock + amount);
    if (item.currentStock <= 0) item.status = 'depleted';
    else if (item.currentStock <= item.minAlert * 0.5) item.status = 'alert';
    else if (item.currentStock <= item.minAlert) item.status = 'low';
    else item.status = 'available';

    res.json({ success: true, message: 'Stock updated', data: item });
  });

  // 3. Orders API with Automatic Recipe Deduction
  router.post('/orders', (req: Request, res: Response) => {
    const { items, type, paymentMethod, customerName, cashierName, discount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items required' });
    }

    const subtotal = items.reduce((sum: number, i: any) => sum + i.totalPrice, 0);
    const finalTotal = Math.max(0, subtotal - (discount || 0));
    const orderNumber = orders.length + 127;
    const orderId = `ORD-API-${Date.now().toString().slice(-6)}`;

    // Automatic recipe stock deduction
    items.forEach((orderItem: any) => {
      const prod = products.find((p) => p.id === orderItem.product.id);
      if (prod && prod.recipe) {
        prod.recipe.forEach((rec) => {
          const invItem = inventory.find((i) => i.id === rec.inventoryItemId);
          if (invItem) {
            invItem.currentStock = Math.max(0, Number((invItem.currentStock - (rec.quantity * orderItem.quantity)).toFixed(3)));
            if (invItem.currentStock <= 0) invItem.status = 'depleted';
            else if (invItem.currentStock <= invItem.minAlert * 0.5) invItem.status = 'alert';
            else if (invItem.currentStock <= invItem.minAlert) invItem.status = 'low';
          }
        });
      }
    });

    const newOrder = {
      id: orderId,
      orderNumber,
      items,
      type,
      subtotal,
      discount: discount || 0,
      total: finalTotal,
      paymentMethod,
      cashierName: cashierName || 'Mohamed',
      status: 'completed',
      customerName,
      timestamp: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    // Update Drawer & Summary
    if (paymentMethod === 'cash') {
      currentShift.cashSales += finalTotal;
      currentShift.expectedDrawerCash += finalTotal;
      daySummary.cashSales += finalTotal;
    } else {
      currentShift.cardSales += finalTotal;
      daySummary.cardSales += finalTotal;
    }

    daySummary.totalSales += finalTotal;
    daySummary.orderCount += 1;
    daySummary.averageOrder = Math.round(daySummary.totalSales / daySummary.orderCount);

    res.status(201).json({ success: true, message: 'Order completed', data: newOrder });
  });

  router.get('/orders', (req: Request, res: Response) => {
    res.json({ success: true, count: orders.length, data: orders });
  });

  // 4. PlayStation Devices API
  router.get('/playstation', (req: Request, res: Response) => {
    res.json({ success: true, data: playstations });
  });

  router.post('/playstation/:id/start', (req: Request, res: Response) => {
    const { id } = req.params;
    const { mode, customerName } = req.body;
    const ps = playstations.find((p) => p.id === id);
    if (!ps) return res.status(404).json({ success: false, message: 'Device not found' });

    ps.status = 'active';
    ps.mode = mode || 'single';
    ps.startTime = new Date().toISOString();
    ps.elapsedSeconds = 0;
    ps.timeCost = 10;
    ps.customerName = customerName || `عميل جهاز ${ps.deviceNumber}`;

    res.json({ success: true, message: 'PlayStation session started', data: ps });
  });

  router.post('/playstation/:id/add-drinks', (req: Request, res: Response) => {
    const { id } = req.params;
    const { items } = req.body;
    const ps = playstations.find((p) => p.id === id);
    if (!ps) return res.status(404).json({ success: false, message: 'Device not found' });

    ps.linkedOrders = [...ps.linkedOrders, ...items];
    res.json({ success: true, message: 'Drinks added to session', data: ps });
  });

  // 5. Shift & Cash Drawer API
  router.get('/shifts/current', (req: Request, res: Response) => {
    res.json({ success: true, data: currentShift });
  });

  router.post('/shifts/close', (req: Request, res: Response) => {
    const { actualDrawerCash, closingNotes } = req.body;
    currentShift.actualDrawerCash = actualDrawerCash;
    currentShift.difference = actualDrawerCash - currentShift.expectedDrawerCash;
    currentShift.status = 'closed';
    currentShift.closingNotes = closingNotes;
    currentShift.endTime = new Date().toISOString();

    res.json({ 
      success: true, 
      message: 'Shift closed and reconciled', 
      variance: currentShift.difference,
      data: currentShift 
    });
  });

  // 6. Expenses API
  router.get('/expenses', (req: Request, res: Response) => {
    res.json({ success: true, data: expenses });
  });

  router.post('/expenses', (req: Request, res: Response) => {
    const { title, amount, category, notes, cashier } = req.body;
    const newExpense = {
      id: `exp-${Date.now()}`,
      title,
      amount,
      category,
      notes,
      cashier: cashier || 'Mohamed',
      timestamp: new Date().toISOString(),
    };
    expenses.unshift(newExpense);
    currentShift.expensesTotal += amount;
    currentShift.expectedDrawerCash -= amount;
    daySummary.expenses += amount;
    daySummary.estimatedProfit = daySummary.totalSales - daySummary.totalCost - daySummary.expenses;

    res.status(201).json({ success: true, message: 'Expense recorded', data: newExpense });
  });

  // 7. Day Report & Closing API
  router.get('/day-report', (req: Request, res: Response) => {
    res.json({ success: true, data: daySummary });
  });

  return router;
};
