import { motion } from 'motion/react';
import {
  Rocket,
  Gauge,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { CONTENT } from '../constants';

const AccelSlideHeader = ({
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
}: {
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
}) => (
  <div className="text-center space-y-1 border-b-2 border-slate-100 pb-3 lg:pb-4">
    <h2 className="text-2xl lg:text-4xl font-black text-brand-blue italic leading-tight">{titleAr}</h2>
    <p className="text-base lg:text-xl font-black text-brand-blue/70 italic">({titleEn})</p>
    {subtitleAr && (
      <p className="text-sm lg:text-base text-brand-orange font-bold italic max-w-3xl mx-auto pt-1">
        {subtitleAr}
        {subtitleEn && (
          <span className="block text-[10px] lg:text-xs font-mono text-slate-500 mt-0.5 not-italic">
            {subtitleEn}
          </span>
        )}
      </p>
    )}
  </div>
);

export const SlideAccelPositioning = ({ step }: { step: number }) => {
  const c = CONTENT.slideAccelPositioning;
  return (
    <div className="presentation-slide space-y-4 lg:space-y-6" dir="rtl">
      <AccelSlideHeader titleAr={c.titleAr} titleEn={c.titleEn} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="p-5 lg:p-7 bg-white rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="text-emerald-600 shrink-0" size={28} />
            <div className="text-right">
              <p className="text-sm lg:text-base font-black text-brand-blue italic">{c.introAr}</p>
              <p className="text-[10px] lg:text-xs font-mono text-slate-500">{c.introEn}</p>
            </div>
          </div>
          <ul className="space-y-2">
            {c.characteristics.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ delay: 0.08 * i }}
                className="flex items-start gap-2 text-sm lg:text-base"
              >
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <span className="font-bold text-slate-700 italic">{item.ar}</span>
                  <span className="block text-[10px] font-mono text-slate-400">{item.en}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={step >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="p-5 lg:p-7 bg-gradient-to-br from-emerald-50 to-white rounded-2xl lg:rounded-[2rem] border border-emerald-200/60 shadow-lg flex flex-col justify-center gap-4"
        >
          <p className="text-sm lg:text-base font-bold text-slate-700 italic leading-relaxed">{c.transitionAr}</p>
          <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">{c.transitionEn}</p>
          <div className="border-t border-emerald-200/80 pt-4 space-y-3">
            <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200">
              <p className="text-xs lg:text-sm font-bold text-slate-500 line-through italic">{c.shiftFromAr}</p>
              <p className="text-[10px] text-slate-400">{c.shiftFromEn}</p>
            </div>
            <div className="p-4 rounded-xl bg-brand-orange/10 border-2 border-brand-orange/30">
              <p className="text-base lg:text-lg font-black text-brand-orange italic">{c.shiftToAr}</p>
              <p className="text-xs text-brand-orange/80 font-bold">{c.shiftToEn}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const SlideAccelDeepDive = ({ step }: { step: number }) => {
  const c = CONTENT.slideAccelDeepDive;

  const renderSection = (
    section: typeof c.qualitative,
    color: 'blue' | 'orange',
    visible: boolean
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      className={`p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] border shadow-md h-full ${
        color === 'blue' ? 'bg-white border-brand-blue/15' : 'bg-white border-brand-orange/15'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        {color === 'blue' ? (
          <Users className="text-brand-blue" size={24} />
        ) : (
          <Gauge className="text-brand-orange" size={24} />
        )}
        <div className="text-right">
          <h3
            className={`text-lg lg:text-xl font-black italic ${
              color === 'blue' ? 'text-brand-blue' : 'text-brand-orange'
            }`}
          >
            {section.titleAr}
          </h3>
          <p className="text-[10px] lg:text-xs font-mono text-slate-500">({section.titleEn})</p>
        </div>
      </div>
      <p className="text-xs lg:text-sm font-bold text-slate-600 mb-3 italic">{section.introAr}</p>
      <ul className="space-y-2">
        {section.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs lg:text-sm">
            <div
              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                color === 'blue' ? 'bg-brand-blue' : 'bg-brand-orange'
              }`}
            />
            <span>
              <span className="font-bold text-slate-700">{item.ar}</span>
              <span className="block text-[10px] font-mono text-slate-400">{item.en}</span>
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <div className="presentation-slide space-y-4 lg:space-y-5" dir="rtl">
      <AccelSlideHeader
        titleAr={c.titleAr}
        titleEn={c.titleEn}
        subtitleAr={c.subtitleAr}
        subtitleEn={c.subtitleEn}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {renderSection(c.qualitative, 'blue', step >= 1)}
        {renderSection(c.quantitative, 'orange', step >= 2)}
      </div>
    </div>
  );
};

export const SlideAccelObjective = ({ step }: { step: number }) => {
  const c = CONTENT.slideAccelObjective;
  return (
    <motion.div className="presentation-slide flex flex-col items-center justify-center" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        className="max-w-4xl w-full text-center space-y-8 p-8 lg:p-14 bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-2xl"
      >
        <Sparkles className="mx-auto text-brand-orange" size={40} />
        <AccelSlideHeader titleAr={c.titleAr} titleEn={c.titleEn} />
        <div className="space-y-6 text-right">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-lg lg:text-2xl font-bold text-slate-500 italic leading-relaxed">{c.notAr}</p>
            <p className="text-sm text-slate-400 mt-2">{c.notEn}</p>
          </div>
          <div className="p-6 rounded-2xl bg-brand-blue/5 border-2 border-brand-blue/20">
            <p className="text-xl lg:text-3xl font-black text-brand-blue italic leading-relaxed">{c.isAr}</p>
            <p className="text-sm lg:text-base text-brand-blue/70 mt-3 font-bold">{c.isEn}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const SlideAccelValue = ({ step }: { step: number }) => {
  const c = CONTENT.slideAccelValue;
  return (
    <motion.div className="presentation-slide space-y-5 lg:space-y-6" dir="rtl">
      <AccelSlideHeader titleAr={c.titleAr} titleEn={c.titleEn} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        className="text-center"
      >
        <p className="text-sm lg:text-lg font-bold text-slate-600 italic">{c.introAr}</p>
        <p className="text-xs text-slate-400 mt-1">{c.introEn}</p>
      </motion.div>
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {c.impacts.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-md text-center hover:border-brand-orange/30 transition-colors"
          >
            <ArrowUpRight className="mx-auto text-brand-orange mb-2" size={22} />
            <p className="text-xs lg:text-sm font-black text-brand-blue italic leading-tight">{item.ar}</p>
            <p className="text-[9px] font-mono text-slate-400 mt-1">{item.en}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={step >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        className="p-5 lg:p-7 rounded-2xl bg-gradient-to-r from-brand-blue to-blue-900 text-center"
      >
        <p className="text-lg lg:text-2xl font-black text-white italic">{c.closingAr}</p>
        <p className="text-sm text-white/80 mt-2 font-bold">{c.closingEn}</p>
      </motion.div>
    </motion.div>
  );
};
