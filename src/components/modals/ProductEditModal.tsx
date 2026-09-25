import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Product, RecipeIngredient } from '../../types';
import {
  X, Plus, Trash2, Image as ImageIcon, Upload, Check,
  Sparkles, Coffee, DollarSign, Layers, AlertCircle, Eye
} from 'lucide-react';

// Curated high-res coffee & cafe presets so the admin can pick with 1 click
const PRESET_CAFE_IMAGES = [
  { name: 'لاتيه كلاسيك', url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&auto=format&fit=crop&q=80' },
  { name: 'كابتشينو برغوة', url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80' },
  { name: 'ايس اسبانش لاتيه', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80' },
  { name: 'ايس ماتشا لاتيه', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80' },
  { name: 'وافل نوتيلا وفواكه', url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&auto=format&fit=crop&q=80' },
  { name: 'موهيتو ريدبول منعش', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80' },
  { name: 'فلات وايت أسترالي', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=80' },
  { name: 'كراميل فرابيه مثلج', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80' },
  { name: 'اسبريسو دبل إيطالي', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80' },
  { name: 'كرواسون شوكولاتة', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80' },
  { name: 'تشيز كيك بلوبيري', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80' },
  { name: 'ميلك شيك أوريو غني', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80' },
];

export const ProductEditModal: React.FC = () => {
  const {
    editingProduct, setEditingProduct,
    isProductModalOpen, setIsProductModalOpen,
    addProduct, updateProduct, deleteProduct,
    categories, addCategory, inventory, cafeSettings
  } = useCafe();

  const isEditing = Boolean(editingProduct);

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [price, setPrice] = useState<number>(60);
  const [cost, setCost] = useState<number>(20);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Sizes & Addons
  const [availableSizes, setAvailableSizes] = useState<{ name: string; priceDelta: number }[]>([]);
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeDelta, setNewSizeDelta] = useState<number>(0);

  const [availableAddons, setAvailableAddons] = useState<{ name: string; price: number }[]>([]);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState<number>(10);

  // Recipe ingredients
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'general' | 'image' | 'sizes_addons' | 'recipe'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setNameAr(editingProduct.nameAr || '');
      setNameEn(editingProduct.nameEn || '');
      setCategory(editingProduct.category || categories[0] || 'عام');
      setPrice(editingProduct.price || 60);
      setCost(editingProduct.cost || 20);
      setImage(editingProduct.image || PRESET_CAFE_IMAGES[0].url);
      setDescription(editingProduct.description || '');
      setIsAvailable(editingProduct.isAvailable !== false);
      setAvailableSizes(editingProduct.availableSizes || []);
      setAvailableAddons(editingProduct.availableAddons || []);
      setRecipe(editingProduct.recipe || []);
    } else {
      // Default new product values
      setNameAr('');
      setNameEn('');
      setCategory(categories[0] || 'قهوة ساخنة');
      setPrice(70);
      setCost(22);
      setImage(PRESET_CAFE_IMAGES[0].url);
      setDescription('');
      setIsAvailable(true);
      setAvailableSizes([
        { name: 'عادي (Regular)', priceDelta: 0 },
        { name: 'كبير (Large)', priceDelta: 15 },
      ]);
      setAvailableAddons([
        { name: 'شوت إضافي', price: 15 },
        { name: 'صوص كراميل', price: 10 },
      ]);
      setRecipe([]);
    }
    setActiveTab('general');
    setSaveSuccess(false);
  }, [editingProduct, isProductModalOpen, categories]);

  if (!isProductModalOpen) return null;

  const handleClose = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCatInput.trim()) {
      addCategory(newCatInput.trim());
      setCategory(newCatInput.trim());
      setNewCatInput('');
      setShowNewCatInput(false);
    }
  };

  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    setAvailableSizes([...availableSizes, { name: newSizeName.trim(), priceDelta: Number(newSizeDelta) }]);
    setNewSizeName('');
    setNewSizeDelta(0);
  };

  const handleRemoveSize = (index: number) => {
    setAvailableSizes(availableSizes.filter((_, i) => i !== index));
  };

  const handleAddAddon = () => {
    if (!newAddonName.trim()) return;
    setAvailableAddons([...availableAddons, { name: newAddonName.trim(), price: Number(newAddonPrice) }]);
    setNewAddonName('');
    setNewAddonPrice(10);
  };

  const handleRemoveAddon = (index: number) => {
    setAvailableAddons(availableAddons.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      alert('يرجى إدخال اسم المنتج باللغة العربية');
      return;
    }

    const payload = {
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      category: category || 'عام',
      price: Number(price),
      cost: Number(cost),
      image: image.trim() || PRESET_CAFE_IMAGES[0].url,
      description: description.trim(),
      availableSizes: availableSizes.length > 0 ? availableSizes : undefined,
      availableAddons: availableAddons.length > 0 ? availableAddons : undefined,
      recipe,
      isAvailable,
    };

    if (isEditing && editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 600);
  };

  const handleDelete = () => {
    if (isEditing && editingProduct) {
      if (confirm(`هل أنت متأكد من حذف المنتج "${editingProduct.nameAr}" نهائياً من النظام؟`)) {
        deleteProduct(editingProduct.id);
        handleClose();
      }
    }
  };

  const profit = Math.max(0, price - cost);
  const profitMarginPercent = price > 0 ? Math.round((profit / price) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#faf7f2] rounded-3xl max-w-2xl w-full border border-[#ded3c3] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#e8ded0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#231f1e] text-white flex items-center justify-center font-bold shadow-xs">
              <Coffee className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#231f1e]">
                {isEditing ? `تعديل صنف: ${editingProduct?.nameAr}` : 'إضافة منتج جديد للمنيو'}
              </h2>
              <p className="text-xs text-[#827163]">
                تحكم كامل بالاسم، السعر، الصورة، الأحجام، والإضافات دون لمس الكود
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-[#7d6c60] hover:bg-[#ede5d8] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e8ded0] bg-[#f5ede2] px-4 pt-2 gap-1 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3.5 rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white text-[#231f1e] shadow-2xs border-t-2 border-[#8c6239]'
                : 'text-[#7d6c60] hover:text-[#231f1e]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>البيانات الأساسية والتسعير</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`py-2 px-3.5 rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'image'
                ? 'bg-white text-[#231f1e] shadow-2xs border-t-2 border-[#8c6239]'
                : 'text-[#7d6c60] hover:text-[#231f1e]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>الصورة والمعاينة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sizes_addons')}
            className={`py-2 px-3.5 rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sizes_addons'
                ? 'bg-white text-[#231f1e] shadow-2xs border-t-2 border-[#8c6239]'
                : 'text-[#7d6c60] hover:text-[#231f1e]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الأحجام والإضافات ({availableSizes.length + availableAddons.length})</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#423226] mb-1">
                    اسم المنتج بالعربية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: ايس اسبانش لاتيه"
                    className="w-full bg-white border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423226] mb-1">
                    الاسم بالإنجليزية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Iced Spanish Latte"
                    className="w-full bg-white border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] dir-ltr text-left"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#423226]">التصنيف (Category)</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[11px] text-[#8c6239] hover:underline font-bold"
                  >
                    {showNewCatInput ? 'إلغاء' : '+ إضافة تصنيف جديد'}
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      placeholder="اسم التصنيف الجديد (مثال: شاي ومشروبات عشبية)"
                      className="flex-1 bg-white border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs text-[#231f1e] focus:ring-2 focus:ring-[#8c6239]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-2 bg-[#231f1e] text-white text-xs font-bold rounded-xl hover:bg-[#38312e]"
                    >
                      إضافة
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Pricing & Cost */}
              <div className="p-4 bg-white rounded-2xl border border-[#e8ded0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#231f1e] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>التسعير والربحية</span>
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-[#7d6c60]">الربح: <strong className="text-emerald-700">{profit} {cafeSettings.currency}</strong></span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                      هامش {profitMarginPercent}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">
                      سعر البيع للجمهور ({cafeSettings.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#231f1e] font-mono focus:ring-2 focus:ring-[#8c6239]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">
                      تكلفة الصنف التقديرية ({cafeSettings.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#231f1e] font-mono focus:ring-2 focus:ring-[#8c6239]"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1">
                  وصف المنتج ومكوناته
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف جذاب يوضح المذاق أو المكونات للزبون..."
                  className="w-full bg-white border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#ded3c3]">
                <div>
                  <span className="text-xs font-bold text-[#231f1e]">حالة التوفر في نقطة البيع</span>
                  <p className="text-[11px] text-[#7d6c60]">عند إلغاء التفعيل سيظهر الصنف كـ (غير متاح / نفد)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isAvailable
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {isAvailable ? '✓ متاح للطلب' : '✕ غير متوفر'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              {/* Image Preview & URL */}
              <div className="p-4 bg-white rounded-2xl border border-[#e8ded0] flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-32 h-32 rounded-2xl bg-[#ede4d7] overflow-hidden border-2 border-[#d2c5b4] shrink-0 relative shadow-inner">
                  {image ? (
                    <img src={image} alt="معاينة" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8c7b6d] text-xs">
                      <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                      <span>لا توجد صورة</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    {price} {cafeSettings.currency}
                  </span>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-bold text-[#423226] mb-1">
                      رابط الصورة المباشر (Image URL)
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs font-mono text-[#231f1e] dir-ltr text-left focus:ring-2 focus:ring-[#8c6239]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#ede5d8] hover:bg-[#ded2c3] text-[#423226] text-xs font-bold rounded-xl transition cursor-pointer border border-[#c8b9a6]">
                      <Upload className="w-4 h-4 text-[#8c6239]" />
                      <span>رفع صورة من جهازك (ملف)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Preset Gallery Picker */}
              <div>
                <h4 className="text-xs font-black text-[#231f1e] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>أو اختر صورة احترافية جاهزة بنقرة واحدة:</span>
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {PRESET_CAFE_IMAGES.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setImage(preset.url)}
                      className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        image === preset.url
                          ? 'border-[#8c6239] ring-2 ring-[#8c6239]/40 scale-95'
                          : 'border-[#ded3c3] hover:border-[#8c6239]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-16 object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-1 transition">
                        <span className="text-[10px] text-white font-bold truncate drop-shadow-sm">
                          {preset.name}
                        </span>
                      </div>
                      {image === preset.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8c6239] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sizes_addons' && (
            <div className="space-y-5">
              {/* Sizes section */}
              <div className="p-4 bg-white rounded-2xl border border-[#e8ded0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[#231f1e]">الأحجام والمقاسات (Sizes)</h4>
                    <p className="text-[11px] text-[#7d6c60]">تحديد أحجام المنتج (عادي، وسط، كبير، دبل) وفارق السعر</p>
                  </div>
                  <span className="text-[10px] bg-[#f5efe6] font-bold px-2 py-0.5 rounded-full text-[#5c4a3e]">
                    {availableSizes.length} مقاسات
                  </span>
                </div>

                {/* Existing sizes */}
                <div className="space-y-2">
                  {availableSizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 bg-[#fbf9f5] rounded-xl border border-[#ded3c3] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#231f1e]">{size.name}</span>
                        <span className="text-[#8c7b6d] text-[11px]">
                          ({size.priceDelta >= 0 ? `+${size.priceDelta}` : size.priceDelta} {cafeSettings.currency})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(index)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="حذف المقاس"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add size inline */}
                <div className="flex gap-2 pt-2 border-t border-[#f0e8dc]">
                  <input
                    type="text"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    placeholder="اسم المقاس (مثال: لارج 20oz)"
                    className="flex-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs text-[#231f1e]"
                  />
                  <input
                    type="number"
                    value={newSizeDelta}
                    onChange={(e) => setNewSizeDelta(Number(e.target.value))}
                    placeholder="فارق السعر (+15)"
                    className="w-28 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs font-mono text-[#231f1e]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3.5 py-2 bg-[#231f1e] text-white text-xs font-bold rounded-xl hover:bg-[#38312e] cursor-pointer"
                  >
                    + إضافة
                  </button>
                </div>
              </div>

              {/* Addons section */}
              <div className="p-4 bg-white rounded-2xl border border-[#e8ded0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[#231f1e]">الإضافات المتاحة (Add-ons & Extras)</h4>
                    <p className="text-[11px] text-[#7d6c60]">صوصات، نكهات سيرب، بوبا، شوت اسبريسو إضافي، حليب نباتي</p>
                  </div>
                  <span className="text-[10px] bg-[#f5efe6] font-bold px-2 py-0.5 rounded-full text-[#5c4a3e]">
                    {availableAddons.length} إضافات
                  </span>
                </div>

                {/* Existing addons */}
                <div className="space-y-2">
                  {availableAddons.map((addon, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 bg-[#fbf9f5] rounded-xl border border-[#ded3c3] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#231f1e]">{addon.name}</span>
                        <span className="text-emerald-700 font-mono font-bold text-[11px]">
                          +{addon.price} {cafeSettings.currency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddon(index)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="حذف الإضافة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add addon inline */}
                <div className="flex gap-2 pt-2 border-t border-[#f0e8dc]">
                  <input
                    type="text"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    placeholder="اسم الإضافة (مثال: بوبا تابيوكا / صوص كراميل)"
                    className="flex-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs text-[#231f1e]"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                    placeholder="سعر الإضافة (15)"
                    className="w-28 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs font-mono text-[#231f1e]"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="px-3.5 py-2 bg-[#231f1e] text-white text-xs font-bold rounded-xl hover:bg-[#38312e] cursor-pointer"
                  >
                    + إضافة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#e8ded0] flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الصنف نهائياً</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-[#7d6c60] hover:bg-[#ede5d8] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم الحفظ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>{isEditing ? 'حفظ التعديلات' : 'إضافة المنتج للمنيو'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
