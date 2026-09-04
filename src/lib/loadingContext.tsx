import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type LoadingToken = string;

type LoadingContextValue = {
  isLoading: boolean;
  registerLoading: (reason?: string) => LoadingToken;
  resolveLoading: (token: LoadingToken) => void;
  withGlobalLoading: <T>(
    fn: () => Promise<T>,
    reason?: string,
    opts?: { timeoutMs?: number }
  ) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const activeRef = useRef<Map<LoadingToken, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const refreshLoadingState = useCallback(() => {
    setIsLoading(activeRef.current.size > 0);
  }, []);

  const registerLoading = useCallback(
    (reason = 'global'): LoadingToken => {
      const token: LoadingToken = `ld_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      activeRef.current.set(token, reason);
      refreshLoadingState();
      return token;
    },
    [refreshLoadingState]
  );

  const resolveLoading = useCallback(
    (token: LoadingToken) => {
      if (!token) return;
      activeRef.current.delete(token);
      refreshLoadingState();
    },
    [refreshLoadingState]
  );

  const withGlobalLoading = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      reason = 'data-fetch',
      opts?: { timeoutMs?: number }
    ): Promise<T> => {
      const token = registerLoading(reason);
      let timeoutId: number | undefined;
      try {
        if (opts?.timeoutMs && opts.timeoutMs > 0) {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = window.setTimeout(() => {
              reject(new Error(`Request timed out after ${opts.timeoutMs}ms`));
            }, opts.timeoutMs);
          });
          return await Promise.race([fn(), timeoutPromise]);
        }
        return await fn();
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
        resolveLoading(token);
      }
    },
    [registerLoading, resolveLoading]
  );

  useEffect(() => {
    return () => {
      activeRef.current.clear();
    };
  }, []);

  const value = useMemo<LoadingContextValue>(
    () => ({ isLoading, registerLoading, resolveLoading, withGlobalLoading }),
    [isLoading, registerLoading, resolveLoading, withGlobalLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return ctx;
}
