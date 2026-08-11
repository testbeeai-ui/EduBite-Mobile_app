import { useCallback, useEffect, useRef } from "react";

type Cancel = () => void;

/**
 * RN-compatible replacement for the web `usePausableScheduler`. Uses
 * `setTimeout`/`clearTimeout` (available globally in React Native) and
 * `Date.now()` instead of `performance.now()`/`window.setTimeout`, since
 * `window` does not exist on native.
 */
export function usePausableScheduler(paused: boolean): {
  schedule: (callback: () => void, delayMs: number) => Cancel;
  clearAll: () => void;
} {
  const pausedRef = useRef(paused);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const clearAll = useCallback(() => {
    for (const timer of timersRef.current) clearTimeout(timer);
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    let remaining = Math.max(0, delayMs);
    let lastTick = Date.now();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const cancel = () => {
      cancelled = true;
      clearTimeout(timer);
      timersRef.current.delete(timer);
    };

    const tick = () => {
      timersRef.current.delete(timer);
      if (cancelled) return;
      const now = Date.now();
      if (!pausedRef.current) remaining -= now - lastTick;
      lastTick = now;
      if (remaining <= 0) {
        callback();
        return;
      }
      timer = setTimeout(tick, Math.min(remaining, 50));
      timersRef.current.add(timer);
    };

    timer = setTimeout(tick, Math.min(remaining, 50));
    timersRef.current.add(timer);
    return cancel;
  }, []);

  useEffect(() => clearAll, [clearAll]);

  return { schedule, clearAll };
}
