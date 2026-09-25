import React from 'react';
import { useCafe } from '../context/CafeContext';
import { 
  Shield, User, Clock, RotateCcw, Bell,
  Sparkles, Menu, X, LogOut, KeyRound, ChevronDown, Sliders
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, switchUser, currentShift, setActiveView, activeView,
    resetToInitialData, mobileMenuOpen, setMobileMenuOpen,
    setIsLoginModalOpen, logout, cafeSettings,
    unreadNotificationsCount, setIsNotificationPanelOpen, isNotificationPanelOpen
  } = useCafe();

  return (
    <header className="bg-[#faf6f0] border-b border-[#e6ded1] px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="القائمة الرئيسية"
          className="lg:hidden p-2 rounded-xl text-[#231f1e] hover:bg-[#ede5d8] active:bg-[#ded2c3] transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-[#231f1e]" /> : <Menu className="w-5 h-5 text-[#231f1e]" />}
        </button>

        {/* Dynamic Cafe Circular Badge & Name */}
        <div 
          onClick={() => setActiveView('pos')} 
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#c8bcad] bg-white flex items-center justify-center shadow-xs text-[#2d2522] shrink-0 overflow-hidden">
            {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
              <img src={cafeSettings.logoImage} alt={cafeSettings.cafeName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif font-black tracking-tight text-[10px] sm:text-xs border border-[#2d2522] rounded-full px-1 py-0.5 sm:px-1.5">
                {cafeSettings.logoText || 'HB'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold tracking-wider text-xs sm:text-base text-[#231f1e] uppercase">
                {cafeSettings.cafeName}
              </span>
              <span className="text-[9px] sm:text-[10px] bg-[#231f1e] text-white px-1 sm:px-1.5 py-0.5 rounded font-mono font-medium">POS</span>
            </div>
            <p className="hidden sm:block text-[10px] text-[#8c7b6d] tracking-widest font-sans font-medium truncate max-w-[200px]">
              {cafeSettings.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Center Shift & Live Cash pill (Desktop & Large Tablet) */}
      <div className="hidden lg:flex items-center gap-3">
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveView('admin_hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeView === 'admin_hub' || activeView === 'admin_products'
                ? 'bg-[#231f1e] text-white shadow-xs'
                : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>لوحة تحكم الإدارة (CMS)</span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-[#ede4d7] px-3 py-1.5 rounded-full text-xs font-medium text-[#4a3b32]">
          <Clock className="w-3.5 h-3.5 text-[#8c6239]" />
          <span>الوردية: <strong className="text-[#231f1e]">{currentUser.name}</strong></span>
          <span className="mx-1 text-[#c2b4a3]">|</span>
          <span>درج الكاش: <strong className="text-[#231f1e]">{currentShift.expectedDrawerCash.toLocaleString()} {cafeSettings.currency}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#716155] bg-white border border-[#e6ded1] px-2.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>سيرفر نشط</span>
        </div>
      </div>

      {/* Left/Right Controls: User Profile, Role Switcher, QA Tests, Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* QA Automated Test button */}
        <button
          onClick={() => setActiveView('qa_tests')}
          className="flex items-center gap-1 sm:gap-1.5 bg-[#f0e7dc] hover:bg-[#e4d7c6] text-[#423226] text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg border border-[#d8c8b4] transition cursor-pointer"
          title="تشغيل اختبارات النظام الآلية"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden md:inline">فحص (QA)</span>
          <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] px-1 rounded-full font-mono">100%</span>
        </button>

        {/* Notifications Bell Trigger */}
        <button
          type="button"
          onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
          className={`relative p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
            unreadNotificationsCount > 0
              ? 'bg-amber-50 border-amber-300 text-[#231f1e] hover:bg-amber-100 shadow-2xs'
              : 'bg-white border-[#d8c8b4] text-[#6d5d51] hover:text-[#231f1e] hover:bg-[#f6eee4]'
          }`}
          title="التنبيهات والإشعارات الفورية"
        >
          <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white animate-pulse">
              {unreadNotificationsCount > 9 ? '+9' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Current User Badge & Account Switch Trigger */}
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-[#f6eee4] border border-[#d8c8b4] py-1 px-2 sm:px-2.5 rounded-xl transition cursor-pointer text-right shadow-2xs"
          title="إدارة الحساب والمصادقة"
        >
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[#c5b7a7]"
          />
          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-[#231f1e] leading-tight max-w-[110px] truncate">{currentUser.name}</span>
              {currentUser.role === 'admin' ? (
                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1 rounded">أدمن</span>
              ) : (
                <span className="text-[9px] bg-blue-100 text-blue-900 border border-blue-300 font-bold px-1 rounded">كاشير</span>
              )}
            </div>
            <p className="text-[9px] text-[#7d6c60] font-mono leading-tight dir-ltr text-right max-w-[130px] truncate">
              {currentUser.email}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8c7b6d] hidden sm:block" />
        </button>

        {/* User Role Quick Switcher */}
        <div className="flex items-center bg-white border border-[#d8c8b4] rounded-lg p-0.5 shadow-2xs">
          <button
            onClick={() => switchUser('admin')}
            title="التبديل إلى حساب المدير العام"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-[11px] sm:text-xs font-semibold transition cursor-pointer ${
              currentUser.role === 'admin'
                ? 'bg-[#231f1e] text-white shadow-xs'
                : 'text-[#6d5d51] hover:text-[#231f1e]'
            }`}
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">المدير</span>
          </button>
          <button
            onClick={() => switchUser('cashier')}
            title="التبديل إلى حساب الكاشير"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-[11px] sm:text-xs font-semibold transition cursor-pointer ${
              currentUser.role === 'cashier'
                ? 'bg-[#231f1e] text-white shadow-xs'
                : 'text-[#6d5d51] hover:text-[#231f1e]'
            }`}
          >
            <User className="w-3 h-3 text-emerald-400" />
            <span className="hidden xs:inline">الكاشير</span>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-1.5 text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer"
          title="تسجيل الخروج والعودة لشاشة الدخول"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={() => {
            if (confirm('هل تريد استعادة البيانات الأولية لكافيه HUB CAFE؟')) {
              resetToInitialData();
            }
          }}
          className="p-1.5 text-[#8c7b6d] hover:text-[#231f1e] hover:bg-[#eae0d2] rounded-lg transition cursor-pointer"
          title="استعادة البيانات الأولية"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
