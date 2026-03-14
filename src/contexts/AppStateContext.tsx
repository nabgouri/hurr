import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface AppStateContextValue {
  appState: AppStateStatus;
  resumeCount: number;
}

const AppStateContext = createContext<AppStateContextValue>({
  appState: AppState.currentState,
  resumeCount: 0,
});

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [resumeCount, setResumeCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
      if (nextState === 'active') {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          setResumeCount((c) => c + 1);
        }, 300);
      }
    });
    return () => {
      subscription.remove();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <AppStateContext.Provider value={{ appState, resumeCount }}>
      {children}
    </AppStateContext.Provider>
  );
}

/**
 * Runs the callback each time the app returns to 'active' state (debounced 300ms).
 * Uses a ref for the callback so consumers don't need to memoize it.
 * Skips the initial mount — only fires on actual resume events.
 */
export function useOnAppActive(callback: () => void) {
  const { resumeCount } = useContext(AppStateContext);
  const callbackRef = useRef(callback);
  const isFirstRun = useRef(true);

  callbackRef.current = callback;

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    callbackRef.current();
  }, [resumeCount]);
}

export function useAppState() {
  return useContext(AppStateContext).appState;
}
