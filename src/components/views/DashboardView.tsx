import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  TrendingUp, ShoppingBag, DollarSign, CreditCard, 
  Coins, AlertTriangle, ArrowUpRight, Calendar
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { daySummary, inventory, currentUser } = useCafe();

  // Low/alert stock items
  const alertItems = inventory.filter((item) => item.status !== 'available').slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar matching Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">الرئيسية</h1>
          <p className="text-xs text-[#827163] mt-1 font-medium">
            ملخص يومي للإدارة: مبيعات، كاش، فيزا، وتكلفة البضاعة.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#faf6f0] border border-[#ded3c3] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#4a3d34] shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#8c6239]" />
          <span>{daySummary.date}</span>
        </div>
      </div>

      {/* Row 1: Top 3 Cards (مبيعات اليوم - عدد الطلبات - متوسط الطلب) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* مبيعات اليوم */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs hover:border-[#cbbaaa] transition flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-3">مبيعات اليوم</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#231f1e] tracking-tight">
              {daySummary.totalSales.toLocaleString()} <span className="text-xl font-bold text-[#6d5d51]">ج</span>
            </span>
            <span className="text-emerald-700 bg-emerald-50 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center">
              +14.2%
            </span>
          </div>
        </div>

        {/* عدد الطلبات */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs hover:border-[#cbbaaa] transition flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-3">عدد الطلبات</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#231f1e] tracking-tight">
              {daySummary.orderCount}
            </span>
            <span className="text-[#8a796b] text-xs font-medium">طلب منجز</span>
          </div>
        </div>

        {/* متوسط الطلب */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs hover:border-[#cbbaaa] transition flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-3">متوسط الطلب</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#231f1e] tracking-tight">
              {daySummary.averageOrder} <span className="text-xl font-bold text-[#6d5d51]">ج</span>
            </span>
            <span className="text-amber-700 bg-amber-50 text-[11px] font-bold px-2 py-0.5 rounded-full">
              قيمة ممتازة
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary 3 Cards (الكاش - فيزا - التكلفة) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* الكاش */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs hover:border-[#cbbaaa] transition flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-3">الكاش</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#231f1e] tracking-tight">
              {daySummary.cashSales.toLocaleString()} <span className="text-xl font-bold text-[#6d5d51]">ج</span>
            </span>
            <span className="text-xs text-[#8a796b] font-medium font-mono">
              {Math.round((daySummary.cashSales / (daySummary.totalSales || 1)) * 100)}% من الإجمالي
            </span>
          </div>
        </div>

        {/* فيزا */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs hover:border-[#cbbaaa] transition flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-3">فيزا</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#231f1e] tracking-tight">
              {daySummary.cardSales.toLocaleString()} <span className="text-xl font-bold text-[#6d5d51]">ج</span>
            </span>
            <span className="text-xs text-[#8a796b] font-medium font-mono">
              {Math.round((daySummary.cardSales / (daySummary.totalSales || 1)) * 100)}% مدفوعات إلكترونية
            </span>
          </div>
        </div>

        {/* التكلفة */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs hover:border-[#cbbaaa] transition flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-3">التكلفة</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#231f1e] tracking-tight">
              {daySummary.totalCost.toLocaleString()} <span className="text-xl font-bold text-[#6d5d51]">ج</span>
            </span>
            <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              32.6% نسبة تكلفة البضاعة
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Bottom 3 Panels (حركة اليوم بالساعة - تنبيهات المخزون - المبيعات حسب النوع) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1: حركة اليوم بالساعة */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-4">حركة اليوم بالساعة</div>
          
          <div className="h-36 flex items-end justify-between gap-1.5 pt-4 px-1">
            {daySummary.hourlyTraffic.map((bar, i) => {
              const maxSales = Math.max(...daySummary.hourlyTraffic.map((b) => b.sales));
              const heightPercent = Math.max(18, Math.round((bar.sales / maxSales) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#231f1e] text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {bar.sales} ج ({bar.count} طلب)
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-[#70523f] to-[#aa8366] rounded-t-md hover:from-[#543b2c] hover:to-[#8c654a] transition-all"
                  />
                  <span className="text-[9px] text-[#8a796b] font-mono mt-1 scale-90">
                    {bar.hour.split(':')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: تنبيهات المخزون */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8a796b]">تنبيهات المخزون</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>

          <div className="divide-y divide-[#f2eae0]">
            {alertItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <span className="text-xs font-medium text-[#2d2522]">{item.nameAr}</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  item.status === 'depleted' 
                    ? 'bg-rose-100 text-rose-800' 
                    : item.status === 'alert' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-stone-100 text-stone-700'
                }`}>
                  {item.unit} {item.currentStock}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: المبيعات حسب النوع */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8dfd3] shadow-xs flex flex-col justify-between">
          <div className="text-xs font-bold text-[#8a796b] mb-3">المبيعات حسب النوع</div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#2d2522]">صالة</span>
              <span className="text-sm font-bold text-[#231f1e]">
                {daySummary.salesByChannel.dineIn.toLocaleString()} <span className="text-xs font-normal text-[#8a796b]">ج</span>
              </span>
            </div>
            <div className="w-full bg-[#f3ede3] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#6b4a36] h-full rounded-full" 
                style={{ width: `${(daySummary.salesByChannel.dineIn / daySummary.totalSales) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#2d2522]">تيك أواي</span>
              <span className="text-sm font-bold text-[#231f1e]">
                {daySummary.salesByChannel.takeaway.toLocaleString()} <span className="text-xs font-normal text-[#8a796b]">ج</span>
              </span>
            </div>
            <div className="w-full bg-[#f3ede3] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#9c7153] h-full rounded-full" 
                style={{ width: `${(daySummary.salesByChannel.takeaway / daySummary.totalSales) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#2d2522]">دليفري</span>
              <span className="text-sm font-bold text-[#231f1e]">
                {daySummary.salesByChannel.delivery.toLocaleString()} <span className="text-xs font-normal text-[#8a796b]">ج</span>
              </span>
            </div>
            <div className="w-full bg-[#f3ede3] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#c29c7d] h-full rounded-full" 
                style={{ width: `${(daySummary.salesByChannel.delivery / daySummary.totalSales) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
