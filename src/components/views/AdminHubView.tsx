import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import type { Product, PSModel, User, Role } from '../../types';
import { uploadImageToSupabase } from '../../services/supabaseService';
import {
  Sliders, Coffee, Image as ImageIcon, Plus, Trash2, Edit3,
  Check, Save, RefreshCw, Download, Upload, Shield, Lock,
  Gamepad2, LayoutGrid, Users, DollarSign, Tag, Wifi, Phone,
  MapPin, FileText, CheckCircle2, ChevronDown, Sparkles, AlertCircle,
  Camera, UserPlus, KeyRound, Mail, X, UserCheck, User as UserIcon
} from 'lucide-react';

export const AdminHubView: React.FC = () => {
  const {
    currentUser, products, categories, cafeSettings,
    updateCafeSettings, resetCafeSettings,
    updateProductPrice, deleteProduct, setEditingProduct, setIsProductModalOpen,
    addCategory, deleteCategory, renameCategory,
    playstations, updatePSRates, addPlayStationDevice, deletePlayStationDevice,
    tables, addTable, deleteTable, usersList,
    addUser, updateUser, deleteUser,
    exportAllData, importAllData, resetToInitialData,
    setIsLoginModalOpen, setActiveView
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'products' | 'branding' | 'categories' | 'playstation' | 'tables' | 'users' | 'backup'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // Quick price editing state
  const [quickPriceMap, setQuickPriceMap] = useState<{ [id: string]: number }>({});
  const [savedPriceId, setSavedPriceId] = useState<string | null>(null);

  // Branding form state
  const [brandForm, setBrandForm] = useState({ ...cafeSettings });
  const [brandSaveSuccess, setBrandSaveSuccess] = useState(false);

  // Keep brandForm updated if cafeSettings changes
  useEffect(() => {
    setBrandForm({ ...cafeSettings });
  }, [cafeSettings]);

  // Category management state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatOld, setEditingCatOld] = useState<string | null>(null);
  const [editingCatNew, setEditingCatNew] = useState('');

  // PlayStation rate form
  const [psRates, setPsRates] = useState({
    ps4Single: cafeSettings.ps4SingleRate,
    ps4Multi: cafeSettings.ps4MultiRate,
    ps5Single: cafeSettings.ps5SingleRate,
    ps5Multi: cafeSettings.ps5MultiRate,
  });
  const [psRatesSuccess, setPsRatesSuccess] = useState(false);

  // New Table form
  const [newTableNum, setNewTableNum] = useState<number>(() => {
    return tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
  });
  const [newTableZone, setNewTableZone] = useState<'internal' | 'outdoor'>('internal');
  const [newTableCap, setNewTableCap] = useState<number>(4);

  // Import JSON input
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // User Management State (Name, Avatar, Role control for users & admin)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState<{
    name: string;
    avatar: string;
    role: Role;
    phone: string;
    pin: string;
    email: string;
  }>({
    name: '',
    avatar: '',
    role: 'cashier',
    phone: '',
    pin: '',
    email: '',
  });
  const [isUploadingUserAvatar, setIsUploadingUserAvatar] = useState(false);
  const [userActionMessage, setUserActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: Role;
    phone: string;
    pin: string;
    avatar: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    phone: '',
    pin: '',
    avatar: '',
  });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Access Control Guard
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-[#ded3c3] shadow-xl text-center space-y-5" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[#231f1e]">منطقة مخصصة للمدير العام فقط</h2>
          <p className="text-xs text-[#7d6c60] max-w-md mx-auto">
            لوحة تحكم الإدارة وتعديل المنتجات، والأسعار، والمستخدمين، والإعدادات تتطلب صلاحيات المدير العام (Admin).
          </p>
        </div>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-6 py-3 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 mx-auto"
        >
          <Shield className="w-4 h-4 text-amber-300" />
          <span>تسجيل الدخول كمدير عام</span>
        </button>
      </div>
    );
  }

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nameAr.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.nameEn.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = selectedCatFilter === 'all' || p.category === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  // Handle Quick Price Update
  const handleSaveQuickPrice = (prodId: string) => {
    const newPrice = quickPriceMap[prodId];
    if (newPrice !== undefined && newPrice >= 0) {
      updateProductPrice(prodId, newPrice);
      setSavedPriceId(prodId);
      setTimeout(() => setSavedPriceId(null), 1500);
    }
  };

  // Handle Branding Save
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateCafeSettings(brandForm);
    setBrandSaveSuccess(true);
    setTimeout(() => setBrandSaveSuccess(false), 2000);
  };

  // Handle Logo File Upload for Branding
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBrandForm((prev) => ({
            ...prev,
            logoImage: event.target?.result as string,
            logoType: 'image',
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  // Handle Save PS Rates
  const handleSavePSRates = (e: React.FormEvent) => {
    e.preventDefault();
    updatePSRates(psRates);
    setPsRatesSuccess(true);
    setTimeout(() => setPsRatesSuccess(false), 2000);
  };

  // Handle Add Table
  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTable({
      number: Number(newTableNum),
      zone: newTableZone,
      capacity: Number(newTableCap),
    });
    setNewTableNum((prev) => prev + 1);
  };

  // Handle Export Backup
  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hub-cafe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Import Backup
  const handleImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) return;
    const ok = importAllData(importJsonText.trim());
    if (ok) {
      setImportSuccess(true);
      setImportJsonText('');
      setTimeout(() => setImportSuccess(false), 2500);
    } else {
      setImportError('الملف الذي أدخلته غير صالح أو يحتوي على أخطاء برمجية. يرجى التأكد من الصيغة.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Cafe Identity Live Overview */}
      <div className="bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#ded3c3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl border-2 border-[#231f1e] bg-[#faf6f0] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
            {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
              <img src={cafeSettings.logoImage} alt="شعار الكافيه" className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif font-black text-xl text-[#231f1e]">{cafeSettings.logoText || 'HB'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#231f1e] tracking-tight">{cafeSettings.cafeName}</h1>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                لوحة تحكم المدير
              </span>
            </div>
            <p className="text-xs text-[#7d6c60] mt-0.5">
              {cafeSettings.tagline} · تحكم فوري بالأسماء، الأسعار، الصور، الإضافات، والشعار دون الحاجة للرجوع للكود.
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#423226]">
          <div className="bg-[#f5ede2] px-3 py-1.5 rounded-xl border border-[#e2d5c3] flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-[#8c6239]" />
            <span><strong>{products.length}</strong> أصناف</span>
          </div>

          <div className="bg-[#f5ede2] px-3 py-1.5 rounded-xl border border-[#e2d5c3] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#8c6239]" />
            <span><strong>{categories.length}</strong> تصنيفات</span>
          </div>

          <div className="bg-[#f5ede2] px-3 py-1.5 rounded-xl border border-[#e2d5c3] flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-[#8c6239]" />
            <span><strong>{playstations.length}</strong> أجهزة PS</span>
          </div>

          <div className="bg-[#f5ede2] px-3 py-1.5 rounded-xl border border-[#e2d5c3] flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-[#8c6239]" />
            <span><strong>{tables.length}</strong> ترابيزات</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex bg-[#ede5d8] p-1.5 rounded-2xl border border-[#ded3c3] gap-1 overflow-x-auto text-xs font-bold select-none">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-[#231f1e] text-white shadow-xs'
              : 'text-[#5e4f44] hover:bg-white/60'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>المنيو والمنتجات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-[#231f1e] text-white shadow-xs'
              : 'text-[#5e4f44] hover:bg-white/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>الاسم، الشعار والهوية</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-[#231f1e] text-white shadow-xs'
              : 'text-[#5e4f44] hover:bg-white/60'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>التصنيفات ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playstation')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'playstation'
              ? 'bg-[#231f1e] text-white shadow-xs'
              : 'text-[#5e4f44] hover:bg-white/60'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>تسعيرة البلايستيشن</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'tables'
              ? 'bg-[#231f1e] text-white shadow-xs'
              : 'text-[#5e4f44] hover:bg-white/60'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>الترابيزات والصالات</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#231f1e] text-white shadow-xs'
              : 'text-[#5e4f44] hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>المستخدمين والصلاحيات</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-[#231f1e] text-white shadow-xs'
              : 'text-[#5e4f44] hover:bg-white/60'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>النسخ الاحتياطي (Backup)</span>
        </button>
      </div>

      {/* ================= TAB 1: PRODUCTS & MENU CMS ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#ded3c3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="بحث بالاسم العربي أو الإنجليزي..."
                className="bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] sm:w-64"
              />

              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
              >
                <option value="all">كل التصنيفات ({products.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c} ({products.filter((p) => p.category === c).length})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ إضافة منتج جديد</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const currentPrice = quickPriceMap[prod.id] !== undefined ? quickPriceMap[prod.id] : prod.price;
              const isSaved = savedPriceId === prod.id;
              const profit = Math.max(0, prod.price - prod.cost);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[#ded3c3] p-4 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#b8a693] transition"
                >
                  <div>
                    {/* Top Row: Thumbnail + Category & Availability */}
                    <div className="flex gap-3 items-start">
                      <div className="w-16 h-16 rounded-xl bg-[#f5ede2] overflow-hidden border border-[#d2c5b4] shrink-0 relative">
                        <img src={prod.image} alt={prod.nameAr} className="w-full h-full object-cover" />
                        {prod.isAvailable === false && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-bold">
                            غير متاح
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] bg-[#f5ede2] text-[#5e4f44] px-2 py-0.5 rounded-md font-bold truncate">
                            {prod.category}
                          </span>
                          <span className="text-[10px] text-emerald-800 font-mono font-bold">
                            ربح: {profit} {cafeSettings.currency}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-[#231f1e] mt-1 truncate">{prod.nameAr}</h3>
                        <p className="text-[10px] text-[#8c7b6d] font-mono truncate">{prod.nameEn}</p>
                      </div>
                    </div>

                    {/* Extras & Sizes count */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#f0e8dc] text-[11px] text-[#7d6c60]">
                      <span>الأحجام: <strong>{prod.availableSizes?.length || 1}</strong></span>
                      <span>•</span>
                      <span>الإضافات: <strong>{prod.availableAddons?.length || 0}</strong></span>
                      <span>•</span>
                      <span>التكلفة: <strong className="font-mono">{prod.cost} {cafeSettings.currency}</strong></span>
                    </div>
                  </div>

                  {/* Bottom Row: Quick Price Edit + Full Edit & Delete buttons */}
                  <div className="mt-4 pt-3 border-t border-[#f0e8dc] flex items-center justify-between gap-2">
                    {/* Quick Price Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-[#423226]">السعر:</span>
                      <input
                        type="number"
                        min="0"
                        value={currentPrice}
                        onChange={(e) =>
                          setQuickPriceMap({ ...quickPriceMap, [prod.id]: Number(e.target.value) })
                        }
                        className="w-16 bg-[#faf6f0] border border-[#ded3c3] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#231f1e] text-center"
                      />
                      <span className="text-[10px] text-[#8c7b6d]">{cafeSettings.currency}</span>

                      {quickPriceMap[prod.id] !== undefined && quickPriceMap[prod.id] !== prod.price && (
                        <button
                          onClick={() => handleSaveQuickPrice(prod.id)}
                          className="p-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                          title="حفظ السعر الجديد"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isSaved && (
                        <span className="text-[10px] text-emerald-700 font-bold animate-pulse">تم الحفظ!</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#f0e7dc] hover:bg-[#e4d7c6] text-[#423226] text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="تعديل المنتج والأسماء والصورة"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#8c6239]" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف الصنف "${prod.nameAr}" نهائياً؟`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: BRANDING & LOGO CMS ================= */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#ded3c3] shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#231f1e]">هوية الكافيه والشعار (Branding & Logo)</h2>
              <p className="text-xs text-[#7d6c60] mt-0.5">
                تعديل اسم الكافيه، الشعار، الشعار النصي، بيانات التواصل ورسالة الفاتورة المطبوعة للعميل
              </p>
            </div>

            {/* Live Visual Preview of Logo & Header */}
            <div className="p-4 bg-[#f8f5ee] rounded-2xl border border-[#ded3c3] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#231f1e] bg-white flex items-center justify-center font-serif font-black text-sm text-[#231f1e] overflow-hidden shadow-xs">
                  {brandForm.logoType === 'image' && brandForm.logoImage ? (
                    <img src={brandForm.logoImage} alt="شعار" className="w-full h-full object-cover" />
                  ) : (
                    <span>{brandForm.logoText || 'HB'}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base text-[#231f1e] uppercase">
                      {brandForm.cafeName || 'HUB CAFE'}
                    </span>
                    <span className="text-[9px] bg-[#231f1e] text-white px-1.5 py-0.5 rounded font-mono">
                      POS
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8c7b6d] tracking-widest font-mono">
                    {brandForm.tagline || 'MEET · ENJOY · CONNECT'}
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                ✓ معاينة حية لما سيظهر في الهيدر والفواتير
              </div>
            </div>

            {/* Logo Settings */}
            <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] space-y-4">
              <h3 className="text-xs font-black text-[#231f1e]">إعدادات اللوجو والشعار</h3>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-[#423226] cursor-pointer">
                  <input
                    type="radio"
                    name="logoType"
                    checked={brandForm.logoType === 'initials'}
                    onChange={() => setBrandForm({ ...brandForm, logoType: 'initials' })}
                    className="accent-[#8c6239]"
                  />
                  <span>شعار دائري بحروف مختصرة (مثل HB)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-[#423226] cursor-pointer">
                  <input
                    type="radio"
                    name="logoType"
                    checked={brandForm.logoType === 'image'}
                    onChange={() => setBrandForm({ ...brandForm, logoType: 'image' })}
                    className="accent-[#8c6239]"
                  />
                  <span>صورة لوجو مخصصة (Upload / URL)</span>
                </label>
              </div>

              {brandForm.logoType === 'initials' ? (
                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-[#423226] mb-1">
                    الحروف المختصرة داخل الشعار
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={brandForm.logoText}
                    onChange={(e) => setBrandForm({ ...brandForm, logoText: e.target.value.toUpperCase() })}
                    placeholder="HB"
                    className="bg-white border border-[#ded3c3] rounded-xl px-3.5 py-2 text-sm font-bold text-[#231f1e] font-mono"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-[#423226] mb-1">
                      رابط صورة اللوجو (Image URL)
                    </label>
                    <input
                      type="url"
                      value={brandForm.logoImage || ''}
                      onChange={(e) => setBrandForm({ ...brandForm, logoImage: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white border border-[#ded3c3] rounded-xl px-3 py-2 text-xs font-mono text-[#231f1e] dir-ltr text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#423226] mb-1">
                      أو رفع صورة اللوجو من جهازك
                    </label>
                    <label className="flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-[#ede5d8] text-[#423226] text-xs font-bold rounded-xl transition cursor-pointer border border-[#ded3c3]">
                      <Upload className="w-4 h-4 text-[#8c6239]" />
                      <span>اختر ملف من الكمبيوتر</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1">
                  اسم الكافيه بالإنجليزية (Main Brand Name)
                </label>
                <input
                  type="text"
                  required
                  value={brandForm.cafeName}
                  onChange={(e) => setBrandForm({ ...brandForm, cafeName: e.target.value })}
                  placeholder="HUB CAFE"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1">
                  اسم الكافيه بالعربية
                </label>
                <input
                  type="text"
                  value={brandForm.cafeNameAr}
                  onChange={(e) => setBrandForm({ ...brandForm, cafeNameAr: e.target.value })}
                  placeholder="هَب كافيه"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1">
                  الشعار اللفظي (Slogan / Tagline)
                </label>
                <input
                  type="text"
                  value={brandForm.tagline}
                  onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                  placeholder="MEET · ENJOY · CONNECT"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1">
                  رمز العملة الافتراضية
                </label>
                <input
                  type="text"
                  value={brandForm.currency}
                  onChange={(e) => setBrandForm({ ...brandForm, currency: e.target.value })}
                  placeholder="ج.م أو EGP أو ر.س"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#231f1e]"
                />
              </div>
            </div>

            {/* Contact & Receipt Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>رقم الهاتف وخدمة العملاء</span>
                </label>
                <input
                  type="text"
                  value={brandForm.phone}
                  onChange={(e) => setBrandForm({ ...brandForm, phone: e.target.value })}
                  placeholder="+20 100 433 6000"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs font-mono text-[#231f1e] dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>العنوان والفرع</span>
                </label>
                <input
                  type="text"
                  value={brandForm.address}
                  onChange={(e) => setBrandForm({ ...brandForm, address: e.target.value })}
                  placeholder="شارع النصر، المعادي، القاهرة"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>الرقم الضريبي (Tax Registration No)</span>
                </label>
                <input
                  type="text"
                  value={brandForm.taxNumber || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, taxNumber: e.target.value })}
                  placeholder="342-890-112"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs font-mono text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>رقم السجل التجاري (Commercial Reg)</span>
                </label>
                <input
                  type="text"
                  value={brandForm.commercialRegister || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, commercialRegister: e.target.value })}
                  placeholder="78291"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs font-mono text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>اسم شبكة الواي فاي للزبائن (SSID)</span>
                </label>
                <input
                  type="text"
                  value={brandForm.wifiSsid || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, wifiSsid: e.target.value })}
                  placeholder="HUB_CAFE_GUEST"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs font-mono text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423226] mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>كلمة سر الواي فاي (Password)</span>
                </label>
                <input
                  type="text"
                  value={brandForm.wifiPassword || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, wifiPassword: e.target.value })}
                  placeholder="hubcafe@2026"
                  className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs font-mono text-[#231f1e]"
                />
              </div>
            </div>

            {/* Receipt Footer Message */}
            <div>
              <label className="block text-xs font-bold text-[#423226] mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8c6239]" />
                <span>رسالة أسفل الفاتورة (Receipt Footer Message)</span>
              </label>
              <textarea
                rows={2}
                value={brandForm.receiptFooterMsg || ''}
                onChange={(e) => setBrandForm({ ...brandForm, receiptFooterMsg: e.target.value })}
                placeholder="شكراً لزيارتكم! نتشرف بلقائكم دائماً..."
                className="w-full bg-[#fbf9f5] border border-[#ded3c3] rounded-xl px-3.5 py-2 text-xs text-[#231f1e]"
              />
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-[#ded3c3] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  resetCafeSettings();
                  setBrandForm({ ...cafeSettings });
                }}
                className="text-xs text-[#8c7b6d] hover:text-[#231f1e] font-bold"
              >
                استعادة الإعدادات الأصلية
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
              >
                {brandSaveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم حفظ الهوية والشعار بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>حفظ التعديلات فورياً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 3: CATEGORIES CMS ================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#ded3c3] shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-black text-[#231f1e]">إدارة تصنيفات المنيو (Categories)</h2>
              <p className="text-xs text-[#7d6c60] mt-0.5">
                إضافة تصنيفات جديدة، تعديل الأسماء، أو حذف التصنيفات وتحديث القوائم فورياً في نقطة البيع
              </p>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="اسم التصنيف الجديد (مثال: عصائر فريش، سموذي، مخبوزات)..."
                className="flex-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3.5 py-2.5 text-xs text-[#231f1e] focus:ring-2 focus:ring-[#8c6239]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ إضافة التصنيف</span>
              </button>
            </form>

            {/* Categories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                const isEditingThis = editingCatOld === cat;

                return (
                  <div
                    key={cat}
                    className="p-3.5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] flex items-center justify-between gap-2"
                  >
                    {isEditingThis ? (
                      <div className="flex-1 flex gap-1">
                        <input
                          type="text"
                          value={editingCatNew}
                          onChange={(e) => setEditingCatNew(e.target.value)}
                          className="flex-1 bg-white border border-[#ded3c3] rounded-lg px-2 py-1 text-xs font-bold text-[#231f1e]"
                        />
                        <button
                          onClick={() => {
                            if (editingCatNew.trim()) {
                              renameCategory(cat, editingCatNew.trim());
                            }
                            setEditingCatOld(null);
                          }}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-black text-[#231f1e]">{cat}</span>
                        <p className="text-[11px] text-[#8c7b6d]">{count} أصناف مسجلة</p>
                      </div>
                    )}

                    {!isEditingThis && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCatOld(cat);
                            setEditingCatNew(cat);
                          }}
                          className="p-1.5 text-[#8c7b6d] hover:text-[#231f1e] hover:bg-white rounded-lg cursor-pointer"
                          title="تعديل اسم التصنيف"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف التصنيف "${cat}"؟ سيتم تحويل المنتجات المرتبطة به إلى تصنيف عام.`)) {
                              deleteCategory(cat);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="حذف التصنيف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PLAYSTATION RATES CMS ================= */}
      {activeTab === 'playstation' && (
        <div className="space-y-5">
          {/* Rate Editor Card */}
          <form onSubmit={handleSavePSRates} className="bg-white p-6 rounded-3xl border border-[#ded3c3] shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-black text-[#231f1e]">تسعيرة البلايستيشن وإدارة الأجهزة (PlayStation CMS)</h2>
              <p className="text-xs text-[#7d6c60] mt-0.5">
                تعديل سعر الساعة للفردي والزوجي لأجهزة PS4 و PS5 وتطبيقها فورياً على جميع الأجهزة
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PS4 Rates */}
              <div className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ded3c3] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#231f1e]">أجهزة PlayStation 4</span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full font-mono">PS4</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">سعر الفردي / ساعة</label>
                    <input
                      type="number"
                      min="0"
                      value={psRates.ps4Single}
                      onChange={(e) => setPsRates({ ...psRates, ps4Single: Number(e.target.value) })}
                      className="w-full bg-white border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-bold font-mono text-[#231f1e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">سعر الزوجي / ساعة</label>
                    <input
                      type="number"
                      min="0"
                      value={psRates.ps4Multi}
                      onChange={(e) => setPsRates({ ...psRates, ps4Multi: Number(e.target.value) })}
                      className="w-full bg-white border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-bold font-mono text-[#231f1e]"
                    />
                  </div>
                </div>
              </div>

              {/* PS5 Rates */}
              <div className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ded3c3] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#231f1e]">أجهزة PlayStation 5</span>
                  <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full font-mono">PS5</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">سعر الفردي / ساعة</label>
                    <input
                      type="number"
                      min="0"
                      value={psRates.ps5Single}
                      onChange={(e) => setPsRates({ ...psRates, ps5Single: Number(e.target.value) })}
                      className="w-full bg-white border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-bold font-mono text-[#231f1e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">سعر الزوجي / ساعة</label>
                    <input
                      type="number"
                      min="0"
                      value={psRates.ps5Multi}
                      onChange={(e) => setPsRates({ ...psRates, ps5Multi: Number(e.target.value) })}
                      className="w-full bg-white border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-bold font-mono text-[#231f1e]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#7d6c60]">يتم حفظ الأسعار في النظام وتطبيقها على حسابات الوقت الحالية والقادمة.</span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                {psRatesSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم تطبيق الأسعار الجديدة!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>تطبيق الأسعار على كافة الأجهزة</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Devices List & Add Device */}
          <div className="bg-white p-6 rounded-3xl border border-[#ded3c3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#231f1e]">قائمة أجهزة البلايستيشن ({playstations.length} أجهزة)</h3>
                <p className="text-xs text-[#7d6c60]">إضافة جهاز جديد أو حذف جهاز من الصالة</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addPlayStationDevice('PS4')}
                  className="px-3 py-1.5 bg-[#f0e7dc] hover:bg-[#e4d7c6] text-[#423226] text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  + إضافة جهاز PS4
                </button>
                <button
                  type="button"
                  onClick={() => addPlayStationDevice('PS5')}
                  className="px-3 py-1.5 bg-[#231f1e] text-white text-xs font-bold rounded-xl hover:bg-[#38312e] transition cursor-pointer"
                >
                  + إضافة جهاز PS5
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {playstations.map((ps) => (
                <div
                  key={ps.id}
                  className="p-3 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        ps.model === 'PS5' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {ps.model}
                      </span>
                      <span className="text-xs font-black text-[#231f1e]">جهاز #{ps.deviceNumber}</span>
                    </div>
                    <p className="text-[10px] text-[#8c7b6d] mt-1">
                      {ps.singleHourlyRate} ج / {ps.multiHourlyRate} ج
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف ${ps.model} رقم ${ps.deviceNumber}؟`)) {
                        deletePlayStationDevice(ps.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="حذف الجهاز"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: TABLES CMS ================= */}
      {activeTab === 'tables' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-[#ded3c3] shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-black text-[#231f1e]">إدارة الترابيزات والصالات (Tables & Zones)</h2>
              <p className="text-xs text-[#7d6c60] mt-0.5">
                إضافة ترابيزات جديدة، تحديد القاعة (داخلي أو خارجي)، وضبط السعة الاستيعابية
              </p>
            </div>

            {/* Add Table Form */}
            <form onSubmit={handleAddTableSubmit} className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">رقم الترابيزة</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(Number(e.target.value))}
                  className="w-24 bg-white border border-[#ded3c3] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#231f1e]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">القاعة / الصالة</label>
                <select
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value as 'internal' | 'outdoor')}
                  className="bg-white border border-[#ded3c3] rounded-xl px-3 py-1.5 text-xs text-[#231f1e]"
                >
                  <option value="internal">الصالة الداخلية (Internal)</option>
                  <option value="outdoor">القاعة الخارجية / الروف (Outdoor)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">سعة الكراسي (أفراد)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={newTableCap}
                  onChange={(e) => setNewTableCap(Number(e.target.value))}
                  className="w-24 bg-white border border-[#ded3c3] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#231f1e]"
                />
              </div>

              <div className="self-end pt-4">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>+ إضافة ترابيزة</span>
                </button>
              </div>
            </form>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="p-3 bg-[#fbf9f5] rounded-2xl border border-[#ded3c3] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#231f1e]">طاولة #{table.number}</span>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف طاولة رقم ${table.number}؟`)) {
                          deleteTable(table.id);
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 text-[10px] text-[#7d6c60] space-y-0.5">
                    <div>{table.zone === 'internal' ? 'داخلية' : 'خارجية (روف)'}</div>
                    <div>سعة: <strong>{table.capacity} أفراد</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: USERS & STAFF CMS ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#ded3c3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#231f1e]">إدارة المستخدمين والمشرفين (Users & Admin CMS)</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    مزامنة Supabase السحابية
                  </span>
                </div>
                <p className="text-xs text-[#7d6c60] mt-1">
                  تحكم كامل في أسماء المستخدمين والمديرين، تغيير الصور الشخصية، تعديل الصلاحيات، وإضافة حسابات جديدة لكاشير الوردية.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewUserForm({
                    name: '',
                    email: '',
                    password: '',
                    role: 'cashier',
                    phone: '',
                    pin: '',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                  });
                  setIsAddUserOpen(true);
                  setUserActionMessage(null);
                }}
                className="px-4 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-2 shrink-0"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>+ إضافة مستخدم / كاشير جديد</span>
              </button>
            </div>

            {/* Quick Stat Counter */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-[#faf6f0] p-3 rounded-2xl border border-[#ded3c3] text-center">
                <div className="text-[11px] text-[#7d6c60] font-semibold">إجمالي الحسابات</div>
                <div className="text-lg font-black text-[#231f1e] font-mono mt-0.5">{usersList.length}</div>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 text-center">
                <div className="text-[11px] text-amber-800 font-semibold">المدير العام (Admins)</div>
                <div className="text-lg font-black text-amber-900 font-mono mt-0.5">
                  {usersList.filter((u) => u.role === 'admin').length}
                </div>
              </div>
              <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200 text-center">
                <div className="text-[11px] text-blue-800 font-semibold">الكاشير ونقاط البيع</div>
                <div className="text-lg font-black text-blue-900 font-mono mt-0.5">
                  {usersList.filter((u) => u.role === 'cashier').length}
                </div>
              </div>
            </div>

            {/* Feedback alert */}
            {userActionMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                  userActionMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {userActionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{userActionMessage.text}</span>
              </div>
            )}
          </div>

          {/* Users List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersList.map((user) => (
              <div
                key={user.id}
                className="bg-white p-5 rounded-3xl border border-[#ded3c3] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8c6239]/50 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar with quick direct upload or edit */}
                  <div className="relative group shrink-0">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d2c5b4] shadow-xs"
                    />
                    <label
                      className="absolute inset-0 bg-black/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer"
                      title="اضغط لرفع صورة جديدة لهذا المستخدم مباشرة"
                    >
                      <Camera className="w-4 h-4 mb-0.5 text-amber-300" />
                      <span>تغيير</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUserActionMessage({ type: 'success', text: `جارٍ رفع صورة جديدة لـ ${user.name}...` });
                          const result = await uploadImageToSupabase(file, 'avatars');
                          if (result.url) {
                            await updateUser(user.id, { avatar: result.url });
                            setUserActionMessage({
                              type: 'success',
                              text: `تم تحديث وحفظ صورة ${user.name} بنجاح في قاعدة البيانات!`
                            });
                            setTimeout(() => setUserActionMessage(null), 3500);
                          } else {
                            setUserActionMessage({ type: 'error', text: result.error || 'فشل في رفع الصورة' });
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-[#231f1e] truncate">{user.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}
                      >
                        {user.role === 'admin' ? 'مدير عام (Admin)' : 'كاشير (Cashier)'}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-[#7d6c60] dir-ltr text-right truncate">
                      {user.email}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#5e4f44]">
                      {user.phone && (
                        <span>الهاتف: <strong className="font-mono text-[#231f1e]">{user.phone}</strong></span>
                      )}
                      {user.pin && (
                        <span>رمز PIN: <strong className="font-mono text-[#231f1e] bg-[#faf6f0] px-1.5 py-0.5 rounded border border-[#ded3c3]">{user.pin}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-[#f0e7db] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Edit Name & Avatar Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUserId(user.id);
                        setEditUserForm({
                          name: user.name,
                          avatar: user.avatar || '',
                          role: user.role,
                          phone: user.phone || '',
                          pin: user.pin || '',
                          email: user.email,
                        });
                      }}
                      className="px-3 py-1.5 bg-[#f0e7dc] hover:bg-[#e2d5c3] text-[#423226] text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#8c6239]" />
                      <span>تعديل الاسم والصورة</span>
                    </button>

                    {/* Toggle Role Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        const newRole: Role = user.role === 'admin' ? 'cashier' : 'admin';
                        await updateUser(user.id, { role: newRole });
                        setUserActionMessage({
                          type: 'success',
                          text: `تم تغيير صلاحية ${user.name} إلى ${newRole === 'admin' ? 'مدير عام' : 'كاشير'}`
                        });
                        setTimeout(() => setUserActionMessage(null), 3000);
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#f6eee4] border border-[#d8c8b4] text-[#5c4a3e] text-xs font-semibold rounded-xl transition cursor-pointer"
                      title="تبديل الصلاحية بين مدير وكاشير"
                    >
                      {user.role === 'admin' ? 'تحويل لكاشير' : 'ترقية لأدمن'}
                    </button>
                  </div>

                  {/* Delete Button (Protected for sole admin) */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`هل أنت متأكد من حذف حساب "${user.name}" من النظام؟`)) {
                        await deleteUser(user.id);
                        setUserActionMessage({
                          type: 'success',
                          text: `تم حذف المستخدم ${user.name} بنجاح`
                        });
                        setTimeout(() => setUserActionMessage(null), 3000);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="حذف المستخدم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ================= MODAL 1: EDIT USER DETAILS & AVATAR ================= */}
          {editingUserId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
              <div className="w-full max-w-lg bg-white rounded-3xl border border-[#ded5c6] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-[#231f1e] text-white">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-300" />
                    <h3 className="font-extrabold text-sm">تعديل بيانات المستخدم والصورة الشخصية</h3>
                  </div>
                  <button
                    onClick={() => setEditingUserId(null)}
                    className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editUserForm.name.trim()) return;

                    await updateUser(editingUserId, {
                      name: editUserForm.name.trim(),
                      avatar: editUserForm.avatar.trim(),
                      role: editUserForm.role,
                      phone: editUserForm.phone.trim(),
                      pin: editUserForm.pin.trim(),
                      email: editUserForm.email.trim(),
                    });

                    setUserActionMessage({
                      type: 'success',
                      text: `تم حفظ تعديلات المستخدم ${editUserForm.name} بنجاح في قاعدة البيانات`,
                    });
                    setTimeout(() => setUserActionMessage(null), 3500);
                    setEditingUserId(null);
                  }}
                  className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                >
                  {/* Avatar Upload and Preview */}
                  <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] space-y-3">
                    <label className="block text-xs font-bold text-[#45362c]">
                      الصورة الشخصية (Avatar)
                    </label>

                    <div className="flex items-center gap-4">
                      <img
                        src={editUserForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt="Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#c5b7a7] shadow-sm shrink-0"
                      />

                      <div className="space-y-2 flex-1">
                        {/* Direct File Upload to Supabase Storage */}
                        <div>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-amber-300" />
                            <span>{isUploadingUserAvatar ? 'جارٍ رفع الصورة إلى Supabase...' : 'رفع صورة من جهازك'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingUserAvatar}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingUserAvatar(true);
                                const result = await uploadImageToSupabase(file, 'avatars');
                                setIsUploadingUserAvatar(false);
                                if (result.url) {
                                  setEditUserForm((prev) => ({ ...prev, avatar: result.url! }));
                                } else {
                                  alert(result.error || 'فشل في رفع الصورة');
                                }
                              }}
                            />
                          </label>
                          <span className="text-[10px] text-[#8c7b6d] block mt-1">يتم رفعها مباشرة لسيرفر التخزين السحابي</span>
                        </div>

                        {/* Image URL text input */}
                        <input
                          type="text"
                          value={editUserForm.avatar}
                          onChange={(e) => setEditUserForm({ ...editUserForm, avatar: e.target.value })}
                          placeholder="أو الصق رابط صورة مباشر هنا (URL)"
                          className="w-full bg-white border border-[#ded3c3] rounded-xl px-2.5 py-1.5 text-xs text-[#231f1e] dir-ltr text-right"
                        />
                      </div>
                    </div>

                    {/* Quick Avatar Presets */}
                    <div>
                      <span className="text-[11px] text-[#7d6c60] font-semibold block mb-1.5">أو اختر من النماذج الجاهزة:</span>
                      <div className="grid grid-cols-6 gap-2">
                        {[
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&auto=format&fit=crop&q=80',
                        ].map((presetUrl, idx) => (
                          <img
                            key={idx}
                            src={presetUrl}
                            alt="Preset"
                            onClick={() => setEditUserForm({ ...editUserForm, avatar: presetUrl })}
                            className={`w-10 h-10 rounded-xl object-cover border-2 cursor-pointer transition hover:scale-105 ${
                              editUserForm.avatar === presetUrl ? 'border-amber-600 ring-2 ring-amber-400' : 'border-[#ded3c3]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#45362c]">الاسم بالكامل</label>
                    <input
                      type="text"
                      required
                      value={editUserForm.name}
                      onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                      placeholder="اسم المستخدم أو المدير"
                      className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-1 focus:ring-[#8c6239]"
                    />
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#45362c]">نوع الصلاحية</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditUserForm({ ...editUserForm, role: 'cashier' })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          editUserForm.role === 'cashier'
                            ? 'bg-[#231f1e] text-white border-[#231f1e]'
                            : 'bg-[#faf6f0] text-[#5e4f44] border-[#d6c9b8] hover:bg-[#ede5d8]'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>كاشير (نقطة بيع)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditUserForm({ ...editUserForm, role: 'admin' })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          editUserForm.role === 'admin'
                            ? 'bg-[#231f1e] text-white border-[#231f1e]'
                            : 'bg-[#faf6f0] text-[#5e4f44] border-[#d6c9b8] hover:bg-[#ede5d8]'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>مدير عام (Admin)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#45362c]">رقم الهاتف</label>
                      <input
                        type="text"
                        value={editUserForm.phone}
                        onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                        placeholder="+20 100..."
                        className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs font-semibold text-[#231f1e] dir-ltr text-right"
                      />
                    </div>

                    {/* PIN */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#45362c]">رمز PIN السريع</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={editUserForm.pin}
                        onChange={(e) => setEditUserForm({ ...editUserForm, pin: e.target.value })}
                        placeholder="1234"
                        className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs font-mono font-bold text-center text-[#231f1e]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f0e7db]">
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="px-4 py-2 border border-[#d6c9b8] text-[#5e4f44] hover:bg-[#faf6f0] rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4 text-amber-300" />
                      <span>حفظ التعديلات</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= MODAL 2: ADD NEW USER / STAFF ================= */}
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
              <div className="w-full max-w-lg bg-white rounded-3xl border border-[#ded5c6] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-[#231f1e] text-white">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-extrabold text-sm">إضافة مستخدم أو كاشير جديد إلى النظام</h3>
                  </div>
                  <button
                    onClick={() => setIsAddUserOpen(false)}
                    className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password) {
                      alert('يرجى ملء جميع الحقول الإلزامية');
                      return;
                    }

                    setIsAddingUser(true);
                    try {
                      await addUser({
                        name: newUserForm.name.trim(),
                        email: newUserForm.email.trim().toLowerCase(),
                        password: newUserForm.password,
                        role: newUserForm.role,
                        phone: newUserForm.phone.trim(),
                        pin: newUserForm.pin.trim() || '1234',
                        avatar: newUserForm.avatar || (newUserForm.role === 'admin'
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
                        permissions: newUserForm.role === 'admin'
                          ? ['all', 'pos', 'tables', 'orders', 'playstation', 'shifts', 'inventory', 'audit', 'purchases', 'expenses', 'dashboard', 'day_report', 'qa_tests']
                          : ['pos', 'tables', 'orders', 'playstation', 'shifts'],
                      });

                      setIsAddingUser(false);
                      setIsAddUserOpen(false);
                      setUserActionMessage({
                        type: 'success',
                        text: `تم إنشاء حساب ${newUserForm.name} بنجاح وحفظه في قاعدة البيانات`,
                      });
                      setTimeout(() => setUserActionMessage(null), 3500);
                    } catch (err: any) {
                      setIsAddingUser(false);
                      alert(err?.message || 'فشل في إضافة المستخدم');
                    }
                  }}
                  className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                >
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#45362c]">الاسم بالكامل *</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder="مثال: يوسف محمود"
                      className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs font-semibold text-[#231f1e]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#45362c]">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="youssef@example.com"
                      className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs font-semibold text-[#231f1e] dir-ltr text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#45362c]">كلمة المرور *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs font-semibold text-[#231f1e] text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#45362c]">نوع الصلاحية</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewUserForm({ ...newUserForm, role: 'cashier' })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          newUserForm.role === 'cashier'
                            ? 'bg-[#231f1e] text-white border-[#231f1e]'
                            : 'bg-[#faf6f0] text-[#5e4f44] border-[#d6c9b8]'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>كاشير (نقطة بيع)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserForm({ ...newUserForm, role: 'admin' })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          newUserForm.role === 'admin'
                            ? 'bg-[#231f1e] text-white border-[#231f1e]'
                            : 'bg-[#faf6f0] text-[#5e4f44] border-[#d6c9b8]'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>مدير عام (Admin)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#45362c]">رقم الهاتف</label>
                      <input
                        type="text"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                        placeholder="010..."
                        className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs font-semibold text-[#231f1e] dir-ltr text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#45362c]">رمز PIN السريع للوردية</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newUserForm.pin}
                        onChange={(e) => setNewUserForm({ ...newUserForm, pin: e.target.value })}
                        placeholder="مثال: 1234"
                        className="w-full bg-[#faf6f0] border border-[#d6c9b8] rounded-xl px-3 py-2 text-xs font-mono font-bold text-center text-[#231f1e]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f0e7db]">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 border border-[#d6c9b8] text-[#5e4f44] hover:bg-[#faf6f0] rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingUser}
                      className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 disabled:bg-gray-400"
                    >
                      {isAddingUser ? (
                        <span>جارٍ الحفظ...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>إضافة المستخدم للسيستم</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 7: BACKUP & FACTORY RESET ================= */}
      {activeTab === 'backup' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-[#ded3c3] shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#231f1e]">النسخ الاحتياطي واستعادة البيانات (Backup & Reset)</h2>
              <p className="text-xs text-[#7d6c60] mt-0.5">
                تنزيل نسخة كاملة من إعدادات الكافيه والمنيو والترابيزات والبلايستيشن بصيغة JSON، أو استعادتها بضغطة زر
              </p>
            </div>

            {/* Export Card */}
            <div className="p-5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-[#231f1e] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#8c6239]" />
                  <span>تصدير نسخة احتياطية كاملة (JSON Export)</span>
                </h3>
                <p className="text-xs text-[#7d6c60] mt-1">
                  حفظ كافة التعديلات، المنتجات، الأسعار، والإعدادات على جهازك كملف آمن يمكنك استعادته في أي وقت.
                </p>
              </div>

              <button
                onClick={handleExport}
                className="px-5 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs shrink-0 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>تحميل ملف النسخة الاحتياطية</span>
              </button>
            </div>

            {/* Import Card */}
            <div className="p-5 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] space-y-3">
              <h3 className="text-sm font-black text-[#231f1e] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#8c6239]" />
                <span>استعادة نسخة سابقة (JSON Import)</span>
              </h3>
              <p className="text-xs text-[#7d6c60]">
                قم بلصق محتوى ملف الـ JSON الذي تم تحميله سابقاً هنا لاستعادة كل المنتجات والأسعار والإعدادات فورياً:
              </p>

              <textarea
                rows={3}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='الصق نص ملف JSON هنا (e.g. {"cafeSettings": ...})'
                className="w-full bg-white border border-[#ded3c3] rounded-xl p-3 text-xs font-mono text-[#231f1e] dir-ltr text-left"
              />

              {importError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم استعادة كافة بيانات الكافيه بنجاح تام!</span>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!importJsonText.trim()}
                className="px-5 py-2 bg-[#8c6239] hover:bg-[#724e2b] disabled:bg-[#c2b4a3] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                استيراد البيانات الآن
              </button>
            </div>

            {/* Factory Reset */}
            <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-rose-900">إعادة ضبط المصنع (Factory Reset)</h3>
                <p className="text-xs text-rose-700 mt-1">
                  إعادة تعيين كافة المنتجات والأسعار والشعار إلى الحالة الافتراضية الأولى ومسح التعديلات المؤقتة.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm('تحذير: هل أنت متأكد من إعادة ضبط المصنع؟ سيتم مسح التعديلات المحلية واسترجاع البيانات الأصلية.')) {
                    resetToInitialData();
                    alert('تمت استعادة البيانات الافتراضية بنجاح.');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs shrink-0"
              >
                إعادة ضبط المصنع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
