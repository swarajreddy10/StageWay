import { useEffect, useRef, useCallback } from "react";

type DebounceCallback<Args extends unknown[]> = (...args: Args) => void | Promise<void>;

export function useDebounce<Args extends unknown[]>(
  callback: DebounceCallback<Args>,
  delay: number = 500
): (...args: Args) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
