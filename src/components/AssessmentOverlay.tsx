import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';

const assessmentBaseUrl = (
  import.meta.env.VITE_ASSESSMENT_URL ?? 'https://tpd-assessment.vercel.app'
).replace(/\/$/, '');

const assessmentEmbedUrl = `${assessmentBaseUrl}/telecommunication?embed=1`;

export function AssessmentOverlay() {
  const { isOverlayOpen, closeAssessment } = useAssessment();

  if (!isOverlayOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-brand-light"
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

      <iframe
        title="TPD Assessment"
        src={assessmentEmbedUrl}
        className="min-h-0 w-full flex-1 border-0 bg-white"
        allow="clipboard-write"
      />
    </motion.div>
  );
}
