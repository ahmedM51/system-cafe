import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  X, User as UserIcon, Phone, KeyRound, Camera, Upload, 
  Save, Check, Shield, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { uploadImageToSupabase } from '../../services/supabaseService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useCafe();

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [pin, setPin] = useState(currentUser.pin || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال الاسم' });
      return;
    }

    try {
      await updateCurrentUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        pin: pin.trim() || '1234',
        avatar: avatar.trim(),
      });

      setMessage({ type: 'success', text: 'تم حفظ وتحديث بيانات حسابك محلياً وسحابياً بنجاح!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'فشل في حفظ التعديلات' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ded5c6] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#231f1e] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <UserIcon className="w-4 h-4 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">تعديل الملف الشخصي</h3>
              <p className="text-[11px] text-[#c2b2a1]">تعديل الاسم، الصورة، الهاتف، ورمز الـ PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {message && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* User Email & Role Info Pill */}
          <div className="p-3 bg-[#faf6f0] rounded-2xl border border-[#ded3c3] flex items-center justify-between">
            <div className="text-right">
              <span className="text-[10px] text-[#8c7b6d] block font-bold">البريد الإلكتروني المسجل</span>
              <span className="text-xs font-mono font-bold text-[#231f1e] dir-ltr inline-block">{currentUser.email}</span>
            </div>
            {currentUser.role === 'admin' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                <Shield className="w-3 h-3 text-amber-600" />
                المدير العام (Admin)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                <UserIcon className="w-3 h-3 text-blue-600" />
                كاشير (Cashier)
              </span>
            )}
          </div>

          {/* Avatar Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#45362c]">الصورة الشخصية (Avatar)</label>
            <div className="flex items-center gap-3">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#c5b7a7] shadow-xs shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isUploading ? 'جارٍ الرفع...' : 'رفع صورة من جهازك'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const result = await uploadImageToSupabase(file, 'avatars');
                      setIsUploading(false);
                      if (result.url) {
                        setAvatar(result.url);
                      } else {
                        alert(result.error || 'فشل في رفع الصورة');
                      }
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="أو الصق رابط صورة (URL)"
                  className="w-full bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-2.5 py-1.5 text-xs text-[#231f1e] dir-ltr text-right"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="pt-1">
              <span className="text-[10px] text-[#8c7b6d] block mb-1">أو اختر من الرموز الجاهزة:</span>
              <div className="grid grid-cols-6 gap-1.5">
                {avatarPresets.map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt="preset"
                    onClick={() => setAvatar(p)}
                    className={`w-9 h-9 rounded-xl object-cover border-2 cursor-pointer transition hover:scale-105 ${
                      avatar === p ? 'border-amber-600 ring-2 ring-amber-400' : 'border-[#ded3c3]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#45362c]">الاسم بالكامل *</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs sm:text-sm font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
              />
            </div>
          </div>

          {/* Phone & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#45362c]">رقم الهاتف</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010..."
                  className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-semibold text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239] dir-ltr text-right"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#45362c]">رمز PIN السريع (للكاشير)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-3 text-[#8c7b6d]" />
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#d6c9b8] rounded-xl text-xs font-mono font-bold text-center text-[#231f1e] focus:outline-none focus:ring-2 focus:ring-[#8c6239]"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f0e7db]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#d6c9b8] text-[#5e4f44] hover:bg-[#faf6f0] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#231f1e] hover:bg-[#38312e] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>حفظ وتطبيق التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
