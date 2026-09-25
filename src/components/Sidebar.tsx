import React from 'react';
import { useCafe } from '../context/CafeContext';
import {
  CreditCard, LayoutGrid, ShoppingBag, Gamepad2, Clock,
  Package, ClipboardCheck, Truck, Receipt, LayoutDashboard,
  FileText, CheckCircle2, X, MoreHorizontal, Sparkles, Lock,
  Shield, User, LogOut, KeyRound, Sliders, Coffee
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  badgeColor?: string;
  highlight?: boolean;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    activeView, setActiveView, playstations, inventory, 
    mobileMenuOpen, setMobileMenuOpen, currentUser, currentShift,
    setIsLoginModalOpen, logout, cafeSettings
  } = useCafe();

  // Active PS count (matching image 5: 3 / 8 شغال)
  const activePSCount = playstations.filter((p) => p.status === 'active').length;
  // Alert inventory items
  const alertInventoryCount = inventory.filter((i) => i.status === 'alert' || i.status === 'depleted').length;

  const navSections: NavSection[] = [
    {
      title: 'الإدارة والتحكم (Admin CMS)',
      items: [
        { id: 'admin_hub', label: 'لوحة تحكم الإدارة الشاملة', icon: Sliders, highlight: true, adminOnly: true },
        { id: 'admin_products', label: 'المنيو والأسعار والصور', icon: Coffee, adminOnly: true },
      ],
    },
    {
      title: 'التشغيل',
      items: [
        { id: 'pos', label: 'نقطة البيع', icon: CreditCard },
        { id: 'tables', label: 'الترابيزات', icon: LayoutGrid },
        { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
        { 
          id: 'playstation', 
          label: 'البلايستيشن', 
          icon: Gamepad2, 
          badge: `${activePSCount}/8` 
        },
        { id: 'shifts', label: 'الوردية', icon: Clock },
      ],
    },
    {
      title: 'المخزن',
      items: [
        { 
          id: 'inventory', 
          label: 'المخزون', 
          icon: Package, 
          badge: alertInventoryCount > 0 ? alertInventoryCount : undefined,
          badgeColor: 'bg-amber-600'
        },
        { id: 'audit', label: 'الجرد والتسوية', icon: ClipboardCheck, adminOnly: true },
        { id: 'purchases', label: 'المشتريات', icon: Truck },
        { id: 'expenses', label: 'المصروفات', icon: Receipt, adminOnly: true },
      ],
    },
    {
      title: 'الأعمال والتقارير',
      items: [
        { id: 'dashboard', label: 'الرئيسية (الأرباح)', icon: LayoutDashboard, adminOnly: true },
        { id: 'day_report', label: 'تقرير اليوم المالي', icon: FileText, adminOnly: true },
      ],
    },
    {
      title: 'الجودة والـ QA',
      items: [
        { id: 'qa_tests', label: 'اختبارات النظام', icon: CheckCircle2, highlight: true },
      ],
    },
  ];

  const handleSelectNav = (item: NavItem) => {
    if (item.adminOnly && currentUser.role !== 'admin') {
      if (confirm(`قسم "${item.label}" يتطلب صلاحيات الأدمن. هل تريد تسجيل الدخول كمدير عام الآن؟`)) {
        setIsLoginModalOpen(true);
      }
      return;
    }
    setActiveView(item.id);
    setMobileMenuOpen(false);
  };

  const renderNavContent = () => (
    <>
      <div className="space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="text-[11px] font-bold text-[#8c7b6d] px-2 tracking-wide uppercase">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isLocked = item.adminOnly && currentUser.role !== 'admin';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#231f1e] text-white shadow-sm'
                        : item.highlight
                        ? 'bg-amber-100/70 text-amber-900 hover:bg-amber-100'
                        : isLocked
                        ? 'text-[#9c8e82] hover:bg-[#ede5d8]/50'
                        : 'text-[#5e4f44] hover:bg-[#ede5d8] hover:text-[#231f1e]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : isLocked ? 'text-[#b3a497]' : 'text-[#8c7b6d]'}`} />
                      <span className={isLocked ? 'opacity-80' : ''}>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLocked && (
                        <Lock className="w-3 h-3 text-[#a8998c]" />
                      )}

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor
                              ? `${item.badgeColor} text-white`
                              : 'bg-[#e2d5c3] text-[#4a3b32]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Session Footer Card */}
      <div className="pt-3 border-t border-[#e2d7c7] space-y-2">
        <div 
          onClick={() => setIsLoginModalOpen(true)}
          className="p-2.5 rounded-xl bg-white border border-[#ded3c3] hover:border-[#b8a693] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#d2c5b4] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#231f1e] truncate">{currentUser.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  currentUser.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                }`}>
                  {currentUser.role === 'admin' ? 'المدير' : 'كاشير'}
                </span>
              </div>
              <p className="text-[10px] text-[#857467] font-mono truncate dir-ltr text-right">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8f8073] px-1">
          <span className="font-bold truncate max-w-[120px]">{cafeSettings.cafeName} v2.5</span>
          <button
            onClick={logout}
            className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (lg:flex) */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-[#f7f2e9] border-s border-[#e4dcce] min-h-[calc(100vh-57px)] flex-col justify-between p-3 select-none">
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel (slides from Right in RTL) */}
          <div className="relative mr-auto w-72 max-w-[85vw] h-full bg-[#f7f2e9] shadow-2xl z-50 flex flex-col justify-between p-4 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e2d7c7]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-[#231f1e] bg-white flex items-center justify-center font-serif font-black text-[10px] overflow-hidden">
                    {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
                      <img src={cafeSettings.logoImage} alt="شعار" className="w-full h-full object-cover" />
                    ) : (
                      <span>{cafeSettings.logoText || 'HB'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-[#231f1e]">{cafeSettings.cafeName}</span>
                    <p className="text-[10px] text-[#8c7b6d]">{currentUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#6e5f54] hover:bg-[#ede4d7]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Cash Indicator */}
              <div className="mb-4 p-2.5 rounded-xl bg-white border border-[#ded3c3] text-xs flex justify-between items-center">
                <span className="text-[#8c7b6d]">درج الكاش:</span>
                <span className="font-mono font-bold text-[#231f1e]">{currentShift.expectedDrawerCash.toLocaleString()} {cafeSettings.currency}</span>
              </div>

              {/* Nav Items */}
              {renderNavContent()}
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile/Tablet Bottom Navigation Bar (lg:hidden) */}
      <nav 
        aria-label="شريط التنقل السريع للهواتف" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2d7c7] px-2 py-1.5 shadow-lg flex items-center justify-around select-none"
      >
        {/* POS */}
        <button
          onClick={() => setActiveView('pos')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeView === 'pos' ? 'text-[#231f1e] font-black' : 'text-[#8c7b6d] hover:text-[#231f1e]'
          }`}
        >
          <CreditCard className={`w-5 h-5 ${activeView === 'pos' ? 'text-[#8c6239] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">نقطة البيع</span>
        </button>

        {/* PlayStation */}
        <button
          onClick={() => setActiveView('playstation')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeView === 'playstation' ? 'text-[#231f1e] font-black' : 'text-[#8c7b6d] hover:text-[#231f1e]'
          }`}
        >
          <Gamepad2 className={`w-5 h-5 ${activeView === 'playstation' ? 'text-[#8c6239] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">بلايستيشن</span>
          {activePSCount > 0 && (
            <span className="absolute top-0 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
              {activePSCount}
            </span>
          )}
        </button>

        {/* Tables */}
        <button
          onClick={() => setActiveView('tables')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeView === 'tables' ? 'text-[#231f1e] font-black' : 'text-[#8c7b6d] hover:text-[#231f1e]'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 ${activeView === 'tables' ? 'text-[#8c6239] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">الترابيزات</span>
        </button>

        {/* Inventory */}
        <button
          onClick={() => setActiveView('inventory')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeView === 'inventory' ? 'text-[#231f1e] font-black' : 'text-[#8c7b6d] hover:text-[#231f1e]'
          }`}
        >
          <Package className={`w-5 h-5 ${activeView === 'inventory' ? 'text-[#8c6239] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">المخزون</span>
          {alertInventoryCount > 0 && (
            <span className="absolute top-0 right-1.5 w-4 h-4 bg-amber-600 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Dashboard */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeView === 'dashboard' ? 'text-[#231f1e] font-black' : 'text-[#8c7b6d] hover:text-[#231f1e]'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeView === 'dashboard' ? 'text-[#8c6239] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">الرئيسية</span>
        </button>

        {/* More (Opens Drawer) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#8c7b6d] hover:text-[#231f1e] transition cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">المزيد</span>
        </button>
      </nav>
    </>
  );
};
