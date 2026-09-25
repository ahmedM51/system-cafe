import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  Printer, ArrowRight, CheckCircle2, FileText,
  Receipt, Building2, Phone, MapPin, Shield,
  DollarSign, TrendingUp, CreditCard, Wallet, AlertTriangle,
  Gamepad2, Calendar, Clock, User
} from 'lucide-react';

export const DayReportView: React.FC = () => {
  const { 
    daySummary, currentShift, inventory, expenses, 
    setActiveView, cafeSettings, currentUser, playstations 
  } = useCafe();

  // Print Format Mode: 'a4' (Full Page Report) | 'thermal' (80mm Receipt Roll)
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');

  const handlePrint = (format?: 'a4' | 'thermal') => {
    if (format) {
      setPrintFormat(format);
    }
    // Small timeout to allow state to settle before browser print dialog
    setTimeout(() => {
      // Get the printable content based on format
      const printableSelector = format === 'thermal' ? '.printable-thermal-document' : '.printable-a4-document';
      const printContent = document.querySelector(printableSelector);
      if (!printContent) return;

      // Create a new window for printing
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) return;

      // Copy styles and content to the new window
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(cssRule => cssRule.cssText)
              .join('');
          } catch (e) {
            return '';
          }
        })
        .join('');

      // Set up the print window content
      const width = format === 'thermal' ? '76mm' : '100%';
      const padding = format === 'thermal' ? '3mm 4mm' : '10mm 12mm';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>تقرير الإقفال اليومي - ${cafeSettings.cafeName}</title>
          <meta charset="UTF-8">
          <style>
            ${styles}
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif;
              background: white;
              color: #111;
              padding: ${padding};
              width: ${width};
              margin: 0 auto;
            }
            .printable-a4-document, .printable-thermal-document {
              width: 100% !important;
              display: block !important;
              visibility: visible !important;
            }
            .no-print {
              display: none !important;
            }
            @media print {
              body {
                width: ${width};
                margin: 0;
                padding: ${padding};
              }
              .printable-a4-document, .printable-thermal-document {
                page-break-inside: auto;
              }
            }
          </style>
        </head>
        <body dir="rtl">
          ${printContent.innerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }, 150);
  };

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minAlert);
  const activePSCount = playstations.filter((p) => p.status === 'active').length;
  const currentVariance = (currentShift.actualDrawerCash || currentShift.expectedDrawerCash) - currentShift.expectedDrawerCash;

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Non-print control header */}
      <div className="no-print bg-white p-5 rounded-3xl border border-[#ded3c3] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-[#ded3c3] text-xs font-bold text-[#6e5f54] hover:bg-[#faf6f0] hover:text-[#231f1e] transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>

          <div>
            <h1 className="text-lg font-black text-[#231f1e]">تقرير الإقفال والحسابات اليومية</h1>
            <p className="text-xs text-[#8c7b6d]">اختر صيغة الطباعة المناسبة لطابعتك (ورق مكتبي A4 أو طابعة فواتير كاشير 80mm)</p>
          </div>
        </div>

        {/* Print Format Selector & Print Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Format Selector Pills */}
          <div className="flex items-center bg-[#faf6f0] p-1 rounded-2xl border border-[#ded3c3]">
            <button
              type="button"
              onClick={() => setPrintFormat('a4')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-black transition cursor-pointer ${
                printFormat === 'a4'
                  ? 'bg-[#231f1e] text-white shadow-xs'
                  : 'text-[#6e5f54] hover:text-[#231f1e]'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>ورق A4 كامل</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintFormat('thermal')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-black transition cursor-pointer ${
                printFormat === 'thermal'
                  ? 'bg-[#231f1e] text-white shadow-xs'
                  : 'text-[#6e5f54] hover:text-[#231f1e]'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-300" />
              <span>طابعة فواتير (80mm)</span>
            </button>
          </div>

          {/* Primary Print Button */}
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 py-2.5 px-6 bg-[#6b4a36] hover:bg-[#54392a] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md"
            title="طباعة التقرير بالصيغة المحددة"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الآن ({printFormat === 'a4' ? 'A4' : 'طابعة فواتير'})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. A4 REPORT FORMAT (Displayed and printed when printFormat === 'a4')     */}
      {/* ========================================================================= */}
      <div
        className={`bg-white rounded-3xl border border-[#ded3c3] shadow-md p-8 md:p-12 text-[#231f1e] printable-a4-document ${
          printFormat !== 'a4' ? 'hidden' : 'block'
        }`}
      >
        {/* Official Header */}
        <div className="pb-6 border-b-2 border-[#231f1e] flex flex-col md:flex-row items-center justify-between gap-6 avoid-break">
          {/* Right/Top: Cafe Logo & Identity */}
          <div className="flex items-center gap-4 text-center md:text-right">
            <div className="w-16 h-16 rounded-2xl border-2 border-[#231f1e] bg-white flex items-center justify-center font-serif font-black text-xl shrink-0 overflow-hidden shadow-xs">
              {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
                <img 
                  src={cafeSettings.logoImage} 
                  alt={cafeSettings.cafeName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{cafeSettings.logoText || 'HB'}</span>
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-black tracking-wider uppercase text-[#231f1e]">
                  {cafeSettings.cafeName}
                </h1>
                {cafeSettings.cafeNameAr && (
                  <span className="text-sm font-bold text-[#8c6239] bg-[#faf6f0] px-2 py-0.5 rounded-lg border border-[#e8ded0]">
                    {cafeSettings.cafeNameAr}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#716155] font-medium tracking-wide">
                {cafeSettings.tagline || 'MEET · ENJOY · CONNECT'}
              </p>
              <div className="text-[11px] text-[#8c7b6d] flex flex-wrap items-center gap-2 justify-center md:justify-start pt-1 font-sans">
                {cafeSettings.address && <span>{cafeSettings.address}</span>}
                {cafeSettings.phone && <span>• هاتف: {cafeSettings.phone}</span>}
                {cafeSettings.taxNumber && <span className="font-mono font-bold">• س.ض: {cafeSettings.taxNumber}</span>}
              </div>
            </div>
          </div>

          {/* Left: Document Badge */}
          <div className="text-center md:text-left space-y-1">
            <div className="inline-block bg-[#231f1e] text-white px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider">
              DAILY AUDIT REPORT
            </div>
            <div className="text-sm font-black text-[#8c6239] pt-1">
              تقرير الإقفال والحسابات اليومية
            </div>
            <div className="text-xs text-[#8c7b6d] font-mono">
              التاريخ: <strong>{daySummary.date}</strong> | الوقت: {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] text-[#a49586] font-mono">
              المرجع: #{Date.now().toString().slice(-8)}
            </div>
          </div>
        </div>

        {/* Document Meta Row */}
        <div className="py-4 border-b border-[#ded3c3] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs avoid-break">
          <div>
            <span className="text-[#8c7b6d] font-bold block">مسؤول الوردية:</span>
            <span className="font-black text-[#231f1e] text-sm">{currentShift.cashierName}</span>
          </div>
          <div>
            <span className="text-[#8c7b6d] font-bold block">المدير المشرف:</span>
            <span className="font-black text-[#231f1e] text-sm">{currentUser.name}</span>
          </div>
          <div>
            <span className="text-[#8c7b6d] font-bold block">العملة المعتمدة:</span>
            <span className="font-black text-[#231f1e] font-mono text-sm">{cafeSettings.currency}</span>
          </div>
          <div>
            <span className="text-[#8c7b6d] font-bold block">حالة اليوم والوردية:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>معتمد وجاهز للأرشفة</span>
            </span>
          </div>
        </div>

        {/* Section 1: Financial Performance Overview */}
        <div className="space-y-3 pt-6 avoid-break">
          <div className="flex items-center justify-between border-b pb-2 border-[#ded3c3]">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#231f1e] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8c6239]"></span>
              <span>1. المؤشرات المالية والمحاسبية العامة</span>
            </h2>
            <span className="text-xs text-[#8c7b6d] font-mono">{daySummary.orderCount} عملية بيع</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3]">
              <span className="text-[#7d6c60] font-bold block">إجمالي المبيعات (Gross Sales)</span>
              <div className="text-xl font-black text-[#231f1e] font-mono mt-1">
                {daySummary.totalSales.toLocaleString()} <span className="font-sans text-xs font-normal text-[#8c7b6d]">{cafeSettings.currency}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3]">
              <span className="text-[#7d6c60] font-bold block">المحصل نقداً (Cash Sales)</span>
              <div className="text-xl font-black text-emerald-800 font-mono mt-1">
                {daySummary.cashSales.toLocaleString()} <span className="font-sans text-xs font-normal text-[#8c7b6d]">{cafeSettings.currency}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3]">
              <span className="text-[#7d6c60] font-bold block">المحصل إلكترونياً (Visa / Card)</span>
              <div className="text-xl font-black text-blue-800 font-mono mt-1">
                {daySummary.cardSales.toLocaleString()} <span className="font-sans text-xs font-normal text-[#8c7b6d]">{cafeSettings.currency}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3]">
              <span className="text-[#7d6c60] font-bold block">تكلفة الخامات المباعة (COGS)</span>
              <div className="text-xl font-black text-rose-800 font-mono mt-1">
                -{daySummary.totalCost.toLocaleString()} <span className="font-sans text-xs font-normal text-[#8c7b6d]">{cafeSettings.currency}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3]">
              <span className="text-[#7d6c60] font-bold block">المصروفات اليومية (Expenses)</span>
              <div className="text-xl font-black text-rose-800 font-mono mt-1">
                -{daySummary.expenses.toLocaleString()} <span className="font-sans text-xs font-normal text-[#8c7b6d]">{cafeSettings.currency}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#231f1e] text-white rounded-2xl border border-[#231f1e] shadow-sm">
              <span className="text-amber-300 font-bold block text-xs">صافي الربح التقديري (Net Profit)</span>
              <div className="text-xl font-black font-mono mt-1">
                {daySummary.estimatedProfit.toLocaleString()} <span className="font-sans text-xs font-normal text-stone-300">{cafeSettings.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Sales Channels Breakdown */}
        <div className="space-y-3 pt-6 avoid-break">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#231f1e] flex items-center gap-2 border-b pb-2 border-[#ded3c3]">
            <span className="w-2 h-2 rounded-full bg-[#8c6239]"></span>
            <span>2. توزيع المبيعات بحسب قنوات الطلب</span>
          </h2>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-2xl border border-[#ded3c3] space-y-1">
              <span className="text-xs font-bold text-[#8c7b6d]">صالة (Dine-in)</span>
              <div className="text-lg font-black font-mono text-[#231f1e]">
                {daySummary.salesByChannel.dineIn.toLocaleString()} {cafeSettings.currency}
              </div>
              <div className="text-[10px] text-[#7d6c60] font-bold">
                {Math.round((daySummary.salesByChannel.dineIn / (daySummary.totalSales || 1)) * 100)}% من المبيعات
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#ded3c3] space-y-1">
              <span className="text-xs font-bold text-[#8c7b6d]">تيك أواي سفري (Takeaway)</span>
              <div className="text-lg font-black font-mono text-[#231f1e]">
                {daySummary.salesByChannel.takeaway.toLocaleString()} {cafeSettings.currency}
              </div>
              <div className="text-[10px] text-[#7d6c60] font-bold">
                {Math.round((daySummary.salesByChannel.takeaway / (daySummary.totalSales || 1)) * 100)}% من المبيعات
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#ded3c3] space-y-1">
              <span className="text-xs font-bold text-[#8c7b6d]">دليفري وتوصيل (Delivery)</span>
              <div className="text-lg font-black font-mono text-[#231f1e]">
                {daySummary.salesByChannel.delivery.toLocaleString()} {cafeSettings.currency}
              </div>
              <div className="text-[10px] text-[#7d6c60] font-bold">
                {Math.round((daySummary.salesByChannel.delivery / (daySummary.totalSales || 1)) * 100)}% من المبيعات
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Cash Drawer & Shift Reconciliation */}
        <div className="space-y-3 pt-6 avoid-break">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#231f1e] flex items-center gap-2 border-b pb-2 border-[#ded3c3]">
            <span className="w-2 h-2 rounded-full bg-[#8c6239]"></span>
            <span>3. مطابقة وجرد درج الكاش (Cash Drawer Reconciliation)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border border-[#ded3c3] rounded-2xl overflow-hidden">
              <tbody className="divide-y divide-[#f0e8dc]">
                <tr className="bg-[#faf6f0]">
                  <td className="p-3 font-bold text-[#6e5f54]">رصيد فكة بداية الوردية:</td>
                  <td className="p-3 font-mono font-bold text-[#231f1e] text-left">{currentShift.startingCash.toLocaleString()} {cafeSettings.currency}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#6e5f54]">مبيعات نقدية مضافة للدرج:</td>
                  <td className="p-3 font-mono font-bold text-emerald-700 text-left">+{currentShift.cashSales.toLocaleString()} {cafeSettings.currency}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#6e5f54]">مصروفات نقدية مسحوبة من الدرج:</td>
                  <td className="p-3 font-mono font-bold text-rose-700 text-left">-{currentShift.expensesTotal.toLocaleString()} {cafeSettings.currency}</td>
                </tr>
                <tr className="bg-[#fcfaf7]">
                  <td className="p-3 font-bold text-[#231f1e]">رصيد الكاش المفترض وجوده بالدرج:</td>
                  <td className="p-3 font-mono font-black text-sm text-[#231f1e] text-left">{currentShift.expectedDrawerCash.toLocaleString()} {cafeSettings.currency}</td>
                </tr>
                <tr className="bg-[#fcfaf7]">
                  <td className="p-3 font-bold text-[#231f1e]">رصيد الكاش الفعلي المحصي بالجرد:</td>
                  <td className="p-3 font-mono font-black text-sm text-[#231f1e] text-left">{(currentShift.actualDrawerCash || currentShift.expectedDrawerCash).toLocaleString()} {cafeSettings.currency}</td>
                </tr>
                <tr className={currentVariance === 0 ? 'bg-emerald-50 text-emerald-900 font-black' : currentVariance < 0 ? 'bg-rose-50 text-rose-900 font-black' : 'bg-blue-50 text-blue-900 font-black'}>
                  <td className="p-3">حالة المطابقة والعجز/الزيادة:</td>
                  <td className="p-3 font-mono text-left">
                    {currentVariance === 0 
                      ? 'مطابقة تامة ومتزنة (0 عجز)' 
                      : currentVariance < 0 
                      ? `عجز نقدي قدره ${Math.abs(currentVariance)} ${cafeSettings.currency}` 
                      : `زيادة نقدية قدرها +${currentVariance} ${cafeSettings.currency}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Operational Highlights (PlayStation & Low Stock) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 avoid-break">
          {/* PlayStation Operations */}
          <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#231f1e]">
              <Gamepad2 className="w-4 h-4 text-[#8c6239]" />
              <span>قسم البلايستيشن والترفيه</span>
            </div>
            <div className="text-xs text-[#5e4f44] space-y-1">
              <div className="flex justify-between">
                <span>إجمالي أجهزة الصالة:</span>
                <span className="font-mono font-bold">{playstations.length} أجهزة (PS4 & PS5)</span>
              </div>
              <div className="flex justify-between">
                <span>الأجهزة النشطة حالياً:</span>
                <span className="font-mono font-bold text-purple-700">{activePSCount} أجهزة قيد اللعب</span>
              </div>
              <div className="flex justify-between">
                <span>تسعيرة الساعة المعتمدة:</span>
                <span className="font-mono">PS4 ({cafeSettings.ps4SingleRate}/{cafeSettings.ps4MultiRate}) - PS5 ({cafeSettings.ps5SingleRate}/{cafeSettings.ps5MultiRate})</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#231f1e]">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>تنبيهات نواقص المخزون</span>
            </div>
            <div className="text-xs text-[#5e4f44]">
              {lowStockItems.length > 0 ? (
                <div className="space-y-1">
                  <span className="text-amber-800 font-bold block">
                    يوجد {lowStockItems.length} أصناف وصلت للحد الأدنى أو نفدت:
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {lowStockItems.slice(0, 4).map((it) => (
                      <span key={it.id} className="bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                        {it.nameAr} ({it.currentStock} {it.unit})
                      </span>
                    ))}
                    {lowStockItems.length > 4 && (
                      <span className="text-[10px] text-[#8c7b6d] font-bold">+{lowStockItems.length - 4} أصناف أخرى</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-emerald-800 font-bold flex items-center gap-1.5 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>جميع أصناف وخامات المخزن متوفرة فوق الحد الأدنى.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Official Signatures */}
        <div className="pt-10 border-t border-[#ded3c3] flex justify-between items-end text-xs font-bold text-[#6e5f54] avoid-break">
          <div className="text-center space-y-4">
            <p>توقيع مسؤول الكاشير والوردية</p>
            <div className="border-b border-[#231f1e] w-48 pb-1 font-mono text-[#231f1e] text-sm">
              {currentShift.cashierName}
            </div>
            <span className="text-[10px] text-[#8c7b6d]">مسؤول الصندوق</span>
          </div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#8c6239] flex items-center justify-center text-[10px] text-[#8c6239] font-bold mx-auto">
              خاتم الفرع
            </div>
            <span className="text-[9px] text-[#8c7b6d] block font-mono">VERIFIED AUDIT</span>
          </div>

          <div className="text-center space-y-4">
            <p>اعتماد وتوقيع مدير الفرع العام</p>
            <div className="border-b border-[#231f1e] w-48 pb-1 font-mono text-[#231f1e] text-sm">
              {currentUser.name}
            </div>
            <span className="text-[10px] text-[#8c7b6d]">الإدارة العامة</span>
          </div>
        </div>

        {/* Report Footer */}
        <div className="mt-8 pt-4 border-t border-[#f0e8dc] text-center text-[10px] text-[#8c7b6d] flex flex-wrap items-center justify-between gap-2 font-mono">
          <span>{cafeSettings.cafeName} Management System</span>
          <span>تم توليد التقرير آلياً: {new Date().toLocaleDateString('ar-EG')} {new Date().toLocaleTimeString('ar-EG')}</span>
          <span>الصفحة 1 من 1</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THERMAL RECEIPT 80MM (Displayed and printed when printFormat === 'thermal') */}
      {/* ========================================================================= */}
      <div
        className={`bg-white rounded-3xl border border-[#ded3c3] shadow-md p-6 max-w-sm mx-auto text-[#231f1e] printable-thermal-document ${
          printFormat !== 'thermal' ? 'hidden' : 'block'
        }`}
      >
        <div className="font-mono text-center space-y-1.5">
          {/* Logo / Monogram */}
          <div className="w-12 h-12 mx-auto rounded-full border border-[#231f1e] flex items-center justify-center font-serif font-black text-sm overflow-hidden">
            {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
              <img src={cafeSettings.logoImage} alt={cafeSettings.cafeName} className="w-full h-full object-cover" />
            ) : (
              <span>{cafeSettings.logoText || 'HB'}</span>
            )}
          </div>

          <div className="text-base font-black uppercase tracking-wider">{cafeSettings.cafeName}</div>
          {cafeSettings.cafeNameAr && (
            <div className="text-xs font-bold text-[#8c6239]">{cafeSettings.cafeNameAr}</div>
          )}
          <div className="text-[10px] text-[#6e5f54]">{cafeSettings.tagline}</div>
          <div className="text-[9px] text-[#6e5f54]">{cafeSettings.address} · هاتف: {cafeSettings.phone}</div>
          {cafeSettings.taxNumber && (
            <div className="text-[9px] text-[#6e5f54]">الرقم الضريبي: {cafeSettings.taxNumber}</div>
          )}

          <div className="border-t border-b border-dashed border-[#231f1e] py-1.5 my-2">
            <div className="text-xs font-black">تقرير إقفال الحسابات اليومية (Z-Report)</div>
            <div className="text-[10px] text-[#6e5f54]">
              {daySummary.date} | {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] text-[#6e5f54]">
              الكاشير: <strong>{currentShift.cashierName}</strong>
            </div>
          </div>

          {/* Key Totals */}
          <div className="space-y-1 text-xs py-1 text-right">
            <div className="flex justify-between">
              <span>إجمالي المبيعات:</span>
              <span className="font-bold">{daySummary.totalSales.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد الطلبات:</span>
              <span className="font-bold">{daySummary.orderCount} طلب</span>
            </div>
            <div className="flex justify-between">
              <span>المبيعات النقدية (كاش):</span>
              <span className="font-bold">{daySummary.cashSales.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>المبيعات بالفيزا / البطاقات:</span>
              <span className="font-bold">{daySummary.cardSales.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between text-rose-700">
              <span>تكلفة الخامات (COGS):</span>
              <span className="font-bold">-{daySummary.totalCost.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between text-rose-700">
              <span>المصروفات اليومية:</span>
              <span className="font-bold">-{daySummary.expenses.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="border-t border-dashed border-[#231f1e] pt-1 flex justify-between font-black text-sm">
              <span>صافي الربح التقديري:</span>
              <span>{daySummary.estimatedProfit.toLocaleString()} {cafeSettings.currency}</span>
            </div>
          </div>

          {/* Sales Channels */}
          <div className="border-t border-dashed border-[#a49586] pt-1.5 text-[11px] text-right space-y-0.5">
            <div className="text-center font-bold pb-0.5">قنوات الطلب</div>
            <div className="flex justify-between">
              <span>صالة:</span>
              <span>{daySummary.salesByChannel.dineIn.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>تيك أواي:</span>
              <span>{daySummary.salesByChannel.takeaway.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>دليفري:</span>
              <span>{daySummary.salesByChannel.delivery.toLocaleString()} {cafeSettings.currency}</span>
            </div>
          </div>

          {/* Cash Drawer Status */}
          <div className="border-t border-dashed border-[#a49586] pt-1.5 text-[11px] text-right space-y-0.5">
            <div className="text-center font-bold pb-0.5">جرد درج النقدية</div>
            <div className="flex justify-between">
              <span>فكة البداية:</span>
              <span>{currentShift.startingCash.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>المفترض بالدرج:</span>
              <span className="font-bold">{currentShift.expectedDrawerCash.toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>الفعلي المحصي:</span>
              <span className="font-bold">{(currentShift.actualDrawerCash || currentShift.expectedDrawerCash).toLocaleString()} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between font-black">
              <span>العجز / الزيادة:</span>
              <span>{currentVariance === 0 ? '0 (متزن)' : `${currentVariance} ${cafeSettings.currency}`}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t border-dashed border-[#231f1e] pt-3 text-[10px] space-y-2">
            <div className="flex justify-between">
              <span>توقيع الكاشير: ...............</span>
              <span>اعتماد الإدارة: ...............</span>
            </div>
            <div className="pt-2 text-[9px] text-[#716155]">
              *** نهاية تقرير اليوم المقفل ***
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
