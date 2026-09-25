import React, { useEffect, useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  AlertTriangle, Gamepad2, Package, X, ChevronLeft, 
  Clock, Bell, CheckCircle2, Volume2, Sparkles 
} from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeToastNotification, dismissToastNotification, setActiveView, markNotificationAsRead } = useCafe();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeToastNotification) return;

    setProgress(100);
    const duration = 7000; // 7 seconds
    const intervalTime = 100;
    const step = 100 / (duration / intervalTime);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(progressTimer);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    const dismissTimer = setTimeout(() => {
      dismissToastNotification();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [activeToastNotification, dismissToastNotification]);

  if (!activeToastNotification) return null;

  const isStock = activeToastNotification.type === 'stock_alert';
  const isPlayStation = activeToastNotification.type === 'playstation_timer';

  const handleActionClick = () => {
    markNotificationAsRead(activeToastNotification.id);
    dismissToastNotification();
    if (activeToastNotification.targetView) {
      setActiveView(activeToastNotification.targetView);
    }
  };

  return (
    <div 
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slideDown shadow-2xl rounded-2xl overflow-hidden border border-[#ded3c3] bg-white"
      dir="rtl"
    >
      {/* Toast Top Indicator */}
      <div 
        className={`h-1.5 transition-all duration-100 ease-linear ${
          activeToastNotification.severity === 'danger' 
            ? 'bg-rose-500' 
            : activeToastNotification.severity === 'warning' 
            ? 'bg-amber-500' 
            : 'bg-blue-500'
        }`}
        style={{ width: `${progress}%` }}
      />

      <div className="p-4 flex items-start gap-3.5">
        {/* Icon Badge */}
        <div 
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isPlayStation 
              ? 'bg-purple-100 text-purple-700 border border-purple-300 animate-bounce' 
              : isStock 
              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
              : 'bg-blue-100 text-blue-700 border border-blue-300'
          }`}
        >
          {isPlayStation ? (
            <Gamepad2 className="w-5 h-5" />
          ) : isStock ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-[#231f1e] truncate">
              {activeToastNotification.title}
            </h4>
            <span className="text-[10px] text-[#8c7b6d] font-mono shrink-0 mr-2">الآن</span>
          </div>

          <p className="text-xs text-[#5e4f44] leading-relaxed line-clamp-2 font-medium">
            {activeToastNotification.message}
          </p>

          {/* Quick Action Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleActionClick}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                isPlayStation
                  ? 'bg-purple-700 hover:bg-purple-800 text-white'
                  : 'bg-[#231f1e] hover:bg-[#38312e] text-white'
              }`}
            >
              <span>{isPlayStation ? 'عرض جهاز البلايستيشن' : isStock ? 'فحص المخزن والتوريد' : 'عرض التفاصيل'}</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={dismissToastNotification}
              className="text-[11px] text-[#7d6c60] hover:text-[#231f1e] font-semibold px-2 py-1 transition cursor-pointer"
            >
              تجاهل
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={dismissToastNotification}
          className="text-[#9e8f81] hover:text-[#231f1e] p-1 rounded-lg hover:bg-[#f5efe6] transition cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
