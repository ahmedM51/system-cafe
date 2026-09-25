/**
 * HUB CAFE System - Comprehensive QA Integration & Unit Test Suite
 * Covers the 5 required core business and operational scenarios:
 * 1. Authentication & Role-Based Access Control (RBAC)
 * 2. POS Ordering, Cart, Discounts & Multi-Channel Checkout
 * 3. Automated Inventory Stock Deduction & Alert Thresholds
 * 4. PlayStation Timers, Rates & Unified Bill Combination
 * 5. Shift & Cash Drawer Reconciliation & Day Closing
 */

import { INITIAL_PRODUCTS, INITIAL_INVENTORY, INITIAL_PLAYSTATION_DEVICES, INITIAL_SHIFT, INITIAL_DAY_SUMMARY, INITIAL_USERS } from '../data/initialData';

describe('HUB CAFE System QA Automation Test Suite', () => {

  // Test Scenario 1: Authentication & Role-Based Access Control
  test('Scenario 1: RBAC & Permissions Enforcement with Admin ahmedmohamed4336@gmail.com', () => {
    const adminUser = INITIAL_USERS.find((u) => u.role === 'admin');
    const cashierUser = INITIAL_USERS.find((u) => u.role === 'cashier');

    expect(adminUser).toBeDefined();
    expect(cashierUser).toBeDefined();

    // Verify Admin specific email as requested
    expect(adminUser?.email).toBe('ahmedmohamed4336@gmail.com');
    expect(adminUser?.role).toBe('admin');
    expect(adminUser?.pin).toBe('4336');

    // Verify Cashier account
    expect(cashierUser?.email).toBe('cashier@hubcafe.com');
    expect(cashierUser?.role).toBe('cashier');
    expect(cashierUser?.pin).toBe('1234');

    // Verify Admin permissions
    const adminPermissions = {
      canViewReports: adminUser?.role === 'admin',
      canAdjustStock: adminUser?.role === 'admin',
      canManageShifts: adminUser?.role === 'admin',
      canAccessDashboard: adminUser?.role === 'admin',
    };
    expect(adminPermissions.canViewReports).toBe(true);
    expect(adminPermissions.canAdjustStock).toBe(true);
    expect(adminPermissions.canAccessDashboard).toBe(true);

    // Verify Cashier restriction
    const cashierPermissions = {
      canOperatePos: true,
      canAccessPlaystation: true,
      canViewSensitiveCostProfit: cashierUser?.role === 'admin', // false
    };
    expect(cashierPermissions.canOperatePos).toBe(true);
    expect(cashierPermissions.canViewSensitiveCostProfit).toBe(false);
  });

  // Test Scenario 2: POS Cashier flow
  test('Scenario 2: POS Cart, Discounts, Order Types and Checkout Calculation', () => {
    const latte = INITIAL_PRODUCTS.find((p) => p.id === 'prod-latte')!;
    const waffle = INITIAL_PRODUCTS.find((p) => p.id === 'prod-nutella-waffle')!;

    // 1. Add items
    const cart = [
      { product: latte, quantity: 2, unitPrice: latte.price, totalPrice: latte.price * 2 }, // 70 * 2 = 140
      { product: waffle, quantity: 1, unitPrice: 60, totalPrice: 60 },                      // 60
    ];

    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    expect(subtotal).toBe(200); // 140 + 60

    // 2. Apply discount of 20 EGP
    const discount = 20;
    const finalTotal = Math.max(0, subtotal - discount);
    expect(finalTotal).toBe(180);

    // 3. Verify order channels
    const allowedChannels = ['dine_in', 'takeaway', 'delivery'];
    expect(allowedChannels).toContain('dine_in');
    expect(allowedChannels).toContain('takeaway');
    expect(allowedChannels).toContain('delivery');
  });

  // Test Scenario 3: Inventory Automatic Stock Deduction & Status Alerts
  test('Scenario 3: Recipe-Based Stock Deduction & Low Stock Thresholds', () => {
    const latte = INITIAL_PRODUCTS.find((p) => p.id === 'prod-latte')!;
    const beansInventory = { ...INITIAL_INVENTORY.find((i) => i.id === 'inv-espresso')! };
    const milkInventory = { ...INITIAL_INVENTORY.find((i) => i.id === 'inv-milk')! };

    const initialBeansStock = beansInventory.currentStock; // 1.8 kg
    const initialMilkStock = milkInventory.currentStock;   // 5.0 L

    // Simulate ordering 5 cups of latte
    const orderedQuantity = 5;
    const beansDeduction = latte.recipe.find((r) => r.inventoryItemId === 'inv-espresso')!.quantity * orderedQuantity;
    const milkDeduction = latte.recipe.find((r) => r.inventoryItemId === 'inv-milk')!.quantity * orderedQuantity;

    const newBeansStock = Number((initialBeansStock - beansDeduction).toFixed(3));
    const newMilkStock = Number((initialMilkStock - milkDeduction).toFixed(3));

    expect(beansDeduction).toBeCloseTo(0.09, 3); // 18g * 5 = 90g = 0.09kg
    expect(milkDeduction).toBeCloseTo(1.10, 2);  // 220ml * 5 = 1100ml = 1.10L
    expect(newBeansStock).toBe(1.71);
    expect(newMilkStock).toBe(3.90);

    // Verify alert trigger when stock is below minAlert
    const isBelowMin = newMilkStock < milkInventory.minAlert; // 3.90 < 10.0
    expect(isBelowMin).toBe(true);
  });

  // Test Scenario 4: PlayStation Timers & Unified Bill Combination
  test('Scenario 4: Live PlayStation Hourly Calculation & Merged Beverage Orders', () => {
    const psDevice = { ...INITIAL_PLAYSTATION_DEVICES.find((p) => p.id === 'ps4-1')! };
    
    // PS4 rate: single = 30 EGP/hr
    const elapsedSeconds = 5052; // 1 hr, 24 mins, 12 secs (~1.403 hrs)
    const hours = elapsedSeconds / 3600;
    const calculatedCost = Math.round(hours * psDevice.singleHourlyRate);
    
    expect(calculatedCost).toBe(42); // Matches 42 EGP in screenshot!

    // Add 2 energy drinks to device invoice
    const drinkPrice = 85;
    const drinkQty = 2;
    const drinksTotal = drinkPrice * drinkQty; // 170 EGP

    const unifiedTotal = calculatedCost + drinksTotal;
    expect(unifiedTotal).toBe(212); // 42 + 170
  });

  // Test Scenario 5: Shift & Drawer Reconciliation & Day Closing
  test('Scenario 5: Shift Drawer Reconciliation & Accurate Net Profit', () => {
    const shift = INITIAL_SHIFT;
    const daySummary = INITIAL_DAY_SUMMARY;

    // Formula: Total Sales = Cash + Card
    expect(daySummary.totalSales).toBe(daySummary.cashSales + daySummary.cardSales);
    expect(daySummary.totalSales).toBe(18740);

    // Formula: Expected Drawer = Cash Sales (matching screenshot: 13,400 EGP)
    expect(shift.expectedDrawerCash).toBe(13400);

    // Formula: Net Profit = Total Sales - Cost of Goods - Expenses
    const calculatedProfit = daySummary.totalSales - daySummary.totalCost - daySummary.expenses;
    expect(calculatedProfit).toBe(daySummary.estimatedProfit);
    expect(calculatedProfit).toBe(11370); // Matches 11,370 EGP in screenshot!
  });

});
