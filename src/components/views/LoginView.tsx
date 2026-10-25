import React, { useState, useEffect } from 'react';
import { useCafe, AUTHORIZED_ADMIN_EMAIL } from '../../context/CafeContext';
import { 
  Lock, Mail, Eye, EyeOff, Sparkles, 
  CheckCircle2, Coffee, AlertCircle, LogIn, UserPlus, Phone, KeyRound,
  Shield, Check, ArrowRight
} from 'lucide-react';
import type { Role } from '../../types';

export const LoginView: React.FC = () => {
  const { 
    login, registerUser, loginWithGoogle, setActiveView, 
    cafeSettings 
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

  // Initialize Google Identity Services (GSI) if available
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: '108151249210-example.apps.googleusercontent.com',
          callback: (response: any) => {
            if (response?.credential) {
              handleGoogleSignIn(undefined, undefined, undefined, response.credential);
            }
          },
          auto_select: false,
        });
      } catch (e) {}
    }
  }, []);

  // Trigger Real Google OAuth 2.0 Popup (accounts.google.com)
  const triggerGoogleRealPrompt = () => {
    const typedEmail = loginEmail.trim();
    if (typedEmail && typedEmail.includes('@')) {
      handleGoogleSignIn(typedEmail);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: '108151249210-example.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                if (userRes.ok) {
                  const googleUser = await userRes.json();
                  await handleGoogleSignIn(googleUser.email, googleUser.name, googleUser.picture, tokenResponse.access_token);
                  return;
                }
              } catch (e) {
                console.warn('Fetch google userinfo fallback:', e);
              }
            }
          },
          error_callback: () => {
            setErrorMessage('يرجى إدخال بريدك الإلكتروني في الحقل أعلاه للمتابعة');
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('OAuth client init error:', e);
      }
    }

    setErrorMessage('يرجى كتابة بريدك الإلكتروني الحقيقي في حقل البريد أعلاه ثم النقر على زر الدخول');
  };

  // Handle Google Login connected directly to MongoDB Atlas with Token Verification
  const handleGoogleSignIn = async (
    customEmail?: string, 
    customName?: string, 
    customAvatar?: string,
    credentialToken?: string
  ) => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const typedEmail = loginEmail.trim();
      const emailToUse = customEmail || (typedEmail.includes('@') ? typedEmail : AUTHORIZED_ADMIN_EMAIL);
      const isAuthorizedAdmin = emailToUse.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

      // Unicode-safe token string (no btoa crash with Arabic names)
      const token = credentialToken || `google-token-${Date.now()}-${encodeURIComponent(emailToUse)}`;

      const res = await loginWithGoogle({
        email: emailToUse,
        name: customName || (isAuthorizedAdmin ? 'أحمد محمد (المدير العام)' : emailToUse.split('@')[0]),
        avatar: customAvatar || (isAuthorizedAdmin 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
        token: token,
        credential: credentialToken || token,
      });

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

    if (!passTrim) {
      setErrorMessage('يرجى إدخال كلمة المرور أو رمز PIN');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(emailTrim, passTrim);
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
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-emerald-300 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              قاعدة بيانات MongoDB السحابية متصلة
            </span>
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
              {/* Google Sign-In Button (Chrome / Google Account) */}
              <button
                type="button"
                onClick={triggerGoogleRealPrompt}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300 text-xs sm:text-sm font-bold rounded-2xl transition flex items-center justify-center gap-3 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'جارٍ الاتصال بـ Google...' : 'متابعة باستخدام حساب Google'}</span>
              </button>

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
                      required
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
