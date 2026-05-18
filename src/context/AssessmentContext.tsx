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
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'TPD_ASSESSMENT_COMPLETE') return;
      const payload = event.data.payload as AssessmentSessionResult;
      if (payload?.raiScore == null || payload?.revenueScore == null) return;
      setResult(payload);
      setIsOverlayOpen(false);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setResult]);

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
