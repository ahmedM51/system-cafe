import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  Bell, X, Check, Trash2, AlertTriangle, Gamepad2, 
  Clock, ChevronLeft, Volume2, VolumeX,
  CheckCheck, Sparkles, Filter, ExternalLink, Package
} from 'lucide-react';
import type { AppNotification, NotificationType } from '../../types';

export const NotificationPanel: React.FC = () => {
  const { 
    isNotificationPanelOpen, setIsNotificationPanelOpen,
    notifications, unreadNotificationsCount,
    markNotificationAsRead, markAllNotificationsAsRead,
    clearNotifications, deleteNotification,
    setActiveView, soundEnabled, setSoundEnabled
  } = useCafe();

  const [activeFilter, setActiveFilter] = useState<'all' | 'stock' | 'playstation' | 'unread'>('all');

  if (!isNotificationPanelOpen) return null;

  // Filter list
  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'stock') return notif.type === 'stock_alert';
    if (activeFilter === 'playstation') return notif.type === 'playstation_timer';
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);

      if (diffSec < 60) return 'الآن';
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      if (diffHour < 24) return `منذ ${diffHour} ساعة`;
      return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'حديثاً';
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetView) {
      setActiveView(notif.targetView);
      setIsNotificationPanelOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => setIsNotificationPanelOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-r border-[#ded3c3] animate-slideLeft">
          
          {/* Panel Header */}
          <div className="p-4 sm:p-5 bg-[#231f1e] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-300" />
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[#231f1e] animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-sm sm:text-base">مركز التنبيهات والإشعارات</h3>
                <p className="text-[11px] text-[#c2b4a3]">متابعة فورية للمخزون وجلسات البلايستيشن</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle Button */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  soundEnabled 
                    ? 'text-amber-300 bg-white/10 hover:bg-white/20' 
                    : 'text-stone-400 bg-white/5 hover:bg-white/10'
                }`}
                title={soundEnabled ? 'صوت التنبيهات: مفعّل (انقر للكتم)' : 'صوت التنبيهات: صامت (انقر للتشغيل)'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsNotificationPanelOpen(false)}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="p-2.5 bg-[#f5efe6] border-b border-[#e5dcd0] flex items-center justify-between gap-1 overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeFilter === 'all'
                    ? 'bg-[#231f1e] text-white shadow-2xs'
                    : 'text-[#6e5f54] hover:bg-[#ede5d8]'
                }`}
              >
                الكل ({notifications.length})
              </button>

              <button
                onClick={() => setActiveFilter('stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                  activeFilter === 'stock'
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'text-amber-900 hover:bg-amber-100/60'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>المخزون ({notifications.filter(n => n.type === 'stock_alert').length})</span>
              </button>

              <button
                onClick={() => setActiveFilter('playstation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                  activeFilter === 'playstation'
                    ? 'bg-purple-800 text-white shadow-2xs'
                    : 'text-purple-900 hover:bg-purple-100/60'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>البلايستيشن ({notifications.filter(n => n.type === 'playstation_timer').length})</span>
              </button>

              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeFilter === 'unread'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'text-rose-800 hover:bg-rose-100/60'
                }`}
              >
                غير مقروء ({unreadNotificationsCount})
              </button>
            </div>
          </div>

          {/* Actions Toolbar */}
          <div className="px-4 py-2 bg-[#faf6f0] border-b border-[#e9dfd1] flex items-center justify-between text-xs">
            <span className="text-[#7d6c60] font-semibold">
              عرض {filteredNotifications.length} تنبيه
            </span>

            <div className="flex items-center gap-3">
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="text-[#8c6239] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل أنت متأكد من مسح جميع التنبيهات؟')) {
                      clearNotifications();
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>مسح الكل</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-[#8c7b6d]">
                <div className="w-16 h-16 rounded-2xl bg-[#f5efe6] flex items-center justify-center text-[#8c7b6d] border border-[#ded3c3]">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-bold text-sm text-[#231f1e]">لا توجد تنبيهات حالياً</h4>
                <p className="text-xs max-w-xs leading-relaxed">
                  مستوى المخزون مستقر وجلسات البلايستيشن تعمل بشكل سليم. ستظهر أي تنبيهات فورية هنا تلقائياً.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isStock = notif.type === 'stock_alert';
                const isPlayStation = notif.type === 'playstation_timer';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all text-right relative group ${
                      !notif.read
                        ? notif.severity === 'danger'
                          ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-200'
                          : 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-200'
                        : 'bg-[#faf6f0] border-[#ded3c3] hover:bg-[#f0e7db]'
                    }`}
                  >
                    {/* Unread indicator */}
                    {!notif.read && (
                      <span className="absolute top-3.5 left-3.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                          isPlayStation
                            ? 'bg-purple-100 text-purple-700 border border-purple-300'
                            : isStock
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}
                      >
                        {isPlayStation ? (
                          <Gamepad2 className="w-4 h-4" />
                        ) : isStock ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-[#231f1e] truncate pl-4">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-[#7d6c60] font-mono shrink-0">
                            {formatTimeAgo(notif.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs text-[#5e4f44] leading-relaxed font-medium">
                          {notif.message}
                        </p>

                        {/* Action buttons */}
                        <div className="pt-2 flex items-center justify-between">
                          {notif.targetView && (
                            <button
                              type="button"
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                isPlayStation
                                  ? 'bg-purple-700 hover:bg-purple-800 text-white'
                                  : 'bg-[#231f1e] hover:bg-[#38312e] text-white'
                              }`}
                            >
                              <span>
                                {isPlayStation
                                  ? 'فتح شاشة البلايستيشن'
                                  : isStock
                                  ? 'فتح شاشة المخزن والتوريد'
                                  : 'عرض التفاصيل'}
                              </span>
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}

                          <div className="flex items-center gap-2 mr-auto">
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={() => markNotificationAsRead(notif.id)}
                                className="text-[10px] text-[#7d6c60] hover:text-[#231f1e] font-bold"
                              >
                                تم القراءة
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteNotification(notif.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 transition"
                              title="حذف هذا التنبيه"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-3 bg-[#f5efe6] border-t border-[#e5dcd0] text-center text-[11px] text-[#7d6c60] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${soundEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
              <span>الصوت {soundEnabled ? 'مفعّل' : 'صامت'}</span>
            </span>

            <span className="font-mono text-[10px]">HUB CAFE Notifications System v2.0</span>
          </div>

        </div>
      </div>
    </div>
  );
};
