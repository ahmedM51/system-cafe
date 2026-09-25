import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Clock, DollarSign, AlertCircle, CheckCircle2, Shield, User, Printer } from 'lucide-react';

export const ShiftsView: React.FC = () => {
  const { currentShift, closeShift, openNewShift, currentUser, setActiveView, cafeSettings } = useCafe();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [actualDrawer, setActualDrawer] = useState<number>(currentShift.expectedDrawerCash);
  const [startCashInput, setStartCashInput] = useState<number>(2000);
  const [notes, setNotes] = useState('');

  const handleClose = (shouldPrint = false) => {
    closeShift(actualDrawer, notes);
    setShowCloseModal(false);
    if (shouldPrint) {
      setActiveView('day_report');
    }
  };

  const handleOpenNew = () => {
    openNewShift(startCashInput);
    setShowOpenModal(false);
  };

  const variance = actualDrawer - currentShift.expectedDrawerCash;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">إدارة الورديات ودرج الكاش</h1>
          <p className="text-xs text-[#827163] mt-1 font-medium">
            استلام وتسليم الورديات، جرد درج النقدية، واكتشاف أي عجز أو زيادة فورياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Day Report Button */}
          <button
            onClick={() => setActiveView('day_report')}
            className="flex items-center gap-1.5 py-2.5 px-4 bg-[#faf6f0] hover:bg-[#ede5d8] text-[#423226] text-xs font-bold rounded-xl border border-[#ded3c3] transition cursor-pointer"
            title="طباعة تقرير الإقفال والحسابات اليومية"
          >
            <Printer className="w-4 h-4 text-[#8c6239]" />
            <span>طباعة تقرير الإقفال (A4 / طابعة فواتير)</span>
          </button>

          {currentShift.status === 'open' ? (
            <button
              onClick={() => setShowCloseModal(true)}
              className="py-2.5 px-4 bg-[#6b4a36] hover:bg-[#54392a] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
            >
              تسليم وتقفيل الوردية الحالية
            </button>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="py-2.5 px-4 bg-[#231f1e] text-white text-xs font-black rounded-xl transition cursor-pointer"
            >
              فتح وردية عمل جديدة
            </button>
          )}
        </div>
      </div>

      {/* Main Shift Details Card */}
      <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#f5efe6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#faf6f0] border border-[#ded3c3] flex items-center justify-center text-[#8c6239]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#231f1e]">الوردية المفتوحة الآن</h2>
              <p className="text-xs text-[#8c7b6d]">
                مسؤول الكاشير: <strong>{currentShift.cashierName}</strong> · بدأت في 09:00 ص
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            currentShift.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-800'
          }`}>
            {currentShift.status === 'open' ? 'قيد التشغيل' : 'مغلقة'}
          </span>
        </div>

        {/* Financial metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#faf6f0] p-4 rounded-xl border border-[#ded3c3]">
            <span className="text-[11px] font-bold text-[#8c7b6d]">رصيد بداية الدرج</span>
            <div className="text-xl font-black text-[#231f1e] font-mono mt-1">
              {currentShift.startingCash.toLocaleString()} ج
            </div>
          </div>

          <div className="bg-[#faf6f0] p-4 rounded-xl border border-[#ded3c3]">
            <span className="text-[11px] font-bold text-[#8c7b6d]">مبيعات نقدية (كاش)</span>
            <div className="text-xl font-black text-[#231f1e] font-mono mt-1">
              +{currentShift.cashSales.toLocaleString()} ج
            </div>
          </div>

          <div className="bg-[#faf6f0] p-4 rounded-xl border border-[#ded3c3]">
            <span className="text-[11px] font-bold text-[#8c7b6d]">مصروفات مسحوبة</span>
            <div className="text-xl font-black text-rose-800 font-mono mt-1">
              -{currentShift.expensesTotal.toLocaleString()} ج
            </div>
          </div>

          <div className="bg-[#231f1e] text-white p-4 rounded-xl">
            <span className="text-[11px] font-bold text-amber-300">المفروض في الدرج</span>
            <div className="text-xl font-black font-mono mt-1">
              {currentShift.expectedDrawerCash.toLocaleString()} ج
            </div>
          </div>
        </div>

        {/* Handover Instructions */}
        <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#ded3c3] flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#8c6239] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5e4e42] leading-relaxed">
            <strong>قواعد الأمان وتسليم النقدية:</strong> يقوم الكاشير بعدّ العملات الورقية والمعدنية بدقة في نهاية الشيفت ومطابقتها مع المبلغ المفروض في الدرج. أي فرق (عجز أو زيادة) يتم تسجيله وإشعار المدير به فوراً.
          </div>
        </div>
      </div>

      {/* Close Shift Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#ded3c3] shadow-2xl">
            <h3 className="text-base font-black text-[#231f1e]">تقفيل الوردية الحالية</h3>
            
            <div className="bg-[#faf6f0] p-3 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>المفروض في الدرج حسابياً:</span>
                <span className="font-mono font-bold">{currentShift.expectedDrawerCash.toLocaleString()} ج</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">النقدية الفعلية المحصية:</label>
              <input
                type="number"
                value={actualDrawer}
                onChange={(e) => setActualDrawer(Number(e.target.value))}
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-base font-mono font-bold"
              />
            </div>

            <div className={`p-3 rounded-xl text-xs font-bold flex justify-between ${
              variance === 0 ? 'bg-emerald-50 text-emerald-800' : variance < 0 ? 'bg-rose-50 text-rose-800' : 'bg-blue-50 text-blue-800'
            }`}>
              <span>{variance === 0 ? 'مطابقة تامة' : variance < 0 ? 'عجز في الدرج' : 'زيادة في الدرج'}</span>
              <span className="font-mono">{variance > 0 ? `+${variance}` : variance} ج</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">ملاحظات التسليم للكاشير القادم</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl p-2 text-xs h-16"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleClose(true)}
                className="w-full py-3 bg-[#6b4a36] hover:bg-[#54392a] text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>تأكيد الإغلاق وطباعة التقرير (A4 / طابعة فواتير)</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إغلاق فقط
                </button>
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2.5 border border-[#ded3c3] hover:bg-[#faf6f0] text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open New Shift Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#ded3c3]">
            <h3 className="text-base font-black text-[#231f1e]">فتح وردية كاشير جديدة</h3>
            <div>
              <label className="text-xs font-bold text-[#6e5f54]">رصيد فكة البداية (درج الكاش)</label>
              <input
                type="number"
                value={startCashInput}
                onChange={(e) => setStartCashInput(Number(e.target.value))}
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-mono font-bold"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleOpenNew}
                className="flex-1 py-3 bg-[#231f1e] text-white rounded-xl text-xs font-bold"
              >
                بدء الوردية الآن
              </button>
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-3 border border-[#ded3c3] text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
