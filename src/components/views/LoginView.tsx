import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  Shield, User as UserIcon, Lock, Mail, Eye, EyeOff, Sparkles, 
  CheckCircle2, Coffee, AlertCircle, LogIn, UserPlus, Phone, KeyRound,
  Camera, Upload, Edit3, Save, Check, RefreshCw
} from 'lucide-react';
import type { Role, User } from '../../types';
import { uploadImageToSupabase } from '../../services/supabaseService';

export const LoginView: React.FC = () => {
  const { 
    login, registerUser, setActiveView, supabaseConnected, 
    usersList, updateUser, currentUser, cafeSettings 
  } = useCafe();

  // Mode: 'login' | 'register' | 'edit_profile'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'edit_profile'>('login');

  // Login Form State (Clean - No exposed credentials)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State (With full Name & Avatar control)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('cashier');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isUploadingRegAvatar, setIsUploadingRegAvatar] = useState(false);

  // Direct Name & Photo Editing State on Login Screen
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User>(() => usersList[0] || currentUser);
  const [editName, setEditName] = useState(() => (usersList[0]?.name || currentUser.name || ''));
  const [editAvatar, setEditAvatar] = useState(() => (usersList[0]?.avatar || currentUser.avatar || ''));
  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Alert & Submitting State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample Avatar Presets for instant pick
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  ];

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني أو اسم المستخدم');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMessage('يرجى إدخال كلمة المرور أو رمز PIN');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
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
      setErrorMessage(err?.message || 'تعذر تسجيل الدخول، يرجى التحقق من اتصالك بالإنترنت.');
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('يرجى إدخال الاسم بالكامل');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صالح');
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
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        role: regRole,
        avatar: regAvatar,
        pin: regPin.trim() || undefined,
      });

      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          if (res.user?.role === 'admin') {
            setActiveView('dashboard');
          } else {
            setActiveView('pos');
          }
        }, 400);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى');
    }
  };

  // Handle Edit User on Login Page Submit
  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMessage('يرجى إدخال الاسم');
      return;
    }

    setIsSubmitting(true);
    setEditSuccessMsg(null);
    setErrorMessage(null);

    try {
      await updateUser(selectedUserToEdit.id, {
        name: editName.trim(),
        avatar: editAvatar.trim(),
      });

      setIsSubmitting(false);
      setEditSuccessMsg(`تم تحديث صورة واسم "${editName}" بنجاح في قاعدة البيانات!`);
      setTimeout(() => setEditSuccessMsg(null), 4000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'فشل في تحديث البيانات');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4" dir="rtl">
      <div className="bg-white rounded-3xl border border-[#ded5c6] shadow-2xl overflow-hidden transition-all">
        {/* Brand Header */}
        <div className="bg-[#231f1e] text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#c8bcad]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Dynamic Cafe Logo (Image or Initials Monogram) */}
          <div className="w-16 h-16 rounded-2xl border-2 border-[#d6c7b2] bg-[#2a2422] flex items-center justify-center mx-auto mb-2.5 shadow-md overflow-hidden">
            {cafeSettings.logoType === 'image' && cafeSettings.logoImage ? (
              <img 
                src={cafeSettings.logoImage} 
                alt={cafeSettings.cafeName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="font-serif font-black text-xl tracking-wider text-[#faf6f0]">
                {cafeSettings.logoText || 'HB'}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase">
              {cafeSettings.cafeName || 'HUB CAFE'}
            </h1>
            {cafeSettings.cafeNameAr && (
              <div className="text-xs font-bold text-amber-300">
                {cafeSettings.cafeNameAr}
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#c2b2a1] tracking-widest mt-1 font-mono">
            {cafeSettings.tagline || 'MEET · ENJOY · CONNECT'}
          </p>

          <div className="mt-2.5 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              قاعدة بيانات Supabase السحابية متصلة
            </span>
          </div>
        </div>

        {/* 3 Main Action Mode Tabs: تسجيل الدخول / إنشاء حساب / التحكم بالاسم والصورة */}
        <div className="grid grid-cols-3 p-1.5 bg-[#f5efe6] border-b border-[#e5dcd0] text-center">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#231f1e] text-white shadow-md'
                : 'text-[#6e5f54] hover:bg-[#ebe1d3]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">تسجيل الدخول</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#231f1e] text-white shadow-md'
                : 'text-[#6e5f54] hover:bg-[#ebe1d3]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">إنشاء حساب</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('edit_profile');
              setErrorMessage(null);
              setSuccessMessage(null);
              const u = usersList[0] || currentUser;
              setSelectedUserToEdit(u);
              setEditName(u.name);
              setEditAvatar(u.avatar || '');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
              authMode === 'edit_profile'
                ? 'bg-[#231f1e] text-white shadow-md'
                : 'text-[#6e5f54] hover:bg-[#ebe1d3]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">التحكم بالصورة والاسم</span>
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

          {editSuccessMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{editSuccessMsg}</span>
            </div>
          )}

          {/* ================= TAB 1: LOGIN FORM ================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Account Quick Preview & Switcher */}
              <div className="p-3 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      usersList.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase())?.avatar ||
                      usersList[0]?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                    }
                    alt="User"
                    className="w-10 h-10 rounded-xl object-cover border border-[#c8bcad] shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#231f1e]">
                      {usersList.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase())?.name ||
                        'تسجيل الدخول للنظام'}
                    </div>
                    <div className="text-[10px] text-[#7d6c60]">حسابات معتمدة ومزامنة سحابية</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const u = usersList.find((x) => x.email.toLowerCase() === loginEmail.trim().toLowerCase()) || usersList[0] || currentUser;
                    setSelectedUserToEdit(u);
                    setEditName(u.name);
                    setEditAvatar(u.avatar || '');
                    setAuthMode('edit_profile');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-[#ede5d8] border border-[#d6c9b8] rounded-lg text-[11px] font-bold text-[#45362c] transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-[#8c6239]" />
                  <span>تعديل صورته/اسمه</span>
                </button>
              </div>

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
                    placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                    className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] transition text-right"
                  />
                </div>
              </div>

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

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-[#5e4f44] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#d6c9b8] text-[#231f1e] focus:ring-[#8c6239]"
                  />
                  <span>تذكر بيانات الدخول على هذا الجهاز</span>
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
                    جارٍ التحقق وتسجيل الدخول...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= TAB 2: REGISTER FORM (WITH PHOTO & NAME CONTROL) ================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Photo & Avatar Customizer */}
              <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] space-y-3">
                <label className="block text-xs font-bold text-[#45362c]">
                  الصورة الشخصية للحساب (Avatar)
                </label>

                <div className="flex items-center gap-4">
                  <img
                    src={regAvatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#c5b7a7] shadow-sm shrink-0"
                  />

                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isUploadingRegAvatar ? 'جارٍ رفع الصورة...' : 'رفع صورة من جهازك'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingRegAvatar}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingRegAvatar(true);
                          const result = await uploadImageToSupabase(file, 'avatars');
                          setIsUploadingRegAvatar(false);
                          if (result.url) {
                            setRegAvatar(result.url);
                          } else {
                            alert(result.error || 'فشل في رفع الصورة');
                          }
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={regAvatar}
                      onChange={(e) => setRegAvatar(e.target.value)}
                      placeholder="أو الصق رابط صورة مباشر هنا (URL)"
                      className="w-full bg-white border border-[#ded3c3] rounded-xl px-2.5 py-1.5 text-xs text-[#231f1e] dir-ltr text-right"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <span className="text-[10px] text-[#7d6c60] font-semibold block mb-1">أو اختر صورة جاهزة:</span>
                  <div className="grid grid-cols-6 gap-2">
                    {avatarPresets.slice(0, 6).map((presetUrl, idx) => (
                      <img
                        key={idx}
                        src={presetUrl}
                        alt="Preset"
                        onClick={() => setRegAvatar(presetUrl)}
                        className={`w-9 h-9 rounded-xl object-cover border-2 cursor-pointer transition hover:scale-105 ${
                          regAvatar === presetUrl ? 'border-amber-600 ring-2 ring-amber-400' : 'border-[#ded3c3]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">الاسم بالكامل *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: أحمد محمد (المدير العام) أو كاشير الوردية"
                    className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">البريد الإلكتروني *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">نوع الصلاحية / الدور</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('cashier');
                      setRegAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      regRole === 'cashier'
                        ? 'bg-[#231f1e] text-white border-[#231f1e]'
                        : 'bg-[#faf6f0] text-[#5e4f44] border-[#d6c9b8] hover:bg-[#ede5d8]'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>كاشير (نقطة بيع)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('admin');
                      setRegAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      regRole === 'admin'
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
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">كلمة المرور (6+ أحرف) *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute left-3 top-2.5 text-[#8c7b6d] hover:text-[#231f1e] cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">تأكيد كلمة المرور *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">رقم الهاتف (اختياري)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0100..."
                      className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] dir-ltr text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#45362c]">رمز PIN للوردية (4 أرقام)</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                    <input
                      type="text"
                      maxLength={6}
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      placeholder="مثال: 1234"
                      className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-mono font-bold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-center"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-gray-400 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    جارٍ إنشاء الحساب في قاعدة البيانات...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-emerald-200" />
                    <span>إنشاء الحساب وبدء الاستخدام</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= TAB 3: EDIT PROFILE / NAME & PHOTO DIRECTLY FROM LOGIN ================= */}
          {authMode === 'edit_profile' && (
            <form onSubmit={handleSaveProfileChanges} className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-[#523d2b] flex items-center justify-between">
                <div>
                  <span className="font-bold block">تحكم فوري بالصورة والاسم</span>
                  <span className="text-[11px] text-[#7d6c60]">يمكنك تعديل صورة واسم أي حساب أو مدير مباشرة هنا</span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              </div>

              {/* Account Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#45362c]">اختر الحساب المطلوب تعديله:</label>
                <div className="grid grid-cols-2 gap-2">
                  {usersList.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserToEdit(user);
                        setEditName(user.name);
                        setEditAvatar(user.avatar || '');
                        setEditSuccessMsg(null);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-right transition cursor-pointer ${
                        selectedUserToEdit.id === user.id
                          ? 'bg-[#231f1e] text-white border-[#231f1e] shadow-sm'
                          : 'bg-[#faf6f0] border-[#ded3c3] hover:bg-[#ede5d8] text-[#231f1e]'
                      }`}
                    >
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={user.name}
                        className="w-9 h-9 rounded-lg object-cover border border-[#c8bcad] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{user.name}</div>
                        <div className={`text-[10px] ${selectedUserToEdit.id === user.id ? 'text-amber-300' : 'text-[#7d6c60]'}`}>
                          {user.role === 'admin' ? 'مدير عام' : 'كاشير'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Uploader & Selector */}
              <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] space-y-3">
                <label className="block text-xs font-bold text-[#45362c]">
                  الصورة الشخصية الجديدة
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={editAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#c5b7a7] shadow-sm"
                    />
                    {isUploadingEditAvatar && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white text-[10px] font-bold">
                        جارٍ الرفع...
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isUploadingEditAvatar ? 'جارٍ رفع الصورة...' : 'رفع صورة من جهازك / موبايلك'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingEditAvatar}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploadingEditAvatar(true);
                            const result = await uploadImageToSupabase(file, 'avatars');
                            setIsUploadingEditAvatar(false);
                            if (result.url) {
                              setEditAvatar(result.url);
                            } else {
                              alert(result.error || 'فشل في رفع الصورة');
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-[#7d6c60] block mt-0.5">تدعم الكاميرا، الألبوم، وملفات الصور</span>
                    </div>

                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="أو رابط صورة مباشر (URL)"
                      className="w-full bg-white border border-[#ded3c3] rounded-xl px-2.5 py-1.5 text-xs text-[#231f1e] dir-ltr text-right"
                    />
                  </div>
                </div>

                {/* Preset Avatars */}
                <div>
                  <span className="text-[10px] text-[#7d6c60] font-semibold block mb-1">نماذج صور بديلة:</span>
                  <div className="grid grid-cols-8 gap-1.5">
                    {avatarPresets.map((presetUrl, idx) => (
                      <img
                        key={idx}
                        src={presetUrl}
                        alt="Preset"
                        onClick={() => setEditAvatar(presetUrl)}
                        className={`w-8 h-8 rounded-lg object-cover border-2 cursor-pointer transition hover:scale-110 ${
                          editAvatar === presetUrl ? 'border-amber-600 ring-2 ring-amber-400' : 'border-[#ded3c3]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#45362c]">الاسم المعروض (Display Name)</label>
                <div className="relative">
                  <Edit3 className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="اسم المستخدم أو المدير"
                    className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                  />
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingEditAvatar}
                  className="flex-1 py-3 px-4 bg-[#231f1e] hover:bg-[#3d3633] text-white text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-gray-400"
                >
                  {isSubmitting ? (
                    <span>جارٍ حفظ التعديلات في قاعدة البيانات...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-amber-300" />
                      <span>حفظ الصورة والاسم في قاعدة البيانات</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginEmail(selectedUserToEdit.email);
                  }}
                  className="py-3 px-4 bg-[#f0e7db] hover:bg-[#e4d7c6] text-[#45362c] text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  العودة للدخول
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
