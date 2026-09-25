import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { PlayStationDevice, PSMode, Product, CartItem } from '../../types';
import { 
  Gamepad2, Play, Square, Coffee, Clock, Users, User, 
  Sparkles, X, Plus, CheckCircle2, ChevronDown
} from 'lucide-react';

export const PlayStationView: React.FC = () => {
  const { 
    playstations, startPlayStation, togglePlayStationMode, 
    addDrinksToPlayStation, checkoutPlayStation, products 
  } = useCafe();

  const [selectedDeviceForStart, setSelectedDeviceForStart] = useState<PlayStationDevice | null>(null);
  const [startMode, setStartMode] = useState<PSMode>('single');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [selectedTargetMinutes, setSelectedTargetMinutes] = useState<number | undefined>(undefined);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('');

  // Add Drinks modal
  const [selectedDeviceForDrinks, setSelectedDeviceForDrinks] = useState<PlayStationDevice | null>(null);
  const [drinkItemsToAdd, setDrinkItemsToAdd] = useState<{ [productId: string]: number }>({});

  // Checkout modal
  const [selectedDeviceForCheckout, setSelectedDeviceForCheckout] = useState<PlayStationDevice | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'cash' | 'card'>('cash');

  const activeCount = playstations.filter((p) => p.status === 'active').length;

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartDevice = () => {
    if (!selectedDeviceForStart) return;
    const target = selectedTargetMinutes === -1 && customMinutesInput 
      ? parseInt(customMinutesInput, 10) 
      : selectedTargetMinutes;

    startPlayStation(selectedDeviceForStart.id, startMode, customerNameInput, target);
    setSelectedDeviceForStart(null);
    setCustomerNameInput('');
    setSelectedTargetMinutes(undefined);
    setCustomMinutesInput('');
  };

  const handleConfirmAddDrinks = () => {
    if (!selectedDeviceForDrinks) return;
    const items: CartItem[] = [];

    Object.entries(drinkItemsToAdd).forEach(([prodId, qty]) => {
      if (qty <= 0) return;
      const product = products.find((p) => p.id === prodId);
      if (product) {
        items.push({
          cartId: `ps-drink-${Date.now()}-${prodId}`,
          product,
          quantity: qty,
          unitPrice: product.price,
          totalPrice: product.price * qty,
        });
      }
    });

    if (items.length > 0) {
      addDrinksToPlayStation(selectedDeviceForDrinks.id, items);
    }
    setSelectedDeviceForDrinks(null);
    setDrinkItemsToAdd({});
  };

  const handleConfirmCheckout = () => {
    if (!selectedDeviceForCheckout) return;
    checkoutPlayStation(selectedDeviceForCheckout.id, checkoutPaymentMethod);
    setSelectedDeviceForCheckout(null);
  };

  // Group devices into PS4 and PS5
  const ps4Devices = playstations.filter((p) => p.model === 'PS4');
  const ps5Devices = playstations.filter((p) => p.model === 'PS5');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar matching Image 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">قسم البلايستيشن</h1>
          <p className="text-xs text-[#827163] mt-1 font-medium">
            تايمر مباشر، سعر الساعة لكل جلسة، ومشروبات على نفس الفاتورة.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#faf6f0] border border-[#ded3c3] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#4a3d34]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{activeCount} / 8 شغال</span>
        </div>
      </div>

      {/* PS4 Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
          <h2 className="text-sm font-black text-[#231f1e]">أجهزة PlayStation 4</h2>
          <span className="text-[11px] text-[#8c7b6d]">(سعر الساعة: فردي 30 ج / زوجي 40 ج)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ps4Devices.map((device) => {
            const isActive = device.status === 'active';
            const drinksTotal = device.linkedOrders.reduce((s, i) => s + i.totalPrice, 0);

            return (
              <div
                key={device.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
                  isActive ? 'border-[#cbbaaa] ring-1 ring-[#c2b29f]' : 'border-[#e8ded0]'
                }`}
              >
                {/* Device Top row: Device Number & Model pill */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f5efe6]">
                  <span className="text-base font-black text-[#231f1e] font-mono">
                    {device.deviceNumber}
                  </span>
                  <span className="bg-[#1c1917] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    PS4
                  </span>
                </div>

                {/* Device Middle: Timer & Cost */}
                <div className="py-6 text-center space-y-2">
                  <div className="text-3xl font-black font-mono tracking-wider text-[#231f1e]">
                    {isActive ? formatSeconds(device.elapsedSeconds) : '--:--:--'}
                  </div>

                  {isActive ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => togglePlayStationMode(device.id)}
                        className="text-xs font-bold text-[#8c6239] hover:underline cursor-pointer inline-flex items-center gap-1"
                        title="انقر للتبديل بين فردي وزوجي"
                      >
                        <span>{device.mode === 'single' ? 'فردي' : 'زوجي'}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <div className="text-xl font-black text-[#231f1e] font-mono">
                        {device.timeCost} <span className="font-sans text-sm font-bold text-[#8c7b6d]">ج</span>
                      </div>
                      {device.linkedOrders.length > 0 && (
                        <div className="text-[11px] text-[#8c6239] font-medium bg-[#faf6f0] py-0.5 px-2 rounded-full inline-block">
                          مشروبات: {drinksTotal} ج
                        </div>
                      )}

                      {/* Time limit & Expiration alert */}
                      {device.targetMinutes && (
                        <div className="pt-1.5">
                          {device.timeLimitReached || device.elapsedSeconds >= device.targetMinutes * 60 ? (
                            <div className="bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-black py-1 px-2 rounded-xl animate-pulse flex items-center justify-center gap-1 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-rose-600" />
                              <span>انتهى الوقت المحدد ({device.targetMinutes} د)!</span>
                            </div>
                          ) : (
                            <div className="bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold py-0.5 px-2 rounded-lg flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3 text-purple-600" />
                              <span>محدد: {device.targetMinutes} دقيقة</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#9e8f82] bg-[#f7f2ea] px-3 py-1 rounded-full">
                      فاضي
                    </span>
                  )}
                </div>

                {/* Device Actions */}
                <div className="pt-3 border-t border-[#f5efe6] flex gap-2">
                  {isActive ? (
                    <>
                      <button
                        onClick={() => setSelectedDeviceForCheckout(device)}
                        className="flex-1 py-2 bg-[#6b4a36] hover:bg-[#54392a] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        إنهاء
                      </button>
                      <button
                        onClick={() => setSelectedDeviceForDrinks(device)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                          device.linkedOrders.length > 0
                            ? 'bg-[#faf6f0] border-[#8c6239] text-[#8c6239]'
                            : 'border-[#ded3c3] text-[#4a3d34] hover:bg-[#f5efe6]'
                        }`}
                      >
                        <span>أضف مشروبات</span>
                        {device.linkedOrders.length > 0 && (
                          <span className="text-[9px] text-[#8c6239] font-mono">(فيه طلب مفتوح)</span>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedDeviceForStart(device);
                        setStartMode('single');
                      }}
                      className="w-full py-2 bg-white hover:bg-[#faf6f0] border border-[#ded3c3] text-[#231f1e] rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      تشغيل
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PS5 Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
          <h2 className="text-sm font-black text-[#231f1e]">أجهزة PlayStation 5</h2>
          <span className="text-[11px] text-[#8c7b6d]">(سعر الساعة: فردي 40 ج / زوجي 50 ج)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ps5Devices.map((device) => {
            const isActive = device.status === 'active';
            const drinksTotal = device.linkedOrders.reduce((s, i) => s + i.totalPrice, 0);

            return (
              <div
                key={device.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
                  isActive ? 'border-[#cbbaaa] ring-1 ring-[#c2b29f]' : 'border-[#e8ded0]'
                }`}
              >
                {/* Device Top row */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f5efe6]">
                  <span className="text-base font-black text-[#231f1e] font-mono">
                    {device.deviceNumber}
                  </span>
                  <span className="bg-[#1c1917] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    PS5
                  </span>
                </div>

                {/* Device Middle */}
                <div className="py-6 text-center space-y-2">
                  <div className="text-3xl font-black font-mono tracking-wider text-[#231f1e]">
                    {isActive ? formatSeconds(device.elapsedSeconds) : '--:--:--'}
                  </div>

                  {isActive ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => togglePlayStationMode(device.id)}
                        className="text-xs font-bold text-[#8c6239] hover:underline cursor-pointer inline-flex items-center gap-1"
                        title="انقر للتبديل بين فردي وزوجي"
                      >
                        <span>{device.mode === 'single' ? 'فردي' : 'زوجي'}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <div className="text-xl font-black text-[#231f1e] font-mono">
                        {device.timeCost} <span className="font-sans text-sm font-bold text-[#8c7b6d]">ج</span>
                      </div>
                      {device.linkedOrders.length > 0 && (
                        <div className="text-[11px] text-[#8c6239] font-medium bg-[#faf6f0] py-0.5 px-2 rounded-full inline-block">
                          مشروبات: {drinksTotal} ج
                        </div>
                      )}

                      {/* Time limit & Expiration alert */}
                      {device.targetMinutes && (
                        <div className="pt-1.5">
                          {device.timeLimitReached || device.elapsedSeconds >= device.targetMinutes * 60 ? (
                            <div className="bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-black py-1 px-2 rounded-xl animate-pulse flex items-center justify-center gap-1 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-rose-600" />
                              <span>انتهى الوقت المحدد ({device.targetMinutes} د)!</span>
                            </div>
                          ) : (
                            <div className="bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold py-0.5 px-2 rounded-lg flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3 text-purple-600" />
                              <span>محدد: {device.targetMinutes} دقيقة</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#9e8f82] bg-[#f7f2ea] px-3 py-1 rounded-full">
                      فاضي
                    </span>
                  )}
                </div>

                {/* Device Actions */}
                <div className="pt-3 border-t border-[#f5efe6] flex gap-2">
                  {isActive ? (
                    <>
                      <button
                        onClick={() => setSelectedDeviceForCheckout(device)}
                        className="flex-1 py-2 bg-[#6b4a36] hover:bg-[#54392a] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        إنهاء
                      </button>
                      <button
                        onClick={() => setSelectedDeviceForDrinks(device)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                          device.linkedOrders.length > 0
                            ? 'bg-[#faf6f0] border-[#8c6239] text-[#8c6239]'
                            : 'border-[#ded3c3] text-[#4a3d34] hover:bg-[#f5efe6]'
                        }`}
                      >
                        <span>أضف مشروبات</span>
                        {device.linkedOrders.length > 0 && (
                          <span className="text-[9px] text-[#8c6239] font-mono">(فيه طلب مفتوح)</span>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedDeviceForStart(device);
                        setStartMode('single');
                      }}
                      className="w-full py-2 bg-white hover:bg-[#faf6f0] border border-[#ded3c3] text-[#231f1e] rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      تشغيل
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selling feature banner matching Image 5 */}
      <div className="bg-[#231f1e] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300">ميزة بيع قوية</div>
            <p className="text-xs sm:text-sm text-stone-200 mt-0.5">
              العميل يلعب ويطلب مشروبات، والنظام يطلع فاتورة واحدة فيها الوقت والمشروبات والإجمالي.
            </p>
          </div>
        </div>
      </div>

      {/* Start Session Modal */}
      {selectedDeviceForStart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#ded3c3] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <h3 className="text-base font-black text-[#231f1e]">
                تشغيل {selectedDeviceForStart.model} - جهاز {selectedDeviceForStart.deviceNumber}
              </h3>
              <button onClick={() => setSelectedDeviceForStart(null)}>
                <X className="w-5 h-5 text-[#8c7b6d]" />
              </button>
            </div>

            {/* Mode selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6e5f54]">نوع اللعب والحساب</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStartMode('single')}
                  className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    startMode === 'single'
                      ? 'border-[#231f1e] bg-[#231f1e] text-white shadow-2xs'
                      : 'border-[#ded3c3] text-[#4a3d34] hover:bg-[#faf6f0]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>فردي ({selectedDeviceForStart.singleHourlyRate} ج/س)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStartMode('multi')}
                  className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    startMode === 'multi'
                      ? 'border-[#231f1e] bg-[#231f1e] text-white shadow-2xs'
                      : 'border-[#ded3c3] text-[#4a3d34] hover:bg-[#faf6f0]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>زوجي ({selectedDeviceForStart.multiHourlyRate} ج/س)</span>
                </button>
              </div>
            </div>

            {/* Target Duration / Time Limit with Alert notification */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#6e5f54]">تحديد وقت الجلسة (تنبيه آلي)</label>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                  إشعار فوري عند الانتهاء
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'وقت مفتوح', value: undefined },
                  { label: '30 دقيقة', value: 30 },
                  { label: '60 دقيقة (ساعة)', value: 60 },
                  { label: '90 دقيقة', value: 90 },
                  { label: '120 دقيقة', value: 120 },
                  { label: 'مخصص...', value: -1 },
                ].map((option, idx) => {
                  const isSelected = option.value === -1 
                    ? selectedTargetMinutes === -1 
                    : selectedTargetMinutes === option.value;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedTargetMinutes(option.value);
                        if (option.value !== -1) {
                          setCustomMinutesInput('');
                        }
                      }}
                      className={`py-2 px-1 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#231f1e] text-white border-[#231f1e] shadow-2xs'
                          : 'bg-[#faf6f0] border-[#ded3c3] text-[#4a3d34] hover:bg-[#ede5d8]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {selectedTargetMinutes === -1 && (
                <div className="pt-1">
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={customMinutesInput}
                    onChange={(e) => setCustomMinutesInput(e.target.value)}
                    placeholder="أدخل عدد الدقائق (مثال: 45)"
                    className="w-full bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              )}
            </div>

            {/* Customer name */}
            <div>
              <label className="text-xs font-bold text-[#6e5f54]">اسم العميل (اختياري)</label>
              <input
                type="text"
                value={customerNameInput}
                onChange={(e) => setCustomerNameInput(e.target.value)}
                placeholder="مثال: يوسف ومحمد"
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={handleStartDevice}
              className="w-full py-3 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              بدء العداد والوقت الآن
            </button>
          </div>
        </div>
      )}

      {/* Add Drinks to PS Modal */}
      {selectedDeviceForDrinks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#ded3c3] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <div>
                <h3 className="text-base font-black text-[#231f1e]">
                  إضافة طلبات لجهاز {selectedDeviceForDrinks.model} #{selectedDeviceForDrinks.deviceNumber}
                </h3>
                <p className="text-xs text-[#8c7b6d]">اختر مشروبات ليتم إضافتها تلقائياً على فاتورة الجلسة</p>
              </div>
              <button onClick={() => setSelectedDeviceForDrinks(null)}>
                <X className="w-5 h-5 text-[#8c7b6d]" />
              </button>
            </div>

            {/* Drinks selector */}
            <div className="max-h-60 overflow-y-auto divide-y divide-[#f5efe6] pr-1">
              {products.map((p) => {
                const qty = drinkItemsToAdd[p.id] || 0;
                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#231f1e]">{p.nameAr}</div>
                      <div className="text-[11px] text-[#8c7b6d] font-mono">{p.price} ج</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button
                          onClick={() => setDrinkItemsToAdd((prev) => ({ ...prev, [p.id]: qty - 1 }))}
                          className="w-6 h-6 rounded bg-[#f5efe6] text-xs font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                      )}
                      <span className="font-mono text-xs font-bold px-1">{qty}</span>
                      <button
                        onClick={() => setDrinkItemsToAdd((prev) => ({ ...prev, [p.id]: qty + 1 }))}
                        className="w-6 h-6 rounded bg-[#231f1e] text-white text-xs font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleConfirmAddDrinks}
              className="w-full py-3 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              تأكيد إضافة المشروبات للفاتورة
            </button>
          </div>
        </div>
      )}

      {/* Checkout PlayStation Session Modal */}
      {selectedDeviceForCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#ded3c3] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <div>
                <h3 className="text-base font-black text-[#231f1e]">إنهاء الجلسة وطباعة الفاتورة</h3>
                <p className="text-xs text-[#8c7b6d]">
                  {selectedDeviceForCheckout.model} جهاز #{selectedDeviceForCheckout.deviceNumber}
                </p>
              </div>
              <button onClick={() => setSelectedDeviceForCheckout(null)}>
                <X className="w-5 h-5 text-[#8c7b6d]" />
              </button>
            </div>

            {/* Bill breakdown */}
            <div className="bg-[#faf6f0] p-4 rounded-xl space-y-2 border border-[#ded3c3]">
              <div className="flex justify-between text-xs text-[#6e5f54]">
                <span>وقت اللعب ({formatSeconds(selectedDeviceForCheckout.elapsedSeconds)}):</span>
                <span className="font-mono font-bold">{selectedDeviceForCheckout.timeCost} ج</span>
              </div>

              {selectedDeviceForCheckout.linkedOrders.map((item) => (
                <div key={item.cartId} className="flex justify-between text-xs text-[#6e5f54]">
                  <span>{item.product.nameAr} (x{item.quantity}):</span>
                  <span className="font-mono font-bold">{item.totalPrice} ج</span>
                </div>
              ))}

              <div className="pt-2 border-t border-[#ded3c3] flex justify-between text-sm font-black text-[#231f1e]">
                <span>الإجمالي الكلي:</span>
                <span className="font-mono text-lg">
                  {selectedDeviceForCheckout.timeCost +
                    selectedDeviceForCheckout.linkedOrders.reduce((s, i) => s + i.totalPrice, 0)}{' '}
                  ج
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCheckoutPaymentMethod('cash')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                  checkoutPaymentMethod === 'cash'
                    ? 'border-[#231f1e] bg-[#231f1e] text-white'
                    : 'border-[#ded3c3] hover:bg-[#faf6f0]'
                }`}
              >
                تحصيل نقدي (كاش)
              </button>
              <button
                type="button"
                onClick={() => setCheckoutPaymentMethod('card')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                  checkoutPaymentMethod === 'card'
                    ? 'border-[#231f1e] bg-[#231f1e] text-white'
                    : 'border-[#ded3c3] hover:bg-[#faf6f0]'
                }`}
              >
                تحصيل فيزا / إلكتروني
              </button>
            </div>

            <button
              onClick={handleConfirmCheckout}
              className="w-full py-3.5 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-sm font-bold transition cursor-pointer shadow-md"
            >
              تأكيد التحصيل وإنهاء الجلسة 🖨️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
