import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ASSESSMENT_STORAGE_KEY,
  type AssessmentSessionResult,
} from '../assessment/types';

type AssessmentContextValue = {
  result: AssessmentSessionResult | null;
  isOverlayOpen: boolean;
  openAssessment: () => void;
  closeAssessment: () => void;
  setResult: (result: AssessmentSessionResult) => void;
  clearResult: () => void;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

function readStoredResult(): AssessmentSessionResult | null {
  try {
    const raw = sessionStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentSessionResult;
  } catch {
    return null;
  }
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [result, setResultState] = useState<AssessmentSessionResult | null>(() =>
    readStoredResult()
  );
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const setResult = useCallback((next: AssessmentSessionResult) => {
    setResultState(next);
    sessionStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const clearResult = useCallback(() => {
    setResultState(null);
    sessionStorage.removeItem(ASSESSMENT_STORAGE_KEY);
  }, []);

  const openAssessment = useCallback(() => setIsOverlayOpen(true), []);
  const closeAssessment = useCallback(() => setIsOverlayOpen(false), []);

  useEffect(() => {
    const allowedOrigins = new Set(
      [
        import.meta.env.VITE_ASSESSMENT_URL,
        'https://tpd-assessment.vercel.app',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
      ]
        .filter(Boolean)
        .map((url) => {
          try {
            return new URL(url as string).origin;
          } catch {
            return null;
          }
        })
        .filter((origin): origin is string => Boolean(origin))
    );

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'TPD_ASSESSMENT_COMPLETE') return;
      if (allowedOrigins.size > 0 && !allowedOrigins.has(event.origin)) return;
      const payload = event.data.payload as AssessmentSessionResult;
      if (payload?.raiScore == null || payload?.revenueScore == null) return;
      // Only the Acceleration track updates the deck; other outcomes keep the slide as-is.
      if (payload.trackId === 'acceleration') {
        setResult(payload);
      } else {
        clearResult();
      }
      setIsOverlayOpen(false);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setResult, clearResult]);

  const value = useMemo(
    () => ({
      result,
      isOverlayOpen,
      openAssessment,
      closeAssessment,
      setResult,
      clearResult,
    }),
    [result, isOverlayOpen, openAssessment, closeAssessment, setResult, clearResult]
  );

  return (
    <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return ctx;
}
