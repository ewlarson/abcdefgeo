import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  clearTurnstileSessionToken,
  fetchTurnstileStatus,
  getTurnstileAction,
  getTurnstileSiteKey,
  isTurnstileConfigured,
  verifyTurnstileToken,
} from '../../services/turnstile';
import { useI18n } from '../../hooks/useI18n';

type GateState = 'checking' | 'challenge' | 'verifying' | 'verified' | 'error';

type TurnstileRenderOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
  'timeout-callback'?: () => void;
  action?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  'refresh-timeout'?: 'auto' | 'manual' | 'never';
  size?: 'normal' | 'compact' | 'flexible';
  theme?: 'light' | 'dark' | 'auto';
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions
  ) => string | undefined;
  reset: (widgetId?: string) => void;
  remove?: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-api';
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile requires a browser window'));
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(
      TURNSTILE_SCRIPT_ID
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile script loaded without API'));
    };

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Turnstile script failed to load')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Turnstile script failed to load')),
      { once: true }
    );
    document.head.appendChild(script);
  });
}

export function TurnstileGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const configured = isTurnstileConfigured();
  const siteKey = getTurnstileSiteKey();
  const action = getTurnstileAction();
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | undefined>();
  const [gateState, setGateState] = useState<GateState>(
    configured ? 'checking' : 'verified'
  );

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;
    fetchTurnstileStatus()
      .then((verified) => {
        if (cancelled) return;
        setGateState(verified ? 'verified' : 'challenge');
      })
      .catch(() => {
        if (cancelled) return;
        clearTurnstileSessionToken();
        setGateState('challenge');
      });

    return () => {
      cancelled = true;
    };
  }, [configured]);

  const handleSuccess = useCallback(async (token: string) => {
    setGateState('verifying');
    try {
      await verifyTurnstileToken(token);
      setGateState('verified');
    } catch {
      setGateState('error');
      window.turnstile?.reset(widgetIdRef.current);
    }
  }, []);

  const handleRecoverableWidgetIssue = useCallback(() => {
    setGateState('challenge');
  }, []);

  useEffect(() => {
    if (!configured || gateState !== 'challenge') return;
    if (!widgetContainerRef.current || widgetIdRef.current) return;

    let cancelled = false;
    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !widgetContainerRef.current || widgetIdRef.current) {
          return;
        }

        widgetIdRef.current = turnstile.render(widgetContainerRef.current, {
          sitekey: siteKey,
          callback: handleSuccess,
          'expired-callback': handleRecoverableWidgetIssue,
          'error-callback': handleRecoverableWidgetIssue,
          'timeout-callback': handleRecoverableWidgetIssue,
          action,
          appearance: 'interaction-only',
          'refresh-expired': 'auto',
          'refresh-timeout': 'auto',
          size: 'flexible',
          theme: 'auto',
        });
      })
      .catch(() => {
        if (!cancelled) setGateState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [
    action,
    configured,
    gateState,
    handleRecoverableWidgetIssue,
    handleSuccess,
    siteKey,
  ]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove?.(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    };
  }, []);

  if (!configured || gateState === 'verified') {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-normal">
            {t('security.turnstileTitle')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {t('security.turnstileDescription')}
          </p>

          <div className="mt-6 flex min-h-[76px] items-center justify-center">
            {gateState === 'checking' ? (
              <p className="text-sm text-gray-600">
                {t('security.checkingSession')}
              </p>
            ) : (
              <div ref={widgetContainerRef} className="w-full" />
            )}
          </div>

          {gateState === 'verifying' && (
            <p className="mt-4 text-sm text-gray-600">
              {t('security.finishingCheck')}
            </p>
          )}
          {gateState === 'error' && (
            <p className="mt-4 text-sm text-red-700">
              {t('security.turnstileError')}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
