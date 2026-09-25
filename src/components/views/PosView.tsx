import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Product, CartItem, OrderType } from '../../types';
import { 
  Search, Plus, Minus, Trash2, UtensilsCrossed, 
  ShoppingBag, Bike, Tag, Check, X, Sparkles, Edit3
} from 'lucide-react';

export const PosView: React.FC = () => {
  const { 
    products, cart, addToCart, removeFromCart, updateCartQuantity,
    orderType, setOrderType, cartDiscount, setCartDiscount,
    completeOrder, currentUser, tables, categories, cafeSettings,
    setEditingProduct, setIsProductModalOpen
  } = useCafe();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('كل التصنيفات');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  
  // Customization modal state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [mobileCartDrawerOpen, setMobileCartDrawerOpen] = useState(false);

  const allCategories = ['كل التصنيفات', ...categories];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'كل التصنيفات' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalTotal = Math.max(0, subtotal - cartDiscount);

  const handleOpenProductCustomizer = (product: Product) => {
    setSelectedProductForModal(product);
    setSelectedSize(product.availableSizes?.[0]?.name || '');
    setSelectedAddons([]);
    setItemNotes('');
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProductForModal) return;
    addToCart(selectedProductForModal, selectedSize, selectedAddons, itemNotes);
    setSelectedProductForModal(null);
  };

  const handleFinalCheckout = () => {
    completeOrder(paymentMethod, customerName || undefined);
    setShowCheckoutModal(false);
    setCustomerName('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Right Column (in RTL): Menu & Categories (Flex-1) */}
      <div className="flex-1 space-y-5">
        {/* Header bar matching Image 3 with Admin Quick Add */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">نقطة البيع</h1>
              {currentUser.role === 'admin' && (
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                  وضع الأدمن
                </span>
              )}
            </div>
            <p className="text-xs text-[#827163] mt-1 font-medium">
              بحث سريع، تصنيفات، مقاسات، دليفري، تيك أواي، وفاتورة صالة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ إضافة صنف</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-[#faf6f0] border border-[#ded3c3] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#4a3d34]">
              <span>الكاشير: <strong className="text-[#231f1e]">{currentUser.name}</strong></span>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مشروب أو منتج..."
            className="w-full bg-white border border-[#ded3c3] text-[#231f1e] placeholder-[#a49586] text-sm rounded-xl py-3 px-11 focus:outline-none focus:ring-2 focus:ring-[#8c6239] focus:border-transparent transition shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#9f8f80] absolute right-4 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#9f8f80] hover:text-[#231f1e]"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category Pills matching image 3 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#231f1e] text-white shadow-xs'
                  : 'bg-white border border-[#ded3c3] text-[#6d5d51] hover:bg-[#ede5d8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid matching layout in Image 3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleOpenProductCustomizer(prod)}
              className="group bg-white rounded-2xl border border-[#e8ded0] overflow-hidden shadow-xs hover:shadow-md hover:border-[#cbbaaa] transition-all cursor-pointer flex flex-col relative"
            >
              {/* Image Thumbnail */}
              <div className="relative h-32 sm:h-36 overflow-hidden bg-[#f0e7dc]">
                <img
                  src={prod.image}
                  alt={prod.nameAr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-bold">
                  {prod.price} {cafeSettings.currency}
                </span>

                {/* Admin Quick Edit Button */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(prod);
                      setIsProductModalOpen(true);
                    }}
                    title="تعديل هذا المنتج (أدمن)"
                    className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-white text-[#231f1e] rounded-lg shadow-sm backdrop-blur-xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8c6239]" />
                  </button>
                )}
              </div>

              {/* Title & Info */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-[#231f1e] group-hover:text-[#8c6239] transition">
                    {prod.nameAr}
                  </h3>
                  <p className="text-[11px] text-[#8e7e71] font-mono mt-0.5">{prod.nameEn}</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#f3ede3]">
                  <span className="text-xs text-[#8c6239] font-medium">
                    {prod.availableSizes ? `من ${prod.price} ${cafeSettings.currency}` : `${prod.price} ${cafeSettings.currency}`}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#f3ede3] text-[#4a3d34] flex items-center justify-center text-xs group-hover:bg-[#231f1e] group-hover:text-white transition">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Left Column (in RTL): Cart / Order Panel matching Image 3 (w-80 or w-96) */}
      <div id="cart-panel" className="w-full lg:w-96 shrink-0 bg-white rounded-2xl border border-[#e8ded0] p-5 shadow-xs flex flex-col justify-between self-start sticky top-20">
        <div>
          {/* Order Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
            <h2 className="text-lg font-black text-[#231f1e]">الطلب</h2>
            {cart.length > 0 && (
              <span className="text-xs font-mono font-bold bg-[#f5efe6] text-[#6d5d51] px-2.5 py-1 rounded-full">
                {cart.length} أصناف
              </span>
            )}
          </div>

          {/* Dine-In / Takeaway / Delivery Switcher matching Image 3 */}
          <div className="grid grid-cols-3 gap-1 bg-[#f5efe6] p-1 rounded-xl mt-3">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                orderType === 'dine_in'
                  ? 'bg-[#231f1e] text-white shadow-xs'
                  : 'text-[#6e5f54] hover:text-[#231f1e]'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>صالة</span>
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                orderType === 'takeaway'
                  ? 'bg-[#231f1e] text-white shadow-xs'
                  : 'text-[#6e5f54] hover:text-[#231f1e]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>تيك أواي</span>
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                orderType === 'delivery'
                  ? 'bg-[#231f1e] text-white shadow-xs'
                  : 'text-[#6e5f54] hover:text-[#231f1e]'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>دليفري</span>
            </button>
          </div>

          {/* Table select if Dine In */}
          {orderType === 'dine_in' && (
            <div className="mt-3 flex items-center justify-between bg-[#faf6f0] p-2 rounded-xl border border-[#ded3c3] text-xs">
              <span className="text-[#6e5f54] font-medium">الترابيزة:</span>
              <select
                className="bg-white border border-[#ded3c3] rounded-lg px-2 py-1 font-bold text-[#231f1e] focus:outline-none"
                defaultValue="tbl-1"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    ترابيزة {t.number} ({t.zone === 'internal' ? 'داخلية' : 'خارجية'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cart Items List */}
          <div className="mt-4 divide-y divide-[#f5efe6] max-h-[380px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-[#9f8f80]">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">السلة فارغة، اختر أصنافاً من المنيو</p>
              </div>
            ) : (
              cart.map((item) => {
                const detailsLabel = [
                  item.selectedSize,
                  ...(item.selectedAddons || [])
                ].filter(Boolean).join(' · ');

                return (
                  <div key={item.cartId} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#231f1e]">
                        {item.product.nameAr}
                        {detailsLabel && (
                          <span className="text-[11px] font-normal text-[#8c7b6d] mx-1">
                            - {detailsLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#231f1e]">
                        {item.totalPrice} <span className="font-sans font-normal text-[11px] text-[#8c7b6d]">ج</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-[#f5efe6] rounded-lg p-1">
                      <button
                        onClick={() => updateCartQuantity(item.cartId, -1)}
                        className="w-5 h-5 rounded bg-white text-[#4a3d34] flex items-center justify-center hover:bg-[#e4dcce] transition text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.cartId, 1)}
                        className="w-5 h-5 rounded bg-white text-[#4a3d34] flex items-center justify-center hover:bg-[#e4dcce] transition text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Totals & Confirm Button matching Image 3 */}
        <div className="pt-4 border-t border-[#f0e8dc] space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs text-[#716155]">
            <span>الإجمالي الفرعي</span>
            <span className="font-mono font-bold">{subtotal} ج</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#716155]">
            <button
              onClick={() => setShowDiscountModal(true)}
              className="text-[#8c6239] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Tag className="w-3 h-3" />
              <span>خصم</span>
            </button>
            <span className="font-mono font-bold text-emerald-700">
              {cartDiscount > 0 ? `-${cartDiscount} ج` : '0 ج'}
            </span>
          </div>

          <div className="flex items-center justify-between text-base font-black text-[#231f1e] pt-1">
            <span>الإجمالي</span>
            <span className="font-mono text-xl">{finalTotal} ج</span>
          </div>

          {/* Main Action Button */}
          <button
            disabled={cart.length === 0}
            onClick={() => setShowCheckoutModal(true)}
            className="w-full mt-3 py-3 rounded-xl bg-[#231f1e] hover:bg-[#38312e] disabled:bg-[#d8cfc4] disabled:cursor-not-allowed text-white text-sm font-black transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <span>تأكيد وتحصيل</span>
          </button>
        </div>
      </div>

      {/* Mobile Floating Cart Summary Bar (lg:hidden) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 px-3 py-2 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-[#231f1e] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-[#443833]">
            <div 
              onClick={() => setMobileCartDrawerOpen(true)}
              className="flex items-center gap-2.5 cursor-pointer flex-1"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-[#231f1e] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold font-mono text-amber-300">{finalTotal} ج</span>
                <span className="text-[10px] text-stone-300 block font-medium">عرض تفاصيل السلة</span>
              </div>
            </div>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="bg-white text-[#231f1e] font-black text-xs px-4 py-2 rounded-xl hover:bg-[#faf6f0] transition shadow-xs cursor-pointer"
            >
              تحصيل 💵
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cart Bottom Sheet Modal */}
      {mobileCartDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs">
          <div 
            className="flex-1"
            onClick={() => setMobileCartDrawerOpen(false)}
          />
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 border-t border-[#ded3c3]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#8c6239]" />
                <h3 className="text-base font-black text-[#231f1e]">سلة الطلب</h3>
                <span className="text-xs font-mono font-bold bg-[#faf6f0] px-2 py-0.5 rounded-full text-[#6d5d51]">
                  {cart.length} أصناف
                </span>
              </div>
              <button 
                onClick={() => setMobileCartDrawerOpen(false)}
                className="p-1 rounded-lg text-[#8c7b6d] hover:bg-[#f0e8dc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items in Mobile Modal */}
            <div className="divide-y divide-[#f5efe6] max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.cartId} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#231f1e]">{item.product.nameAr}</div>
                    <div className="text-xs font-mono text-[#8c6239]">{item.totalPrice} ج</div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#f5efe6] rounded-lg p-1">
                    <button
                      onClick={() => updateCartQuantity(item.cartId, -1)}
                      className="w-6 h-6 rounded bg-white text-xs font-bold flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.cartId, 1)}
                      className="w-6 h-6 rounded bg-white text-xs font-bold flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Confirm */}
            <div className="pt-3 border-t border-[#f0e8dc] space-y-2">
              <div className="flex justify-between text-xs text-[#716155]">
                <span>الإجمالي الفرعي:</span>
                <span className="font-mono font-bold">{subtotal} ج</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-800">
                  <span>الخصم:</span>
                  <span className="font-mono font-bold">-{cartDiscount} ج</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#231f1e] pt-1">
                <span>المطلوب:</span>
                <span className="font-mono text-xl">{finalTotal} ج</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileCartDrawerOpen(false);
                    setShowCheckoutModal(true);
                  }}
                  className="flex-1 py-3 bg-[#231f1e] text-white rounded-xl text-xs font-black transition"
                >
                  تأكيد وتحصيل الآن
                </button>
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="px-3 py-3 border border-[#ded3c3] rounded-xl text-xs font-bold text-[#8c6239]"
                >
                  خصم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Customizer Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-[#ded3c3] shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-[#231f1e]">{selectedProductForModal.nameAr}</h3>
                <p className="text-xs text-[#8c7b6d]">{selectedProductForModal.nameEn}</p>
              </div>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="p-1 rounded-lg text-[#8c7b6d] hover:bg-[#f0e8dc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sizes */}
            {selectedProductForModal.availableSizes && selectedProductForModal.availableSizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6e5f54]">المقاس والحجم</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProductForModal.availableSizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        selectedSize === size.name
                          ? 'border-[#231f1e] bg-[#231f1e] text-white'
                          : 'border-[#ded3c3] text-[#4a3d34] hover:bg-[#f5efe6]'
                      }`}
                    >
                      <span>{size.name}</span>
                      <span className="font-mono text-[11px]">
                        {size.priceDelta > 0 ? `+${size.priceDelta} ج` : 'أساسي'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {selectedProductForModal.availableAddons && selectedProductForModal.availableAddons.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6e5f54]">الإضافات الخاصة</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedProductForModal.availableAddons.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.name);
                    return (
                      <div
                        key={addon.name}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedAddons(selectedAddons.filter((a) => a !== addon.name));
                          } else {
                            setSelectedAddons([...selectedAddons, addon.name]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                          isChecked
                            ? 'border-[#8c6239] bg-[#faf6f0]'
                            : 'border-[#ded3c3] hover:bg-[#faf6f0]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded flex items-center justify-center ${
                            isChecked ? 'bg-[#8c6239] text-white' : 'border border-[#cbbaaa]'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </span>
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-mono text-[#8c6239]">+{addon.price} ج</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-[#6e5f54]">ملاحظات التحضير (سكر زيادة، بدون ثلج...)</label>
              <input
                type="text"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="أدخل ملاحظات الباريستا..."
                className="w-full mt-1.5 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={handleConfirmAddToCart}
              className="w-full py-3 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-sm font-bold transition cursor-pointer"
            >
              إضافة للطلب
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-[#ded3c3] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <div>
                <h3 className="text-lg font-black text-[#231f1e]">تحصيل الفاتورة</h3>
                <p className="text-xs text-[#8c7b6d]">اختر طريقة الدفع لتأكيد الطلب وطباعة الإيصال</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)}>
                <X className="w-5 h-5 text-[#8c7b6d]" />
              </button>
            </div>

            {/* Total display */}
            <div className="bg-[#faf6f0] p-4 rounded-xl text-center border border-[#ded3c3]">
              <span className="text-xs text-[#716155] font-medium">المبلغ المطلوب تحصيله</span>
              <div className="text-3xl font-black text-[#231f1e] font-mono mt-0.5">
                {finalTotal} <span className="font-sans text-xl">جنيه</span>
              </div>
            </div>

            {/* Customer name */}
            <div>
              <label className="text-xs font-bold text-[#6e5f54]">اسم العميل (اختياري)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: أحمد مصطفى"
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6e5f54]">طريقة الدفع</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border text-xs font-black flex flex-col items-center gap-2 cursor-pointer transition ${
                    paymentMethod === 'cash'
                      ? 'border-[#231f1e] bg-[#231f1e] text-white shadow-xs'
                      : 'border-[#ded3c3] text-[#4a3d34] hover:bg-[#faf6f0]'
                  }`}
                >
                  <span className="text-lg">💵</span>
                  <span>كاش (نقدي)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border text-xs font-black flex flex-col items-center gap-2 cursor-pointer transition ${
                    paymentMethod === 'card'
                      ? 'border-[#231f1e] bg-[#231f1e] text-white shadow-xs'
                      : 'border-[#ded3c3] text-[#4a3d34] hover:bg-[#faf6f0]'
                  }`}
                >
                  <span className="text-lg">💳</span>
                  <span>فيزا / بطاقة إلكترونية</span>
                </button>
              </div>
            </div>

            {/* Complete checkout */}
            <button
              onClick={handleFinalCheckout}
              className="w-full py-3.5 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-sm font-black transition cursor-pointer shadow-md"
            >
              إتمام الدفع وطباعة الفاتورة 🖨️
            </button>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 border border-[#ded3c3]">
            <h3 className="text-sm font-black text-[#231f1e]">تطبيق خصم على الفاتورة</h3>
            <div>
              <label className="text-xs text-[#716155]">قيمة الخصم (بالجنيه)</label>
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(Number(e.target.value))}
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-mono font-bold"
                min={0}
                max={subtotal}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCartDiscount(discountInput);
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2 bg-[#231f1e] text-white text-xs font-bold rounded-xl"
              >
                تطبيق
              </button>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 border border-[#ded3c3] text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Floating Cart Summary Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-6 sm:right-6 lg:hidden z-20 transition-transform">
          <div className="bg-[#231f1e] text-white p-3 rounded-2xl shadow-2xl border border-[#4a3d34] flex items-center justify-between">
            <button
              onClick={() => {
                const el = document.getElementById('cart-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-start cursor-pointer hover:opacity-90"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold text-xs text-[#ded3c3]">
                {cart.length}
              </div>
              <div>
                <div className="text-xs font-bold">عرض السلة</div>
                <div className="text-[11px] text-[#ded3c3] font-mono">{finalTotal} ج</div>
              </div>
            </button>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="px-4 py-2 bg-[#8c6239] hover:bg-[#a67443] text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
            >
              تأكيد وتحصيل ⚡
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
