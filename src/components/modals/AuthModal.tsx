import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  Shield, User, Lock, Mail, Eye, EyeOff, 
  X, CheckCircle2, AlertCircle, LogOut, KeyRound, UserCheck
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isLoginModalOpen, setIsLoginModalOpen, currentUser, 
    login, logout, switchUser, usersList, cafeSettings
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'switch' | 'login'>('switch');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(emailInput, passwordInput);
      setLoading(false);
      if (res.success) {
        setIsLoginModalOpen(false);
        setEmailInput('');
        setPasswordInput('');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'تعذر تسجيل الدخول، يرجى المحاولة لاحقاً');
    }
  };

  const handleQuickSwitch = (role: 'admin' | 'cashier') => {
    switchUser(role);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ded5c6] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#231f1e] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full border border-[#d6c7b2] bg-[#2a2422] flex items-center justify-center font-serif font-black text-xs overflow-hidden">
              {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
                <img src={cafeSettings.logoImage} alt={cafeSettings.cafeName} className="w-full h-full object-cover" />
              ) : (
                <span>{cafeSettings.logoText || 'HB'}</span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">إدارة الحسابات والمصادقة</h3>
              <p className="text-[10px] text-[#c2b4a3] font-mono">{cafeSettings.cafeName} Access Control</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Logged-in User Profile */}
        <div className="p-4 bg-[#f8f3ec] border-b border-[#e9dfd1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-2xl border border-[#c8bcad] object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#231f1e]">{currentUser.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  currentUser.role === 'admin' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  {currentUser.role === 'admin' ? 'مدير عام' : 'كاشير'}
                </span>
              </div>
              <span className="text-[11px] text-[#78695d] font-mono block dir-ltr text-right mt-0.5">
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setIsLoginModalOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>

        {/* Tabs: تبديل الحساب / تسجيل دخول جديد */}
        <div className="grid grid-cols-2 p-1.5 bg-[#f0e7db] border-b border-[#e5dcd0]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('switch');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'switch' ? 'bg-[#231f1e] text-white shadow-xs' : 'text-[#6e5f54] hover:bg-[#e4d7c6]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>تبديل الوردية</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login' ? 'bg-[#231f1e] text-white shadow-xs' : 'text-[#6e5f54] hover:bg-[#e4d7c6]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>تسجيل دخول حساب آخر</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs text-[#6a5b4f]">
                اختر الحساب المطلوب للتبديل السريع دون إعادة كتابة البيانات:
              </p>

              <div className="space-y-2">
                {usersList.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSwitch(user.role)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer text-right ${
                      currentUser.id === user.id
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-[#faf6f0] border-[#ded3c3] hover:bg-[#ede5d8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-[#c5b7a7]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#231f1e]">{user.name}</div>
                        <div className="text-[11px] text-[#7d6c60] font-mono">{user.email}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.role === 'admin'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}>
                      {user.role === 'admin' ? 'مدير' : 'كاشير'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">البريد الإلكتروني أو اسم المستخدم</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-2.5 text-[#8c7b6d]" />
                  <input
                    type="text"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                    className="w-full pl-3 pr-9 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-semibold text-[#231f1e] focus:outline-none focus:ring-1 focus:ring-[#8c6239] text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">كلمة المرور أو PIN</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-2.5 text-[#8c7b6d]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-semibold text-[#231f1e] focus:outline-none focus:ring-1 focus:ring-[#8c6239] text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2 text-[#8c7b6d] hover:text-[#231f1e] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#231f1e] hover:bg-[#3d3633] text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>جارٍ التحقق...</span>
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
