import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order } from '../../types';
import { ShoppingBag, Printer, Search, Calendar, User, Eye } from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, setActiveReceipt } = useCafe();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery'>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (o.tableName && o.tableName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || o.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">سجل الطلبات والفواتير</h1>
          <p className="text-xs text-[#827163] mt-1 font-medium">
            متابعة فواتير الصالة، التيك أواي، الدليفري، والبلايستيشن وإعادة الطباعة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8c7b6d] font-mono">
            {orders.length} فواتير مسجلة في الجلسة الحالية
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، الترابيزة..."
            className="w-full bg-white border border-[#ded3c3] rounded-xl px-4 py-2.5 text-xs text-[#231f1e] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#8c7b6d] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 bg-[#faf6f0] p-1 rounded-xl border border-[#ded3c3]">
          {(['all', 'dine_in', 'takeaway', 'delivery'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === t
                  ? 'bg-[#231f1e] text-white'
                  : 'text-[#6e5f54] hover:text-[#231f1e]'
              }`}
            >
              {t === 'all' ? 'الكل' : t === 'dine_in' ? 'صالة' : t === 'takeaway' ? 'تيك أواي' : 'دليفري'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-xs overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#8c7b6d]">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold">لا توجد طلبات بعد في هذه القائمة، قم بتأكيد طلب جديد من نقطة البيع أو البلايستيشن!</p>
          </div>
        ) : (
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#f0e8dc] text-[#8c7b6d] font-bold">
                <th className="pb-3 text-start">رقم الفاتورة</th>
                <th className="pb-3 text-start">النوع / الموقع</th>
                <th className="pb-3 text-start">الأصناف</th>
                <th className="pb-3 text-start">الكاشير</th>
                <th className="pb-3 text-start">طريقة الدفع</th>
                <th className="pb-3 text-end">الإجمالي</th>
                <th className="pb-3 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe6]">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#faf6f0] transition">
                  <td className="py-3 font-mono font-bold text-[#231f1e]">#{ord.orderNumber} ({ord.id})</td>
                  <td className="py-3">
                    <span className="bg-[#faf6f0] border border-[#ded3c3] px-2 py-0.5 rounded text-[11px] font-bold text-[#6e5f54]">
                      {ord.type === 'dine_in' ? (ord.tableName || ord.playstationName || 'صالة') : ord.type === 'takeaway' ? 'تيك أواي' : 'دليفري'}
                    </span>
                  </td>
                  <td className="py-3 text-[#5e4e42] max-w-xs truncate">
                    {ord.items.map((i) => `${i.product.nameAr} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 text-[#8c7b6d]">{ord.cashierName}</td>
                  <td className="py-3 font-bold">
                    {ord.paymentMethod === 'cash' ? '💵 كاش' : '💳 فيزا'}
                  </td>
                  <td className="py-3 text-end font-mono font-black text-sm text-[#231f1e]">
                    {ord.total} ج
                  </td>
                  <td className="py-3 text-end">
                    <button
                      onClick={() => setActiveReceipt(ord)}
                      className="p-1.5 hover:bg-[#ede5d8] rounded text-[#8c6239] transition inline-flex items-center gap-1 font-bold text-xs"
                      title="عرض وطباعة الإيصال"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
