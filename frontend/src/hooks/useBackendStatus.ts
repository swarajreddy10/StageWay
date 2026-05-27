import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { toast } from 'sonner';
import { resolveApiBaseUrl } from '@/lib/api-base';
import { LOCAL_HOSTS } from '@/lib/env';

interface BackendStatusState {
  status: 'probing' | 'awake' | 'sleeping';
  setStatus: (status: 'probing' | 'awake' | 'sleeping') => void;
}

export const useBackendStatusStore = create<BackendStatusState>((set) => ({
  status: 'probing',
  setStatus: (status) => set({ status }),
}));

async function pingBackend(timeoutMs: number): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const baseUrl = resolveApiBaseUrl();
    const response = await fetch(`${baseUrl}/actuator/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

function isLocalBackendTarget() {
  const baseUrl = resolveApiBaseUrl();
  try {
    const parsed = new URL(baseUrl);
    return LOCAL_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function useBackendStatus() {
  const { status, setStatus } = useBackendStatusStore();
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    const probe = async () => {
      const awake = await pingBackend(3000);
      if (cancelled) return;

      if (awake) {
        setStatus('awake');
        return;
      }

      setStatus('sleeping');
      const shouldShowWakeToast = !isLocalBackendTarget();
      if (shouldShowWakeToast) {
        toastIdRef.current = toast.loading(
          'Server is waking up, this may take a moment...',
          { duration: Infinity }
        );
      }

      const retry = async () => {
        if (cancelled) return;
        const ok = await pingBackend(5000);
        if (cancelled) return;

        if (ok) {
          setStatus('awake');
          if (shouldShowWakeToast && toastIdRef.current !== undefined) {
            toast.dismiss(toastIdRef.current);
            toast.success('Connected!', { duration: 2000 });
          }
        } else {
          retryTimer = setTimeout(retry, 5000);
        }
      };
      retryTimer = setTimeout(retry, 5000);
    };

    probe();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [setStatus]);

  return status;
}
