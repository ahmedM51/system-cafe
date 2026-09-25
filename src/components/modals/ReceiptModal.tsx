import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Printer, X, CheckCircle2, Share2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, cafeSettings } = useCafe();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    // Hide all elements except the printable receipt
    const printContent = document.querySelector('.printable-receipt');
    if (!printContent) return;

    // Create a new window for printing
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    // Copy the printable content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${cafeSettings.cafeName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: white;
            padding: 4mm;
            width: 76mm;
          }
          .printable-receipt {
            width: 100%;
            text-align: center;
          }
          .border-t, .border-b {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 2px 0;
          }
          .font-black {
            font-weight: bold;
          }
          .text-xs {
            font-size: 10px;
          }
          .text-[10px] {
            font-size: 9px;
          }
          .text-[9px] {
            font-size: 8px;
          }
          .space-y-1 > * + * {
            margin-top: 4px;
          }
          .space-y-2 > * + * {
            margin-top: 8px;
          }
          .space-y-4 > * + * {
            margin-top: 16px;
          }
          .flex {
            display: flex;
          }
          .justify-between {
            justify-content: space-between;
          }
          .items-start {
            align-items: flex-start;
          }
          .max-w-[130px] {
            max-width: 130px;
          }
          .text-start {
            text-align: start;
          }
          .text-emerald-800 {
            color: #065f46;
          }
          .font-mono {
            font-family: monospace;
          }
          .font-sans {
            font-family: sans-serif;
          }
          .pt-1 {
            padding-top: 4px;
          }
          .pt-2 {
            padding-top: 8px;
          }
          .pb-1 {
            padding-bottom: 4px;
          }
          .py-2 {
            padding-top: 8px;
            padding-bottom: 8px;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          @media print {
            body {
              width: 76mm;
              margin: 0;
              padding: 3mm 4mm;
            }
          }
        </style>
      </head>
      <body>
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
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#ded3c3] shadow-2xl">
        {/* Modal controls */}
        <div className="no-print flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-black">تم تأكيد الطلب بنجاح!</span>
          </div>
          <button onClick={() => setActiveReceipt(null)} className="text-[#8c7b6d] hover:text-[#231f1e]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Area */}
        <div className="printable-receipt bg-[#fbf9f5] border border-[#e8ded0] p-5 rounded-xl text-center space-y-4 font-mono text-xs text-[#231f1e]">
          {/* Header */}
          <div className="space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full border border-[#231f1e] flex items-center justify-center font-serif font-black text-xs overflow-hidden">
              {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
                <img src={cafeSettings.logoImage} alt="شعار" className="w-full h-full object-cover" />
              ) : (
                <span>{cafeSettings.logoText || 'HB'}</span>
              )}
            </div>
            <div className="text-base font-black tracking-widest uppercase">{cafeSettings.cafeName}</div>
            {cafeSettings.cafeNameAr && (
              <div className="text-xs font-bold text-[#8c6239]">{cafeSettings.cafeNameAr}</div>
            )}
            <div className="text-[10px] text-[#716155] font-sans">{cafeSettings.tagline}</div>
            <div className="text-[10px] text-[#716155] font-sans">{cafeSettings.address} · هاتف: {cafeSettings.phone}</div>
            {cafeSettings.taxNumber && (
              <div className="text-[9px] text-[#716155] font-mono">الرقم الضريبي: {cafeSettings.taxNumber}</div>
            )}
            {cafeSettings.wifiSsid && (
              <div className="text-[9px] text-[#8c7b6d] font-mono">
                Wi-Fi: {cafeSettings.wifiSsid} | Pass: {cafeSettings.wifiPassword}
              </div>
            )}
          </div>

          <div className="border-t border-b border-dashed border-[#a49586] py-2 text-start text-[11px] space-y-1 font-sans">
            <div className="flex justify-between">
              <span>رقم الفاتورة:</span>
              <span className="font-mono font-bold">#{activeReceipt.orderNumber} ({activeReceipt.id})</span>
            </div>
            <div className="flex justify-between">
              <span>التاريخ والوقت:</span>
              <span>{new Date(activeReceipt.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>الكاشير:</span>
              <span className="font-bold">{activeReceipt.cashierName}</span>
            </div>
            {activeReceipt.tableName && (
              <div className="flex justify-between">
                <span>الموقع:</span>
                <span className="font-bold">{activeReceipt.tableName}</span>
              </div>
            )}
            {activeReceipt.playstationName && (
              <div className="flex justify-between">
                <span>الجهاز:</span>
                <span className="font-bold">{activeReceipt.playstationName}</span>
              </div>
            )}
            {activeReceipt.customerName && (
              <div className="flex justify-between">
                <span>العميل:</span>
                <span className="font-bold">{activeReceipt.customerName}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2 text-start text-[11px]">
            <div className="flex justify-between text-[#716155] font-bold border-b pb-1 border-[#ded3c3]">
              <span>الصنف</span>
              <span>الكمية x السعر</span>
              <span>الإجمالي</span>
            </div>
            {activeReceipt.items.map((item) => (
              <div key={item.cartId} className="flex justify-between items-start">
                <div className="max-w-[130px] font-sans">
                  <div className="font-bold">{item.product.nameAr}</div>
                  {item.selectedSize && <span className="text-[9px] text-[#8c7b6d]">{item.selectedSize} </span>}
                  {item.notes && <span className="text-[9px] text-[#8c7b6d]">({item.notes})</span>}
                </div>
                <div className="font-mono text-[10px] text-[#716155]">
                  {item.quantity} x {item.unitPrice}
                </div>
                <div className="font-mono font-bold">{item.totalPrice} ج</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-[#a49586] pt-2 space-y-1 text-start text-xs font-sans">
            <div className="flex justify-between text-[#716155]">
              <span>الإجمالي الفرعي:</span>
              <span className="font-mono font-bold">{activeReceipt.subtotal} ج</span>
            </div>
            {activeReceipt.discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>الخصم:</span>
                <span className="font-mono font-bold">-{activeReceipt.discount} ج</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-[#231f1e] pt-1 border-t border-[#ded3c3]">
              <span>الإجمالي النهائي:</span>
              <span className="font-mono text-lg">{activeReceipt.total} {cafeSettings.currency}</span>
            </div>
            <div className="flex justify-between text-[11px] text-[#716155] pt-1">
              <span>طريقة الدفع:</span>
              <span className="font-bold">{activeReceipt.paymentMethod === 'cash' ? 'نقدي (كاش)' : 'بطاقة إلكترونية (فيزا)'}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[10px] text-[#8c7b6d] font-sans pt-2 border-t border-dashed border-[#a49586]">
            {cafeSettings.receiptFooterMsg || 'شكراً لزيارتكم! نتشرف بلقائكم دائماً ✨'}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="no-print space-y-2 pt-2">
          <button
            onClick={handlePrint}
            className="w-full py-3 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الإيصال الفوري (80mm)</span>
          </button>
          <button
            onClick={() => setActiveReceipt(null)}
            className="w-full py-2 bg-white border border-[#ded3c3] text-[#4a3d34] hover:bg-[#faf6f0] rounded-xl text-xs font-bold transition cursor-pointer"
          >
            إغلاق ومتابعة الطلبات
          </button>
        </div>
      </div>
    </div>
  );
};
