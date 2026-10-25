import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  /** Called with the real Google ID Token (JWT) returned by Google Identity Services */
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
}

/**
 * Renders the official Google Sign-In button (Google Identity Services).
 * The Client ID is fetched from the backend (/api/mongo/config) so it can be
 * changed in .env without rebuilding the frontend.
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onCredential, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not_configured' | 'error'>('loading');

  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let retryTimer: any = null;

    const renderGoogleButton = async () => {
      try {
        const res = await fetch('/api/mongo/config');
        const config = await res.json();
        const clientId: string = config?.googleClientId || '';

        if (!clientId) {
          if (!cancelled) setStatus('not_configured');
          return;
        }

        const waitForGis = (attempt: number) => {
          if (cancelled) return;

          if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              auto_select: false,
              cancel_on_tap_outside: true,
              callback: (response: any) => {
                if (response?.credential) {
                  onCredentialRef.current(response.credential);
                } else {
                  onErrorRef.current?.('لم يتم استلام رمز الدخول من Google. حاول مرة أخرى.');
                }
              },
            });

            if (containerRef.current) {
              const width = Math.min(containerRef.current.clientWidth || 320, 400);
              containerRef.current.innerHTML = '';
              window.google.accounts.id.renderButton(containerRef.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                logo_alignment: 'left',
                width,
                locale: 'ar',
              });
            }
            setStatus('ready');
          } else if (attempt < 40) {
            retryTimer = setTimeout(() => waitForGis(attempt + 1), 250);
          } else {
            setStatus('error');
          }
        };

        waitForGis(0);
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    renderGoogleButton();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  if (status === 'not_configured') {
    return (
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 text-right leading-relaxed">
        لتشغيل تسجيل الدخول الحقيقي بحساب Google: ضع قيمة{' '}
        <span className="font-mono font-bold" dir="ltr">GOOGLE_CLIENT_ID</span> داخل ملف{' '}
        <span className="font-mono font-bold" dir="ltr">.env</span> ثم أعد تشغيل السيرفر.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="flex justify-center w-full min-h-[44px]" />
      {status === 'loading' && (
        <p className="text-center text-[11px] text-[#8c7b6d] font-bold">جارٍ تحميل زر Google الرسمي...</p>
      )}
      {status === 'error' && (
        <p className="text-center text-[11px] text-rose-700 font-bold">
          تعذر تحميل خدمة Google. تحقق من اتصال الإنترنت وأعد المحاولة.
        </p>
      )}
    </div>
  );
};
