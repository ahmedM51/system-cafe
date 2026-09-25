import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table, CartItem, TableStatus } from '../../types';
import { 
  LayoutGrid, Users, Plus, CheckCircle2, 
  UtensilsCrossed, Receipt, X 
} from 'lucide-react';

export const TablesView: React.FC = () => {
  const { tables, updateTable, checkoutTable, addItemsToTable, products } = useCafe();
  const [selectedZone, setSelectedZone] = useState<'all' | 'internal' | 'outdoor'>('all');
  
  // Selected table for modal
  const [activeTableModal, setActiveTableModal] = useState<Table | null>(null);
  const [itemsToAdd, setItemsToAdd] = useState<{ [id: string]: number }>({});
  const [checkoutPayment, setCheckoutPayment] = useState<'cash' | 'card'>('cash');

  const filteredTables = tables.filter((t) => {
    if (selectedZone === 'all') return true;
    return t.zone === selectedZone;
  });

  const internalCount = tables.filter((t) => t.zone === 'internal' && t.status === 'busy').length;
  const outdoorCount = tables.filter((t) => t.zone === 'outdoor' && t.status === 'busy').length;

  const handleConfirmAddItems = () => {
    if (!activeTableModal) return;
    const items: CartItem[] = [];

    Object.entries(itemsToAdd).forEach(([prodId, qty]) => {
      if (qty <= 0) return;
      const product = products.find((p) => p.id === prodId);
      if (product) {
        items.push({
          cartId: `tbl-item-${Date.now()}-${prodId}`,
          product,
          quantity: qty,
          unitPrice: product.price,
          totalPrice: product.price * qty,
        });
      }
    });

    if (items.length > 0) {
      addItemsToTable(activeTableModal.id, items);
    }
    setActiveTableModal(null);
    setItemsToAdd({});
  };

  const handleCheckoutTable = () => {
    if (!activeTableModal) return;
    checkoutTable(activeTableModal.id, checkoutPayment);
    setActiveTableModal(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">إدارة الصالات والترابيزات</h1>
          <p className="text-xs text-[#827163] mt-1 font-medium">
            12 ترابيزة في قاعتين، وفواتير منفصلة للضيوف على نفس الترابيزة.
          </p>
        </div>

        {/* Zone switcher pills */}
        <div className="flex items-center gap-1.5 bg-[#faf6f0] p-1 rounded-xl border border-[#ded3c3]">
          <button
            onClick={() => setSelectedZone('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedZone === 'all'
                ? 'bg-[#231f1e] text-white shadow-xs'
                : 'text-[#6e5f54] hover:text-[#231f1e]'
            }`}
          >
            الكل (12)
          </button>
          <button
            onClick={() => setSelectedZone('internal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedZone === 'internal'
                ? 'bg-[#231f1e] text-white shadow-xs'
                : 'text-[#6e5f54] hover:text-[#231f1e]'
            }`}
          >
            القاعة الداخلية ({internalCount}/6 مشغولة)
          </button>
          <button
            onClick={() => setSelectedZone('outdoor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedZone === 'outdoor'
                ? 'bg-[#231f1e] text-white shadow-xs'
                : 'text-[#6e5f54] hover:text-[#231f1e]'
            }`}
          >
            القاعة الخارجية / الروف ({outdoorCount}/6 مشغولة)
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isBusy = table.status === 'busy';
          const isReserved = table.status === 'reserved';
          const orderTotal = table.activeOrders.reduce((s, i) => s + i.totalPrice, 0);

          return (
            <div
              key={table.id}
              onClick={() => setActiveTableModal(table)}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs cursor-pointer hover:shadow-md hover:border-[#cbbaaa] ${
                isBusy
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : isReserved
                  ? 'border-blue-200 bg-blue-50/20'
                  : 'border-[#e8ded0]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f5efe6]">
                <span className="text-base font-black text-[#231f1e]">
                  ترابيزة #{table.number}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isBusy
                      ? 'bg-amber-100 text-amber-900'
                      : isReserved
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {isBusy ? 'مشغولة' : isReserved ? 'محجوزة' : 'فارغة'}
                </span>
              </div>

              <div className="py-5 text-center space-y-1.5">
                <div className="text-xs text-[#8c7b6d] flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {table.guestCount > 0 ? `${table.guestCount} ضيوف` : `سعة ${table.capacity} أفراد`}
                  </span>
                </div>
                <div className="text-[11px] text-[#a49586]">
                  {table.zone === 'internal' ? 'قاعة داخلية مكيفة' : 'روف خارجي مميز'}
                </div>

                {isBusy && (
                  <div className="pt-2">
                    <span className="text-lg font-black text-[#231f1e] font-mono">
                      {orderTotal} ج
                    </span>
                    <p className="text-[10px] text-[#8c7b6d]">
                      {table.activeOrders.length} طلبات مسجلة
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#f5efe6] flex items-center justify-between text-xs font-bold text-[#8c6239]">
                <span>{isBusy ? 'عرض الفاتورة والطلبات' : 'فتح الترابيزة أو حجز'}</span>
                <span>←</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Detail & Order Modal */}
      {activeTableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-[#ded3c3] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <div>
                <h3 className="text-base font-black text-[#231f1e]">
                  ترابيزة #{activeTableModal.number} - {activeTableModal.zone === 'internal' ? 'القاعة الداخلية' : 'القاعة الخارجية'}
                </h3>
                <p className="text-xs text-[#8c7b6d]">إدارة الطلبات، الضيوف، والتحصيل</p>
              </div>
              <button onClick={() => setActiveTableModal(null)}>
                <X className="w-5 h-5 text-[#8c7b6d]" />
              </button>
            </div>

            {/* Quick status change */}
            <div className="grid grid-cols-3 gap-2">
              {(['empty', 'busy', 'reserved'] as TableStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => updateTable(activeTableModal.id, status, status === 'empty' ? 0 : 2)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    activeTableModal.status === status
                      ? 'bg-[#231f1e] text-white border-[#231f1e]'
                      : 'border-[#ded3c3] hover:bg-[#faf6f0]'
                  }`}
                >
                  {status === 'empty' ? 'فارغة' : status === 'busy' ? 'مشغولة' : 'محجوزة'}
                </button>
              ))}
            </div>

            {/* Current Table Orders */}
            {activeTableModal.activeOrders.length > 0 && (
              <div className="bg-[#faf6f0] p-4 rounded-xl space-y-2 border border-[#ded3c3]">
                <span className="text-xs font-bold text-[#6e5f54]">الطلبات الحالية على الترابيزة:</span>
                <div className="max-h-36 overflow-y-auto divide-y divide-[#e8ded0]">
                  {activeTableModal.activeOrders.map((item) => (
                    <div key={item.cartId} className="py-1.5 flex justify-between text-xs">
                      <span>{item.product.nameAr} (x{item.quantity})</span>
                      <span className="font-mono font-bold">{item.totalPrice} ج</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#ded3c3] flex justify-between text-sm font-black text-[#231f1e]">
                  <span>إجمالي الحساب:</span>
                  <span className="font-mono">
                    {activeTableModal.activeOrders.reduce((s, i) => s + i.totalPrice, 0)} ج
                  </span>
                </div>
              </div>
            )}

            {/* Add menu items to table */}
            <div>
              <label className="text-xs font-bold text-[#6e5f54]">إضافة مشروبات وأطباق للترابيزة:</label>
              <div className="max-h-40 overflow-y-auto divide-y divide-[#f5efe6] mt-2 pr-1">
                {products.map((p) => {
                  const qty = itemsToAdd[p.id] || 0;
                  return (
                    <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                      <span>{p.nameAr} ({p.price} ج)</span>
                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <button
                            onClick={() => setItemsToAdd((prev) => ({ ...prev, [p.id]: qty - 1 }))}
                            className="w-5 h-5 rounded bg-[#f5efe6] font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                        )}
                        <span className="font-mono font-bold px-1">{qty}</span>
                        <button
                          onClick={() => setItemsToAdd((prev) => ({ ...prev, [p.id]: qty + 1 }))}
                          className="w-5 h-5 rounded bg-[#231f1e] text-white font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmAddItems}
                className="flex-1 py-3 bg-[#6b4a36] hover:bg-[#54392a] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                تأكيد إضافة الطلبات
              </button>

              {activeTableModal.activeOrders.length > 0 && (
                <button
                  onClick={handleCheckoutTable}
                  className="flex-1 py-3 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  تحصيل وإفراغ الترابيزة 🖨️
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
