import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  Package, Printer, Plus, AlertTriangle, ArrowUpDown, 
  TrendingUp, FileSpreadsheet, Check, X, ShieldAlert, Bell 
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { 
    inventory, adjustStock, daySummary, currentShift, 
    closeShift, setActiveView, inventoryMovements,
    setIsNotificationPanelOpen, notifications 
  } = useCafe();

  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'manual_intake' | 'audit_adjustment'>('manual_intake');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Close shift modal
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualDrawerCashInput, setActualDrawerCashInput] = useState<number>(currentShift.expectedDrawerCash);
  const [shiftClosingNotes, setShiftClosingNotes] = useState<string>('');

  const handlePrintDayReport = () => {
    setActiveView('day_report');
  };

  const handleConfirmAdjust = () => {
    if (!selectedItemForAdjust) return;
    const sign = adjustType === 'manual_intake' ? 1 : -1;
    adjustStock(
      selectedItemForAdjust,
      adjustAmount * sign,
      adjustType,
      adjustReason || (adjustType === 'manual_intake' ? 'توريد بضاعة جديدة' : 'جرد وتسوية عجز')
    );
    setSelectedItemForAdjust(null);
    setAdjustAmount(1);
    setAdjustReason('');
  };

  const handleConfirmCloseShift = () => {
    closeShift(actualDrawerCashInput, shiftClosingNotes);
    setShowCloseShiftModal(false);
    alert('تم إغلاق الوردية وحفظ تقرير المطابقة بنجاح!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'depleted':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-md font-bold">منتهي</span>;
      case 'alert':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md font-bold">تنبيه</span>;
      case 'low':
        return <span className="bg-stone-200 text-stone-800 text-xs px-2.5 py-1 rounded-md font-bold">منخفض</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-bold">متاح</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">المخزون وتقفيل اليوم</h1>
          <p className="text-xs text-[#827163] mt-1 font-medium">
            كل عملية بيع تخصم خاماتها، وكل تعديل أو جرد له سبب وسجل.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#faf6f0] border border-[#ded3c3] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#4a3d34]">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>جاهز للإقفال</span>
        </div>
      </div>

      {/* Grid: 2 Columns matching Image 2 (Top section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Right (in RTL): تقرير اليوم matching Image 2 */}
        <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-[#231f1e] mb-6 text-center lg:text-start">تقرير اليوم</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f5efe6]">
                <span className="text-sm font-bold text-[#6d5d51]">إجمالي المبيعات</span>
                <span className="text-xl font-black text-[#231f1e] font-mono">
                  {daySummary.totalSales.toLocaleString()} <span className="font-sans text-sm font-normal text-[#8c7b6d]">ج</span>
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#f5efe6]">
                <span className="text-sm font-bold text-[#6d5d51]">المصروفات</span>
                <span className="text-xl font-black text-[#231f1e] font-mono">
                  {daySummary.expenses.toLocaleString()} <span className="font-sans text-sm font-normal text-[#8c7b6d]">ج</span>
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#f5efe6]">
                <span className="text-sm font-bold text-[#6d5d51]">تكلفة البضاعة</span>
                <span className="text-xl font-black text-[#231f1e] font-mono">
                  {daySummary.totalCost.toLocaleString()} <span className="font-sans text-sm font-normal text-[#8c7b6d]">ج</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-black text-[#231f1e]">ربح تقديري</span>
                <span className="text-2xl font-black text-[#231f1e] font-mono">
                  {daySummary.estimatedProfit.toLocaleString()} <span className="font-sans text-base font-normal text-[#8c7b6d]">ج</span>
                </span>
              </div>
            </div>
          </div>

          {/* Button matching Image 2 exactly */}
          <div className="mt-8">
            <button
              onClick={handlePrintDayReport}
              className="w-full py-3.5 bg-[#6b4a36] hover:bg-[#54392a] text-white text-sm font-black rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعه التقرير</span>
            </button>
          </div>
        </div>

        {/* Left (in RTL): المخزون Table matching Image 2 */}
        <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#231f1e]">المخزون</h2>
              <span className="text-xs text-[#8c7b6d] font-mono">
                {inventory.length} أصناف متابعة
              </span>
            </div>

            {/* Low Stock Warning Banner if items below alert threshold */}
            {inventory.some((i) => i.currentStock <= i.minAlert) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 animate-bounce" />
                  <span>
                    تنبيه: {inventory.filter((i) => i.currentStock <= i.minAlert).length} مواد وصلت للحد الأدنى أو نفدت!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotificationPanelOpen(true)}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Bell className="w-3 h-3" />
                  <span>عرض التنبيهات</span>
                </button>
              </div>
            )}

            {/* Inventory table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#f0e8dc] text-[#8c7b6d] font-bold">
                    <th className="pb-3 text-start">الخامة</th>
                    <th className="pb-3 text-center">الرصيد</th>
                    <th className="pb-3 text-end">الحالة</th>
                    <th className="pb-3 text-end">تعديل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5efe6]">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#faf6f0] transition">
                      <td className="py-3 font-bold text-[#231f1e]">{item.nameAr}</td>
                      <td className="py-3 text-center font-mono font-bold text-[#4a3d34]">
                        {item.unit} {item.currentStock}
                      </td>
                      <td className="py-3 text-end">{getStatusBadge(item.status)}</td>
                      <td className="py-3 text-end">
                        <button
                          onClick={() => {
                            setSelectedItemForAdjust(item.id);
                            setAdjustAmount(1);
                            setAdjustType('manual_intake');
                          }}
                          className="p-1 hover:bg-[#ede5d8] rounded text-[#8c6239] font-bold transition"
                          title="تعديل أو توريد"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: ورديات ودرج الكاش matching Image 2 */}
      <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#231f1e]">ورديات ودرج الكاش</h2>
            <p className="text-xs text-[#8c7b6d] mt-1 font-medium">
              فتح وردية، استلام وتسليم، عجز أو زيادة، ومدفوعات من الدرج بموافقة المدير.
            </p>
          </div>

          {/* Expected Drawer Cash Display matching Image 2 */}
          <div className="flex items-center gap-6 bg-[#faf6f0] border border-[#ded3c3] px-6 py-4 rounded-2xl">
            <span className="text-xs font-bold text-[#716155]">المفروض في الدرج</span>
            <span className="text-2xl font-black text-[#231f1e] font-mono">
              {currentShift.expectedDrawerCash.toLocaleString()}{' '}
              <span className="font-sans text-base font-normal text-[#8c7b6d]">ج</span>
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#f5efe6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-[#716155]">
            <span>مسؤول الوردية: <strong>{currentShift.cashierName}</strong></span>
            <span>كاش المبيعات: <strong>{currentShift.cashSales.toLocaleString()} ج</strong></span>
            <span>المصروفات: <strong>{currentShift.expensesTotal.toLocaleString()} ج</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCloseShiftModal(true)}
              className="py-2.5 px-5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              تقفيل الوردية ومطابقة النقدية
            </button>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedItemForAdjust && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#ded3c3] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <h3 className="text-base font-black text-[#231f1e]">تعديل كمية المخزن</h3>
              <button onClick={() => setSelectedItemForAdjust(null)}>
                <X className="w-5 h-5 text-[#8c7b6d]" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6e5f54]">نوع الحركة</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('manual_intake')}
                  className={`py-2 rounded-xl border text-xs font-bold ${
                    adjustType === 'manual_intake'
                      ? 'border-[#231f1e] bg-[#231f1e] text-white'
                      : 'border-[#ded3c3] hover:bg-[#faf6f0]'
                  }`}
                >
                  توريد وإضافة (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('audit_adjustment')}
                  className={`py-2 rounded-xl border text-xs font-bold ${
                    adjustType === 'audit_adjustment'
                      ? 'border-[#231f1e] bg-[#231f1e] text-white'
                      : 'border-[#ded3c3] hover:bg-[#faf6f0]'
                  }`}
                >
                  تسوية عجز أو هالك (-)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">الكمية</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">سبب الحركة (للسجلات)</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="مثال: استلام فاتورة توريد البن من المورد"
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={handleConfirmAdjust}
              className="w-full py-3 bg-[#231f1e] text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              حفظ وتحديث المخزن
            </button>
          </div>
        </div>
      )}

      {/* Close Shift Reconciliation Modal */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#ded3c3] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <h3 className="text-base font-black text-[#231f1e]">تقفيل الوردية ومطابقة الدرج</h3>
              <button onClick={() => setShowCloseShiftModal(false)}>
                <X className="w-5 h-5 text-[#8c7b6d]" />
              </button>
            </div>

            <div className="bg-[#faf6f0] p-4 rounded-xl space-y-1.5 border border-[#ded3c3] text-xs">
              <div className="flex justify-between text-[#6e5f54]">
                <span>المبلغ المفروض في الدرج:</span>
                <span className="font-mono font-bold text-sm text-[#231f1e]">
                  {currentShift.expectedDrawerCash.toLocaleString()} ج
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">النقدية الفعلية الموجودة في الدرج بعد العد:</label>
              <input
                type="number"
                value={actualDrawerCashInput}
                onChange={(e) => setActualDrawerCashInput(Number(e.target.value))}
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-base font-mono font-bold"
              />
            </div>

            {/* Difference analysis */}
            {(() => {
              const diff = actualDrawerCashInput - currentShift.expectedDrawerCash;
              return (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                  diff === 0 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : diff < 0 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  <span>{diff === 0 ? 'المطابقة دقيقة 100%' : diff < 0 ? 'يوجد عجز نقدي في الدرج' : 'يوجد زيادة نقدية في الدرج'}</span>
                  <span className="font-mono text-sm">{diff > 0 ? `+${diff}` : diff} ج</span>
                </div>
              );
            })()}

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">ملاحظات الإقفال</label>
              <textarea
                value={shiftClosingNotes}
                onChange={(e) => setShiftClosingNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات للتسليم..."
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl p-2.5 text-xs focus:outline-none h-16"
              />
            </div>

            <button
              onClick={handleConfirmCloseShift}
              className="w-full py-3 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              تأكيد إغلاق الوردية والترحيل
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
