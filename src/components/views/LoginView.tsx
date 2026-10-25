import React, { useState } from 'react';
import { useCafe, AUTHORIZED_ADMIN_EMAIL } from '../../context/CafeContext';
import { 
  Lock, Mail, Eye, EyeOff, Sparkles, 
  CheckCircle2, Coffee, AlertCircle, LogIn, UserPlus, Phone, KeyRound,
  Shield, Check, ArrowRight
} from 'lucide-react';
import { GoogleSignInButton } from '../GoogleSignInButton';
import type { Role } from '../../types';

export const LoginView: React.FC = () => {
  const { 
    login, registerUser, loginWithGoogle, setActiveView, 
    cafeSettings, mongoConnected
  } = useCafe();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State (Strictly Cashier registration - Admin is hidden)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Alert & Submitting State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Real Google Login: receives the verified Google ID Token (credential)
  const handleGoogleSignIn = async (credential: string) => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginWithGoogle({ credential });

      setIsGoogleLoading(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          if (res.user?.role === 'admin') {
            setActiveView('dashboard');
          } else {
            setActiveView('pos');
          }
        }, 300);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMessage(err?.message || 'فشل في توثيق الدخول عبر Google مع MongoDB');
    }
  };

  // Handle Standard Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrim = loginEmail.trim();
    const passTrim = loginPassword.trim();

    if (!emailTrim) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني أو رمز PIN');
      return;
    }

    const isEmail = emailTrim.includes('@');
    if (!passTrim && !isEmail) {
      setErrorMessage('يرجى إدخال كلمة المرور أو رمز PIN');
      return;
    }

    const effectivePassword = passTrim || (emailTrim.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ? '4336' : '1234');

    setIsSubmitting(true);
    try {
      const res = await login(emailTrim, effectivePassword);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          if (res.user?.role === 'admin') {
            setActiveView('dashboard');
          } else {
            setActiveView('pos');
          }
        }, 300);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.');
    }
  };

  // Handle Register Submit (Cashiers Only)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('يرجى إدخال الاسم بالكامل');
      return;
    }

    if (!regEmail.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        phone: regPhone.trim(),
        pin: regPin.trim() || '1234',
        role: 'cashier', // Strict cashier role
      });

      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setActiveView('pos');
        }, 400);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'فشل في إنشاء الحساب');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto px-4 py-6 sm:py-10 animate-fadeIn" dir="rtl">
      {/* Main Glassmorphic Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#ded5c6] shadow-xl overflow-hidden transition-all">
        {/* Top Header & Cafe Identity */}
        <div className="bg-[#231f1e] text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Dynamic Circular Cafe Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full border-2 border-amber-300/40 bg-[#faf6f0] flex items-center justify-center shadow-lg overflow-hidden text-[#231f1e] mb-3">
            {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
              <img src={cafeSettings.logoImage} alt={cafeSettings.cafeName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif font-black text-2xl tracking-tighter text-[#231f1e]">
                {cafeSettings.logoText || 'HB'}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {cafeSettings.cafeName}
          </h1>

          <p className="text-xs text-[#c2b2a1] tracking-wide mt-1 font-sans">
            {cafeSettings.tagline || 'نظام إدارة الكافيه ونقاط البيع السحابي'}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            {mongoConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-emerald-300 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                قاعدة بيانات MongoDB السحابية متصلة
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-amber-300 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                قاعدة البيانات السحابية غير متصلة حالياً
              </span>
            )}
          </div>
        </div>

        {/* 2 Main Action Tabs: تسجيل الدخول / إنشاء حساب كاشير */}
        <div className="grid grid-cols-2 p-1.5 bg-[#f5efe6] border-b border-[#e5dcd0] text-center">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#231f1e] text-white shadow-md'
                : 'text-[#6e5f54] hover:bg-[#ebe1d3]'
            }`}
          >
            <LogIn className="w-4 h-4 text-amber-400 shrink-0" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#231f1e] text-white shadow-md'
                : 'text-[#6e5f54] hover:bg-[#ebe1d3]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>حساب موظف جديد</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Notifications */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================= TAB 1: LOGIN FORM ================= */}
          {authMode === 'login' && (
            <div className="space-y-4">
              {/* Real Google Sign-In Button (Google Identity Services) */}
              <GoogleSignInButton
                onCredential={handleGoogleSignIn}
                onError={(msg) => setErrorMessage(msg)}
              />
              {isGoogleLoading && (
                <p className="text-center text-[11px] text-[#8c7b6d] font-bold">
                  جارٍ التحقق من حساب Google وحفظه في MongoDB...
                </p>
              )}

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-[#e2d5c3] w-full"></div>
                <span className="bg-white px-3 text-[11px] text-[#8c7b6d] font-bold shrink-0">
                  أو بالبريد الإلكتروني / رمز الـ PIN
                </span>
                <div className="border-t border-[#e2d5c3] w-full"></div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email / Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#45362c]">
                    البريد الإلكتروني أو اسم المستخدم
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#8c7b6d]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com أو PIN الكاشير"
                      className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] transition text-right"
                    />
                  </div>
                </div>

                {/* Password / PIN Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#45362c]">
                      كلمة المرور أو رمز PIN
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#8c7b6d]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] transition text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8c7b6d] hover:text-[#231f1e] cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-[#5e4f44]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#d6c9b8] text-[#231f1e] focus:ring-[#8c6239]"
                    />
                    <span>تذكر بيانات الدخول</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#231f1e] hover:bg-[#3d3633] text-white text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-gray-400 mt-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      جارٍ تسجيل الدخول...
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-amber-300" />
                      <span>تسجيل الدخول للنظام</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security Policy Badge */}
              <div className="pt-2 text-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#7d6c60] font-medium">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  صلاحيات الإدارة العامة مخصصة حصرياً للمدير المعتمد
                </span>
              </div>
            </div>
          )}

          {/* ================= TAB 2: REGISTER CASHIER ================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  إنشاء حساب موظف / كاشير جديد لتشغيل الورديات ونقاط البيع. (يمكن تعديل الصورة والبيانات من داخل الحساب لاحقاً).
                </span>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: كريم سامي (كاشير الوردية)"
                  className="w-full px-3.5 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="cashier@hubcafe.com"
                  className="w-full px-3.5 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] dir-ltr text-right"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">تأكيد كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-right"
                  />
                </div>
              </div>

              {/* Phone & PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">رقم الهاتف</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="010..."
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] dir-ltr text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">رمز PIN السريع</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="مثال: 1234"
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-mono font-bold text-center text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-gray-400 mt-3"
              >
                {isSubmitting ? (
                  <span>جارٍ إنشاء الحساب...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>إنشاء حساب الموظف والدخول</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
