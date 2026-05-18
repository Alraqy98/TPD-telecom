import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GroupedUser } from './types';
import { ArrowLeft, ArrowRight, CheckCircle2, Gauge, Loader2, Save, Users } from 'lucide-react';
import { qualitativeDimensions, quantitativeDimensions } from './accelerationDeepDiveData';

export const AccelerationDeepDive = ({ user, onClose }: { user: GroupedUser; onClose: () => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [qualAnswers, setQualAnswers] = useState<Record<string, Record<number, number>>>({});
  const [quantAnswers, setQuantAnswers] = useState<Record<string, Record<number, number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const adminCreds = JSON.parse(localStorage.getItem('tpd_admin_creds') || '{}');
        const auth = btoa(`${adminCreds.email}:${adminCreds.pass}`);
        const res = await fetch(`/api/admin/deepdive?phone=${encodeURIComponent(user.phone)}`, { headers: { Authorization: `Basic ${auth}` } });
        if (res.ok) {
          const data = await res.json();
          if (data?.accelQualAnswers) setQualAnswers(data.accelQualAnswers);
          if (data?.accelQuantAnswers) setQuantAnswers(data.accelQuantAnswers);
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user.phone]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const adminCreds = JSON.parse(localStorage.getItem('tpd_admin_creds') || '{}');
      const auth = btoa(`${adminCreds.email}:${adminCreds.pass}`);
      const res = await fetch('/api/admin/deepdive', {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, deepDiveType: 'acceleration', accelQualAnswers: qualAnswers, accelQuantAnswers: quantAnswers }),
      });
      setSaveStatus(res.ok ? 'success' : 'error');
    } catch (e) { console.error(e); setSaveStatus('error'); }
    finally { setIsSaving(false); setTimeout(() => setSaveStatus(null), 3000); }
  };

  const renderQuestionBlock = (title: string, questions: string[], answers: Record<string, Record<number, number>>, setAnswers: React.Dispatch<React.SetStateAction<Record<string, Record<number, number>>>>) => (
    <motion.div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-emerald-800 mb-4">{title}</h3>
      <motion.div className="space-y-4">
        {questions.map((q, idx) => {
          const currentAnswer = answers[title]?.[idx];
          return (
            <motion.div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-slate-200 last:border-0">
              <span className="text-slate-700 font-medium flex-1">{q}</span>
              <motion.div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm self-start md:self-auto">
                <button type="button" onClick={() => setAnswers({ ...answers, [title]: { ...(answers[title] || {}), [idx]: 10 } })} className={`px-4 py-2 text-sm font-bold border-l border-slate-200 ${currentAnswer === 10 ? 'bg-green-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>نعم</button>
                <button type="button" onClick={() => setAnswers({ ...answers, [title]: { ...(answers[title] || {}), [idx]: 5 } })} className={`px-4 py-2 text-sm font-bold border-l border-slate-200 ${currentAnswer === 5 ? 'bg-orange-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>جزئياً</button>
                <button type="button" onClick={() => setAnswers({ ...answers, [title]: { ...(answers[title] || {}), [idx]: 0 } })} className={`px-4 py-2 text-sm font-bold ${currentAnswer === 0 ? 'bg-red-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>لا</button>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <motion.div className="bg-white rounded-3xl p-10 min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-orange animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl">
      <motion.div className="flex justify-between items-start mb-8">
        <motion.div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 rotate-180" /><span className="text-sm font-bold">العودة</span>
          </button>
          <h2 className="text-3xl font-black text-emerald-800">التحليل المعمق لكفاءة التسريع™</h2>
          <p className="text-slate-500 font-medium mt-2">مسار التسريع | {user.companyName} | {user.fullName}</p>
        </motion.div>
        <button type="button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-emerald-700 text-white">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{isSaving ? 'جاري الحفظ...' : saveStatus === 'success' ? 'تم الحفظ' : 'حفظ التقدم'}</span>
        </button>
      </motion.div>
      <motion.div className="flex gap-4 mb-10">
        {[{ n: 1 as const, t: 'التحليل النوعي', I: Users }, { n: 2 as const, t: 'التحليل الكمي', I: Gauge }].map(({ n, t, I }) => (
          <button key={n} type="button" onClick={() => setStep(n)} className={`flex items-center gap-3 px-6 py-3 rounded-xl border font-bold ${step === n ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
            <I size={18} />{t}
          </button>
        ))}
      </motion.div>
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-8">
            <h3 className="font-bold text-emerald-900">التحليل النوعي</h3>
            <p className="text-sm text-emerald-800 mt-1">تحديد احتكاكات التنفيذ والاختناقات وفجوات التنسيق.</p>
          </motion.div>
          {qualitativeDimensions.map((s) => renderQuestionBlock(s.title, s.questions, qualAnswers, setQualAnswers))}
          <motion.div className="flex justify-end">
            <button type="button" onClick={() => setStep(2)} className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">المتابعة للتحليل الكمي <ArrowLeft className="w-5 h-5" /></button>
          </motion.div>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-8">
            <h3 className="font-bold text-emerald-900">التحليل الكمي</h3>
            <p className="text-sm text-emerald-800 mt-1">قياس معيقات كفاءة التسريع وتعرض تسرب الإيرادات والعملاء.</p>
          </motion.div>
          {quantitativeDimensions.map((s) => renderQuestionBlock(s.title, s.questions, quantAnswers, setQuantAnswers))}
          <motion.div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="px-8 py-3 rounded-xl font-bold border border-slate-200 flex items-center gap-2"><ArrowRight className="w-5 h-5" />السابق</button>
            <button type="button" onClick={handleSave} className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold">إنهاء وحفظ التحليل</button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
