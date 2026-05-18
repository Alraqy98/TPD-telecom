import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { AssessmentApp } from '@tpd-assessment/App';
import { useAssessment } from '../context/AssessmentContext';
import type { AssessmentSessionResult } from '../assessment/types';
import '@tpd-assessment/index.css';

const assessmentApiBase =
  import.meta.env.VITE_ASSESSMENT_API_URL?.replace(/\/$/, '') ?? '';

export function AssessmentOverlay() {
  const { isOverlayOpen, closeAssessment, setResult } = useAssessment();

  if (!isOverlayOpen) return null;

  const handleComplete = (payload: AssessmentSessionResult) => {
    setResult(payload);
    closeAssessment();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-brand-light/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="تقييم الجاهزية"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-brand-blue italic">التقييم المبدئي — 90×90</p>
        <button
          type="button"
          onClick={closeAssessment}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand-orange hover:text-brand-orange"
          aria-label="إغلاق التقييم"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <MemoryRouter initialEntries={['/telecommunication']}>
          <AssessmentApp
            initialSector="telecom"
            embedded
            apiBaseUrl={assessmentApiBase}
            onSessionComplete={handleComplete}
          />
        </MemoryRouter>
      </div>
    </motion.div>
  );
}
