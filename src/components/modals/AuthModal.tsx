import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  Shield, User, Lock, Mail, Eye, EyeOff, 
  X, CheckCircle2, AlertCircle, LogOut, KeyRound, UserCheck,
  UserPlus, Sparkles
} from 'lucide-react';
import { GoogleSignInButton } from '../GoogleSignInButton';

export const AuthModal: React.FC = () => {
  const { 
    isLoginModalOpen, setIsLoginModalOpen, currentUser, 
    login, loginWithGoogle, logout, switchUser, usersList, cafeSettings
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'switch' | 'login' | 'google'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  // Handle Real Google Login (verified ID Token) + MongoDB Atlas upsert
  const handleGoogleAuth = async (credential: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginWithGoogle({ credential });

      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setSuccessMsg(null);
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'فشل في التحقق من حساب Google مع MongoDB');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await login(emailInput, passwordInput);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setEmailInput('');
          setPasswordInput('');
          setSuccessMsg(null);
        }, 800);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ded5c6] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#231f1e] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#d6c7b2] bg-[#2a2422] flex items-center justify-center font-serif font-black text-xs overflow-hidden">
              {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
                <img src={cafeSettings.logoImage} alt={cafeSettings.cafeName} className="w-full h-full object-cover" />
              ) : (
                <span>{cafeSettings.logoText || 'HB'}</span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">المصادقة وتوثيق الحساب</h3>
              <p className="text-[10px] text-[#c2b4a3] font-mono">MongoDB & Google Auth</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Logged-in User Card */}
        <div className="p-3.5 bg-[#f8f3ec] border-b border-[#e9dfd1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-10 h-10 rounded-2xl border border-[#c8bcad] object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#231f1e]">{currentUser.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  currentUser.role === 'admin' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  {currentUser.role === 'admin' ? 'المدير العام' : 'كاشير'}
                </span>
              </div>
              <span className="text-[10px] text-[#78695d] font-mono block dir-ltr text-right mt-0.5">
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setIsLoginModalOpen(false);
            }}
            className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>

        {/* 3 Main Tabs: حساب Google / تسجيل دخول عادي / تبديل الوردية */}
        <div className="grid grid-cols-3 p-1 bg-[#f0e7db] border-b border-[#e5dcd0] text-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setErrorMsg(null);
            }}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'google' ? 'bg-[#231f1e] text-white shadow-xs' : 'text-[#6e5f54] hover:bg-[#e4d7c6]'
            }`}
          >
            <span>حساب Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'login' ? 'bg-[#231f1e] text-white shadow-xs' : 'text-[#6e5f54] hover:bg-[#e4d7c6]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>بريد / PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('switch');
              setErrorMsg(null);
            }}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'switch' ? 'bg-[#231f1e] text-white shadow-xs' : 'text-[#6e5f54] hover:bg-[#e4d7c6]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>الورديات</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= TAB 1: GOOGLE AUTH WITH BACKEND TOKEN VERIFICATION ================= */}
          {activeTab === 'google' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  يتم توثيق التوكن عبر الـ Backend وحفظ وتحديث المستخدم تلقائياً في قاعدة بيانات MongoDB Atlas.
                </span>
              </div>

              {/* Real Google Sign-In (Google Identity Services) with backend token verification */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>تسجيل الدخول بحساب Google:</span>
                </div>

                <GoogleSignInButton
                  onCredential={handleGoogleAuth}
                  onError={(msg) => setErrorMsg(msg)}
                />

                {loading && (
                  <p className="text-center text-[11px] text-[#8c7b6d] font-bold">
                    جارٍ التحقق من حساب Google وحفظه في MongoDB...
                  </p>
                )}
              </div>

              {/* MongoDB Cluster Domain Info */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-700 space-y-1 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>سيرفر MongoDB Atlas:</span>
                  </span>
                  <span className="font-mono text-emerald-800 dir-ltr font-bold text-[10px]">cluster0.w7l7m9v.mongodb.net</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span>قاعدة البيانات:</span>
                  <span className="font-mono text-stone-800">hub_cafe_db / hub_users</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: EMAIL / PIN LOGIN ================= */}
          {activeTab === 'login' && (
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
                    placeholder="أدخل البريد الإلكتروني أو اسم المستخدم"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#231f1e] hover:bg-[#3d3633] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-gray-400 mt-2"
              >
                {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {/* ================= TAB 3: SHIFT SWITCHING ================= */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-[#6a5b4f]">
                التبديل السريع بين موظفي الوردية:
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
          )}
        </div>
      </div>
    </div>
  );
};
