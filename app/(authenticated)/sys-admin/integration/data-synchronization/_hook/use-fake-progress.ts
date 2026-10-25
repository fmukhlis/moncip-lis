import { useCallback, useEffect, useRef, useState } from "react";

interface UseFakeProgressOptions {
  tickMs?: number;
  stallAt?: number;
  tickStep?: number;
}

export function useFakeProgress({
  tickMs = 300,
  stallAt = 85,
  tickStep = 12,
}: UseFakeProgressOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervalRef = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const start = useCallback(() => {
    clearIntervalRef();
    setProgress(0);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= stallAt) {
          clearIntervalRef();
          return prev;
        }
        return Math.min(prev + Math.random() * tickStep, stallAt);
      });
    }, tickMs);
  }, [stallAt, tickMs, tickStep]);

  const complete = useCallback(() => {
    clearIntervalRef();
    setProgress(100);

    timeoutRef.current = setTimeout(() => {
      setProgress(0);
      setIsRunning(false);
    }, 700);
  }, []);

  const reset = useCallback(() => {
    clearIntervalRef();
    setProgress(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeoutRef();
      clearIntervalRef();
    };
  }, []);

  return { progress, isRunning, start, complete, reset };
}
