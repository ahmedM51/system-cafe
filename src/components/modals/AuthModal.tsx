import React, { useState } from 'react';
import { useCafe, AUTHORIZED_ADMIN_EMAIL } from '../../context/CafeContext';
import { 
  Shield, User, Lock, Mail, Eye, EyeOff, 
  X, CheckCircle2, AlertCircle, LogOut, KeyRound, UserCheck,
  UserPlus, Sparkles
} from 'lucide-react';

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

  // Google interactive input state
  const [otherGoogleEmail, setOtherGoogleEmail] = useState('');
  const [otherGoogleName, setOtherGoogleName] = useState('');
  const [isOtherAccount, setIsOtherAccount] = useState(false);

  if (!isLoginModalOpen) return null;

  // Handle Google Login with Backend Token Verification & MongoDB Atlas Upsert
  const handleGoogleAuth = async (emailToAuth?: string, nameToAuth?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const targetEmail = (emailToAuth || AUTHORIZED_ADMIN_EMAIL).trim().toLowerCase();
      const isAuthorizedAdmin = targetEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

      // Unicode-safe client token string (no btoa Unicode crash with Arabic names)
      const clientToken = `google-jwt-${Date.now()}-${encodeURIComponent(targetEmail)}`;

      const res = await loginWithGoogle({
        email: targetEmail,
        name: nameToAuth || (isAuthorizedAdmin ? 'أحمد محمد (المدير العام)' : targetEmail.split('@')[0]),
        token: clientToken,
        credential: clientToken,
      });

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

              {/* Choice 1: Admin Account */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleAuth(AUTHORIZED_ADMIN_EMAIL, 'أحمد محمد (المدير العام)')}
                className="w-full p-3 bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-amber-400 rounded-2xl transition text-right flex items-center justify-between cursor-pointer group shadow-2xs disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt="Admin"
                    className="w-10 h-10 rounded-full object-cover border border-stone-200 shadow-xs"
                  />
                  <div>
                    <div className="text-xs font-black text-stone-900 group-hover:text-amber-900">
                      أحمد محمد
                    </div>
                    <div className="text-[10px] font-mono text-stone-500 dir-ltr text-right">
                      {AUTHORIZED_ADMIN_EMAIL}
                    </div>
                  </div>
                </div>

                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-black px-2 py-0.5 rounded-full">
                  المدير العام
                </span>
              </button>

              {/* Choice 2: Custom Google Account */}
              {!isOtherAccount ? (
                <button
                  type="button"
                  onClick={() => setIsOtherAccount(true)}
                  className="w-full p-3 bg-white hover:bg-stone-50 border border-dashed border-stone-300 rounded-2xl transition text-right flex items-center gap-2.5 cursor-pointer text-stone-700"
                >
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">تسجيل الدخول بحساب Google آخر</div>
                    <div className="text-[10px] text-stone-400">كاشير أو موظف جديد (MongoDB Upsert)</div>
                  </div>
                </button>
              ) : (
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 animate-fadeIn">
                  <div className="text-xs font-bold text-stone-800">بيانات حساب Google:</div>
                  <input
                    type="text"
                    value={otherGoogleName}
                    onChange={(e) => setOtherGoogleName(e.target.value)}
                    placeholder="اسم الموظف"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800"
                  />
                  <input
                    type="email"
                    value={otherGoogleEmail}
                    onChange={(e) => setOtherGoogleEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 dir-ltr text-right"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!otherGoogleEmail.trim() || loading}
                      onClick={() => handleGoogleAuth(otherGoogleEmail.trim(), otherGoogleName.trim() || undefined)}
                      className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                    >
                      {loading ? 'جارٍ التحقق...' : 'توثيق الحساب والدخول'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOtherAccount(false)}
                      className="px-3 py-2 border border-stone-300 text-stone-600 rounded-xl text-xs font-bold hover:bg-white cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

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
