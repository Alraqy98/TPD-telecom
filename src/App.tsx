import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Zap, 
  Shield, 
  BarChart3, 
  Plus,
  ArrowLeft,
  ArrowRight,
  Globe,
  PieChart as LucidePieChart,
  Activity,
  Layers,
  ArrowUpRight,
  FileText,
  MousePointer2,
  Trophy,
  Users,
  Search,
  CheckCircle2,
  Briefcase,
  Quote
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  LabelList,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { CONTENT } from './constants';

const SLIDES = [
  'slideIntroLogo',
  'hero',
  'slide3',
  'slide4',
  'slide2',
  'slideGap',
  'slide8',
  'slideTimeline',
  'slide5',
  'slide6',
  'slide7',
  'slide9',
  'slide10',
  'slide11',
  'thanks'
];

const COLORS = ['#344a92', '#5c77cc', '#1e293b', '#64748b'];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const isPdfMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('pdf');

  // Define max steps for each slide (0-indexed)
  const getStepsForSlide = (index: number) => {
    const slideId = SLIDES[index];
    switch (slideId) {
      case 'slideIntroLogo': return 0;
      case 'hero': return 0;
      case 'slide2': return 3;
      case 'slide3': return 3;
      case 'slide4': return 2;
      case 'slideGap': return 2;
      case 'slideTimeline': return 4;
      case 'slide5': return 3;
      case 'slide6': return 2;
      case 'slide7': return 1;
      case 'slide8': return 4;
      case 'slide9': return 3;
      case 'slide10': return 3;
      case 'slide11': return 2;
      case 'thanks': return 0;
      default: return 0;
    }
  };

  const paginate = useCallback((newDirection: number) => {
    const maxSteps = getStepsForSlide(currentSlide);
    
    // forward
    if (newDirection > 0) {
      if (currentStep < maxSteps) {
        setCurrentStep(prev => prev + 1);
        return;
      }
    } 
    // backward
    else if (newDirection < 0) {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
        return;
      }
    }

    // if we reached limits, change slide
    const next = currentSlide + newDirection;
    if (next >= 0 && next < SLIDES.length) {
      setDirection(newDirection);
      setCurrentSlide(next);
      setCurrentStep(newDirection > 0 ? 0 : getStepsForSlide(next));
    }
  }, [currentSlide, currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') paginate(-1);
      if (e.key === 'ArrowLeft') paginate(1);
      if (e.key === ' ') paginate(1);
      if (e.key === 'Backspace') paginate(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.02,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  if (isPdfMode) {
    return (
      <div className="pdf-deck bg-brand-light text-brand-dark font-sans rtl">
        {SLIDES.map((slideId, index) => (
          <section key={`${slideId}-${index}`} className="pdf-page" data-pdf-slide={slideId}>
            <div className="pdf-slide-shell">
              <div className="pdf-scale">
                {renderSlide(index, getStepsForSlide(index))}
              </div>
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-brand-light text-brand-dark overflow-hidden selection:bg-brand-orange selection:text-white font-sans flex flex-col rtl">
      {/* Grid Overlay */}
      <div className="fixed inset-0 grid-background opacity-30 pointer-events-none"></div>
      
      {/* Decorative Blob */}
      <div className="fixed -top-24 -right-24 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Logo - Only on Hero */}
      <AnimatePresence>
        {SLIDES[currentSlide] === 'hero' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-8 right-8 lg:top-12 lg:right-16 z-50 pointer-events-none"
          >
            <div className="w-24 h-24 lg:w-40 lg:h-40 bg-white rounded-2xl lg:rounded-[3rem] shadow-2xl border border-slate-100 flex items-center justify-center overflow-hidden p-2 lg:p-4">
               <img 
                src="/logo.png" 
                alt="RAI Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://ui-avatars.com/api/?name=R&background=344a92&color=fff';
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <main 
        className="relative flex-grow overflow-hidden cursor-pointer"
        onClick={(e) => {
          // Prevent advancing if clicking a link or button
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
          paginate(1);
        }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
          >
             <div className="w-full h-full max-w-7xl flex items-center justify-center">
               {renderSlide(currentSlide, currentStep)}
             </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-12 flex justify-between items-end pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={() => paginate(-1)}
            disabled={currentSlide === 0}
            className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center opacity-30 hover:opacity-100 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:scale-95 group border border-slate-100"
          >
            <ArrowRight size={24} className="text-brand-blue" />
          </button>
          <button 
            onClick={() => paginate(1)}
            disabled={currentSlide === SLIDES.length - 1}
            className="w-14 h-14 rounded-2xl bg-brand-blue shadow-xl shadow-brand-blue/20 flex items-center justify-center opacity-30 hover:opacity-100 group hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:scale-95 border border-brand-blue"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
           <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">Slide {currentSlide + 1} / {SLIDES.length}</span>
        </div>
      </footer>
    </div>
  );
}

function renderSlide(index: number, step: number) {
  switch (SLIDES[index]) {
    case 'slideIntroLogo': return <SlideIntroLogo step={step} />;
    case 'hero': return <SlideHero step={step} />;
    case 'slide2': return <SlideProblem step={step} />;
    case 'slide3': return <SlideBuild step={step} />;
    case 'slide4': return <SlideSectors step={step} />;
    case 'slideGap': return <SlideGrowthGap step={step} />;
    case 'slideTimeline': return <SlideTimeline step={step} />;
    case 'slide5': return <SlidePhaseOne step={step} />;
    case 'slide6': return <SlidePhaseTwo step={step} />;
    case 'slide7': return <SlideOutcomes step={step} />;
    case 'slide8': return <SlideCaseStudy step={step} />;
    case 'slide9': return <SlidePhaseThree step={step} />;
    case 'slide10': return <SlidePartnership step={step} />;
    case 'slide11': return <SlidePositioning step={step} />;
    case 'thanks': return <SlideThanks step={step} />;
    default: return null;
  }
}

/* ---------------- Slide Components ---------------- */

const SlideIntroLogo = ({ step }: { step: number }) => (
  <div className="presentation-slide flex items-center justify-center">
    <motion.img
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      src="/intro-logo.png"
      alt="90x90 Logo"
      className="max-h-[86vh] max-w-[92vw] object-contain rounded-2xl lg:rounded-[2.5rem] drop-shadow-sm"
    />
  </div>
);

const SlideHero = ({ step }: { step: number }) => {
  const descMatch = CONTENT.hero.description.match(/^(.*?)([A-Za-z].*)$/);
  const arabicDesc = descMatch?.[1]?.trim() ?? CONTENT.hero.description;
  const englishDesc = descMatch?.[2]?.trim() ?? '';
  const [titleBlue, titleOrange] = CONTENT.hero.title.split(' | ');

  return (
    <div className="presentation-slide text-center space-y-6 lg:space-y-10">
      <div className="space-y-2 lg:space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-8xl font-black text-brand-blue tracking-tighter leading-[1.1] flex items-center justify-center gap-4 py-2 lg:py-4"
        >
          <span className="not-italic">{titleBlue}</span>
          <div className="h-10 md:h-16 lg:h-24 w-1 bg-brand-blue/40 rounded-full mx-2 lg:mx-6" />
          <span className="text-brand-orange italic">{titleOrange}</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl lg:text-2xl text-brand-blue font-bold"
        >
          {CONTENT.hero.tagline}
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10 bg-white rounded-2xl lg:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative group"
      >
         <div className="absolute -top-4 lg:-top-6 -right-4 lg:-right-6 w-12 h-12 lg:w-16 lg:h-16 bg-brand-orange rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-xl">
           <Zap size={24} className="lg:w-8 lg:h-8" />
         </div>
         <div className="space-y-2 mb-6 lg:mb-8">
           <h2 className="text-2xl md:text-4xl lg:text-6xl font-black text-brand-blue leading-tight italic underline decoration-brand-orange underline-offset-8 decoration-4">
             {arabicDesc}
           </h2>
          {englishDesc && (
            <p className="text-base md:text-xl lg:text-3xl font-black text-[#5B76CC] italic mt-1 lg:mt-2 uppercase tracking-wide">
              {englishDesc}
            </p>
          )}
         </div>
         <div className="flex flex-col md:flex-row justify-center gap-6 lg:gap-12 pt-6 lg:pt-8 border-t border-slate-100">
           <div className="text-center md:text-right">
             <p className="text-lg md:text-xl lg:text-2xl font-black text-brand-blue mb-0.5">{CONTENT.hero.consultant}</p>
             <p className="text-brand-blue text-[10px] md:text-sm lg:text-xl font-black uppercase tracking-widest leading-none">{CONTENT.hero.role}</p>
             <p className="text-[9px] md:text-xs lg:text-sm text-brand-orange font-black mt-1 leading-relaxed">{CONTENT.hero.subrole}</p>
           </div>
         </div>
      </motion.div>
    </div>
  );
};

const SlideProblem = ({ step }: { step: number }) => (
  <div className="presentation-slide space-y-6 lg:space-y-10">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
      <div className="lg:col-span-6 space-y-4 lg:space-y-8">
        <div className="space-y-2 lg:space-y-4">
          <h2 className="text-4xl lg:text-7xl font-black text-brand-blue leading-[1.1] italic">
            {CONTENT.slide2.title}
          </h2>
          <p className="text-lg lg:text-3xl text-slate-400 font-semibold leading-relaxed">{CONTENT.slide2.intro}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:gap-5 text-right">
          {CONTENT.slide2.positives.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 lg:p-5 bg-white/80 rounded-xl lg:rounded-2xl border border-slate-100 flex items-center gap-3 group hover:bg-white hover:shadow-2xl transition-all"
            >
               <div className="w-2 h-2 lg:w-3 lg:h-3 bg-brand-orange rounded-full group-hover:scale-150 transition-all shrink-0"></div>
               <span className="text-sm lg:text-xl font-black text-slate-700">{item}</span>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {step >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 lg:p-10 bg-brand-blue text-white rounded-2xl lg:rounded-[3rem] shadow-2xl flex items-center gap-6 lg:gap-10 relative overflow-hidden group border border-white/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
              <LucidePieChart size={32} className="shrink-0 text-brand-orange lg:w-16 lg:h-16" />
              <p className="text-xl lg:text-3xl font-black italic leading-tight">{CONTENT.slide2.challenge}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="lg:col-span-6 space-y-6 lg:space-y-10 flex flex-col justify-center">
        <AnimatePresence>
          {step >= 3 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 lg:space-y-10"
            >
              <div className="space-y-2 text-center lg:text-right">
                <p className="text-3xl lg:text-5xl font-black text-brand-blue lg:pr-8 lg:border-r-[6px] border-brand-orange leading-tight">{CONTENT.slide2.conflictTitle}</p>
              </div>
              <div className="space-y-3 lg:space-y-4">
                {CONTENT.slide2.gaps.map((gap, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex justify-between items-center p-4 lg:p-7 bg-white border-2 border-slate-50 rounded-2xl lg:rounded-[2.5rem] transition-all shadow-md hover:shadow-2xl hover:border-brand-orange group"
                  >
                    <div className="flex items-center gap-5 lg:gap-8">
                      <span className="text-brand-orange font-black text-2xl lg:text-4xl italic">0{i+1}</span>
                      <span className="text-lg lg:text-3xl font-black text-slate-700 group-hover:text-brand-blue leading-tight">{gap.title}</span>
                    </div>
                    {gap.sub && <span className="text-xs lg:text-sm font-mono font-black text-slate-500 bg-slate-50 px-3 lg:px-5 py-2 rounded-full uppercase tracking-widest italic border border-slate-100">({gap.sub})</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
);

const SlideBuild = ({ step }: { step: number }) => (
  <div className="presentation-slide space-y-6 lg:space-y-8">
    <div className="text-center space-y-2 lg:space-y-3">
      <h2 className="text-3xl lg:text-5xl font-black text-brand-blue italic leading-tight">{CONTENT.slide3.title}</h2>
      <p className="text-brand-orange font-black uppercase tracking-[0.3em] text-[10px] lg:text-sm underline underline-offset-4 decoration-2">{CONTENT.slide3.buildMethod}</p>
    </div>
    
    <div className="flex flex-wrap justify-center gap-3 lg:gap-4 py-2 min-h-[60px]">
      {step >= 1 && CONTENT.slide3.items.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="px-4 lg:px-5 py-2 lg:py-3 bg-white/50 backdrop-blur-md text-slate-600 border border-slate-100 rounded-2xl lg:rounded-3xl text-sm lg:text-base font-bold italic hover:bg-white hover:shadow-lg hover:text-brand-blue transition-all cursor-default"
        >
          {item}
        </motion.div>
      ))}
    </div>

    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mt-2 lg:mt-4 max-w-5xl mx-auto">
      {/* Inputs Group */}
      <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-[38%] justify-center">
        {CONTENT.slide3.focus.slice(0, 2).map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 50 }}
            animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ delay: i * 0.2 }}
            className="p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] bg-brand-blue group hover:bg-brand-orange transition-all flex items-center justify-between shadow-lg relative"
          >
            <div className="flex items-center gap-3 lg:gap-4 relative z-10 w-full text-right">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                {i === 0 ? <Shield size={28} className="text-white lg:w-8 lg:h-8" /> : <BarChart3 size={28} className="text-white lg:w-8 lg:h-8" />}
              </div>
              <div className="text-right flex-grow">
                <h3 className="text-lg lg:text-xl font-black text-white italic leading-tight">{f.title}</h3>
                <p className="text-[9px] lg:text-[10px] font-black font-mono text-white/80 tracking-wider group-hover:text-white italic">{f.eng}</p>
              </div>
            </div>
            {i === 0 && (
              <div className="absolute -bottom-5 lg:bottom-[-2rem] left-1/2 -translate-x-1/2 z-30">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-brand-orange border-4 border-brand-light flex items-center justify-center shadow-lg">
                  <Plus size={20} className="text-white" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Connection Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={step >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ delay: 0.6 }}
        className="hidden lg:flex items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full bg-brand-orange/5 border-2 border-brand-orange/30 flex items-center justify-center text-brand-orange animate-pulse">
          <ArrowLeft size={24} />
        </div>
      </motion.div>

      {/* Result Section */}
      <div className="w-full lg:w-[42%] flex items-center h-full">
        <motion.div 
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={step >= 3 ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -50, scale: 0.9 }}
          transition={{ delay: 0.8 }}
          className="p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] bg-gradient-to-br from-brand-blue to-blue-900 group hover:shadow-brand-orange/20 transition-all text-center flex flex-col items-center gap-3 lg:gap-4 shadow-2xl relative overflow-hidden border-[3px] border-white/5 w-full justify-center min-h-[220px] lg:min-h-[280px]"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full pointer-events-none group-hover:scale-125 transition-transform"></div>
          <Target size={48} className="text-brand-orange lg:w-20 lg:h-20 animate-bounce" />
          <div className="space-y-1 text-center relative z-10">
            <h3 className="text-2xl lg:text-3xl font-black text-white italic leading-tight uppercase tracking-tight">
              {CONTENT.slide3.focus[2].title}
            </h3>
            <p className="text-[10px] lg:text-sm font-black font-mono text-brand-orange tracking-widest italic uppercase">
              {CONTENT.slide3.focus[2].eng}
            </p>
          </div>
          <div className="px-4 py-1 bg-white/10 rounded-full border border-white/20 mt-2">
             <span className="text-[9px] lg:text-xs text-white/80 font-bold italic">النتيجة النهائية والمنشودة</span>
          </div>
        </motion.div>
      </div>
    </div>
    
    <AnimatePresence>
      {step >= 3 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-center"
        >
           <p className="text-brand-blue font-black italic text-sm lg:text-lg">منهجية RAI™ تركز على الاستدامة والنتائج القياسية</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SlideSectors = ({ step }: { step: number }) => (
  <div className="presentation-slide space-y-4 lg:space-y-6">
    <div className="text-center space-y-1">
      <h2 className="text-2xl lg:text-4xl font-black text-brand-blue italic leading-tight">{CONTENT.slide4.title}</h2>
      <p className="text-slate-400 font-bold max-w-2xl mx-auto text-[10px] lg:text-sm leading-relaxed">{CONTENT.slide4.intro}</p>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {CONTENT.slide4.sectors.map((s, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 lg:p-6 bg-white/50 backdrop-blur-sm rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1 flex flex-col gap-3 lg:gap-4 shadow-sm"
        >
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-lg lg:text-xl font-black italic">0{i+1}</div>
          <div>
            <h4 className="text-base lg:text-xl font-black text-slate-700 group-hover:text-brand-blue mb-1 leading-tight">{s.name}</h4>
            <p className="text-[9px] lg:text-xs font-black font-mono text-slate-600 uppercase tracking-[0.2em] italic block mt-0.5">({s.eng})</p>
          </div>
        </motion.div>
      ))}
    </div>
    <div className="flex flex-wrap gap-3 lg:gap-4 mt-2 justify-center">
      {step >= 2 && CONTENT.slide4.frameworks.map((f, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="px-4 lg:px-6 py-2 lg:py-4 bg-brand-orange/5 border border-brand-orange/20 rounded-xl lg:rounded-[1.5rem] text-brand-orange flex flex-col items-center gap-1 shadow-sm hover:bg-white transition-all text-center"
        >
           <div className="flex items-center gap-2">
             <Zap size={14} className="animate-pulse" />
             <span className="text-sm lg:text-lg font-black italic">{f.name}</span>
           </div>
           <span className="text-xs lg:text-sm font-bold font-mono tracking-wider opacity-80 italic">{f.eng}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const SlideGrowthGap = ({ step }: { step: number }) => {
  const toPercent = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;
  const potentialPct = toPercent(CONTENT.slideGap.potential.value);
  const actualPct = toPercent(CONTENT.slideGap.actual.value);
  const maxPct = Math.max(potentialPct, actualPct, 1);
  const chartHeight = 340;
  const potentialHeight = (potentialPct / maxPct) * chartHeight;
  const actualHeight = (actualPct / maxPct) * chartHeight;
  const gapHeight = Math.max(potentialHeight - actualHeight, 0);

  return (
    <div className="presentation-slide space-y-6 lg:space-y-8" dir="rtl">
      <div className="flex items-end justify-between border-b-2 border-slate-100 pb-3">
        <div className="text-right">
          <h2 className="text-3xl lg:text-5xl font-black text-brand-blue italic leading-tight">{CONTENT.slideGap.titleAr}</h2>
          <p className="text-lg lg:text-2xl font-black text-brand-blue/70 italic mt-1">{CONTENT.slideGap.titleEn}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-end">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 30 }}
          className="lg:col-span-5 flex items-end"
          style={{ height: `${chartHeight}px` }}
        >
          <div
            className="w-full bg-brand-blue text-white rounded-2xl lg:rounded-[2rem] p-5 lg:p-7 shadow-xl flex flex-col justify-between"
            style={{ height: `${potentialHeight}px` }}
          >
            <div className="space-y-1">
              <p className="text-2xl lg:text-4xl font-black italic">{CONTENT.slideGap.potential.titleAr}</p>
              <p className="text-sm lg:text-xl font-black uppercase tracking-widest text-white/80">{CONTENT.slideGap.potential.titleEn}</p>
            </div>
            <p className="text-4xl lg:text-6xl font-black italic">{CONTENT.slideGap.potential.value}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={step >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          className="lg:col-span-2 flex items-end justify-center"
          style={{ height: `${chartHeight}px` }}
        >
          <div
            className="w-full max-w-[170px] bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl lg:rounded-[2rem] p-3 lg:p-5 flex flex-col justify-center items-center text-center shadow-lg"
            style={{ height: `${gapHeight}px`, marginBottom: `${actualHeight}px` }}
          >
            <p className="text-sm lg:text-xl font-black uppercase tracking-widest">{CONTENT.slideGap.gap.label}</p>
            <p className="text-2xl lg:text-4xl font-black mt-1">{CONTENT.slideGap.gap.titleAr}</p>
            <p className="text-3xl lg:text-5xl font-black mt-1">{CONTENT.slideGap.gap.value}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 30 }}
          className="lg:col-span-5 flex items-end"
          style={{ height: `${chartHeight}px` }}
        >
          <div
            className="w-full bg-green-600/85 text-white rounded-2xl lg:rounded-[2rem] p-5 lg:p-7 shadow-xl flex flex-col justify-between"
            style={{ height: `${actualHeight}px` }}
          >
            <div className="space-y-1">
              <p className="text-2xl lg:text-4xl font-black italic">{CONTENT.slideGap.actual.titleAr}</p>
              <p className="text-sm lg:text-xl font-black uppercase tracking-widest text-white/85">{CONTENT.slideGap.actual.titleEn}</p>
            </div>
            <p className="text-4xl lg:text-6xl font-black italic">{CONTENT.slideGap.actual.value}</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={step >= 2 ? { opacity: 1, y: 0 } : { opacity: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-3"
      >
        {CONTENT.slideGap.drivers.map((item, i) => (
          <div
            key={i}
            className="px-4 py-3 rounded-xl bg-[#5B76CC] text-white text-center font-black text-xs lg:text-sm tracking-wide border border-white/10 shadow-md"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const SlideTimeline = ({ step }: { step: number }) => (
  <div className="presentation-slide space-y-6 lg:space-y-8 w-full">
    <div className="text-center space-y-2 lg:space-y-3">
      <h2 className="text-3xl lg:text-5xl font-black text-brand-blue italic">{CONTENT.slideTimeline.title}</h2>
      <div className="h-1.5 w-16 lg:w-24 bg-brand-orange mx-auto rounded-full"></div>
    </div>

    <div className="relative mt-8 lg:mt-12 px-8">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden lg:block rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="h-full bg-gradient-to-l from-brand-blue to-brand-orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative z-10">
        {CONTENT.slideTimeline.phases.map((phase, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={step > i ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col items-center group transition-all ${step > i ? 'scale-100' : 'scale-90 grayscale'}`}
          >
            {/* Circle Node */}
            <div className="relative mb-4 lg:mb-6">
              <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[2rem] bg-white border-[3px] ${step > i ? 'border-brand-orange' : 'border-slate-50'} flex items-center justify-center text-xl lg:text-2xl font-black text-brand-blue shadow-lg group-hover:scale-110 transition-all relative z-10`}>
                {phase.id}
              </div>
              {/* Pulse Effect */}
              {step === i + 1 && (
                <div className="absolute inset-0 bg-brand-orange/20 rounded-[2rem] animate-ping scale-150"></div>
              )}
            </div>

            {/* Content Card */}
            <div className={`p-4 lg:p-6 bg-white border ${step > i ? 'border-brand-orange/30 shadow-xl' : 'border-slate-100 shadow-md'} rounded-2xl lg:rounded-[2.5rem] transition-all text-center w-full relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${phase.color}`}></div>
              <h3 className={`text-xl lg:text-3xl font-black mb-1 italic leading-tight ${i === 3 ? 'text-green-600' : 'text-brand-blue'}`}>{phase.title}</h3>
              <p className="text-sm lg:text-base font-black font-mono text-slate-600 mb-3 tracking-widest uppercase italic">({phase.eng})</p>
              <div className="py-1 px-3 bg-slate-50 rounded-full inline-block">
                <span className={`text-[10px] lg:text-xs font-black italic ${i === 3 ? 'text-green-600' : 'text-brand-orange'}`}>{phase.duration}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const SlidePhaseOne = ({ step }: { step: number }) => {
  const [arabicTitle, englishTitle] = CONTENT.slide5.title.split(' | ');
  
  return (
    <div className="presentation-slide space-y-4 lg:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 lg:gap-4 border-b-2 border-slate-100 pb-3 lg:pb-4">
         <div className="space-y-1 text-right">
           <h2 className="text-3xl lg:text-4xl font-black text-brand-blue italic leading-tight">
             <span>{arabicTitle}</span>
             <span className="block text-xl lg:text-2xl opacity-80 not-italic mt-1">{englishTitle}</span>
           </h2>
           <p className="text-sm lg:text-lg text-brand-orange font-bold lg:pr-3 lg:border-r-4 border-brand-orange italic">
             {CONTENT.slide5.subtitle}
           </p>
         </div>
         <div className="bg-brand-blue/5 px-6 lg:px-8 py-3 lg:py-5 rounded-full border border-brand-blue/10 shadow-sm">
           <span className="text-lg lg:text-3xl font-black uppercase tracking-[0.1em] text-brand-blue leading-tight whitespace-nowrap">{CONTENT.slide5.intro}</span>
         </div>
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {CONTENT.slide5.tracks.map((track, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] bg-white border border-slate-100 shadow-md group hover:border-brand-blue/40 transition-all relative overflow-hidden flex flex-col hover:-translate-y-1"
          >
             <div className="absolute right-0 top-0 w-1 lg:w-1.5 h-full bg-slate-100 group-hover:bg-brand-blue transition-all"></div>
             <h4 className="text-base lg:text-lg font-black text-brand-blue mb-1 lg:mb-2 italic leading-tight">{track.name}</h4>
             <p className="text-xs lg:text-sm text-slate-500 font-medium italic leading-relaxed">{track.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="lg:col-span-4 space-y-2 lg:space-y-3">
        {CONTENT.slide5.items.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="p-3 lg:p-4 bg-white border border-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-between group hover:border-brand-orange hover:shadow-lg transition-all"
          >
             <div className="flex flex-col text-right">
               <p className="text-sm lg:text-base font-black text-slate-700 group-hover:text-brand-blue italic">{item.title}</p>
               <p className="text-[10px] lg:text-xs font-black font-mono text-slate-700 italic tracking-wider truncate uppercase">{item.eng}</p>
             </div>
             <ArrowLeft size={14} className="text-slate-200 group-hover:text-brand-orange group-hover:-translate-x-2 transition-all shrink-0" />
          </motion.div>
        ))}
        {step >= 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <a 
              href="https://rai-assessment.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 lg:p-6 bg-brand-blue hover:bg-brand-orange text-white font-black italic text-center rounded-[2rem] shadow-xl transition-all flex items-center justify-center gap-4 group border-3 border-white/20 hover:scale-105 active:scale-95"
            >
              <span className="text-lg lg:text-2xl">ابدأ التقييم الآن</span>
              <Globe size={28} className="group-hover:rotate-12 transition-transform" />
            </a>
          </motion.div>
        )}
      </div>
    </div>
  </div>
);
};

const SlidePhaseTwo = ({ step }: { step: number }) => {
  const [arabicTitle, englishTitle] = CONTENT.slide6.title.split(' (');
  const [p1NameAr, p1NameEn] = CONTENT.slide6.path1.name.split(' (');
  const [p2NameAr, p2NameEn] = CONTENT.slide6.path2.name.split(' (');

  const renderMethod = (method: string, colorClass: string) => {
    const parts = method.split(' (');
    if (parts.length > 1) {
      return (
        <div className="flex flex-col gap-0.5">
          <p className={`text-sm lg:text-base font-bold ${colorClass} italic leading-tight`}>{parts[0]}</p>
          <p className={`text-[10px] lg:text-xs font-mono font-bold ${colorClass}/60 italic leading-snug`}>({parts.slice(1).join(' (')}</p>
        </div>
      );
    }
    return <p className={`text-sm lg:text-base font-bold ${colorClass} italic leading-tight`}>{method}</p>;
  };

  return (
    <div className="presentation-slide space-y-4 lg:space-y-6" dir="rtl">
      <div className="text-center space-y-1">
         <h2 className="text-2xl lg:text-4xl font-black text-brand-blue italic leading-tight">
           {arabicTitle}
           <span className="block text-lg lg:text-2xl opacity-80 not-italic mt-0.5">({englishTitle}</span>
         </h2>
         <p className="text-[10px] lg:text-sm text-slate-400 font-bold uppercase tracking-[0.2em] italic">{CONTENT.slide6.intro}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 items-stretch">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          className="p-4 lg:p-5 bg-white rounded-xl lg:rounded-[1.5rem] border border-slate-100 relative group overflow-hidden h-full shadow-md hover:shadow-lg transition-all text-right"
        >
           <div className="absolute -top-10 -left-10 w-32 h-32 lg:w-48 lg:h-48 bg-brand-blue/5 rounded-full pointer-events-none group-hover:bg-brand-blue/10 transition-all group-hover:scale-125"></div>
           <div className="space-y-2 lg:space-y-3 relative z-10 h-full flex flex-col">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-sm lg:text-xl font-black text-brand-blue italic leading-tight">{p1NameAr}</h3>
                 {p1NameEn && <p className="text-[10px] lg:text-base font-bold text-brand-blue/60 italic mt-0.5">({p1NameEn}</p>}
               </div>
               <Users size={20} className="text-brand-blue shrink-0 lg:w-6 lg:h-6" />
             </div>
             <div className="p-2 lg:p-3 bg-brand-blue/5 rounded-lg lg:rounded-xl">
               {renderMethod(CONTENT.slide6.path1.method, "text-brand-blue")}
             </div>
             <div className="space-y-1 lg:space-y-1.5 pt-1 lg:pt-2 mt-auto">
               {CONTENT.slide6.path1.items.map((it: any, j) => (
                 <div key={j} className="flex flex-col group-hover:-translate-x-1 transition-transform">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 bg-brand-orange rounded-full shrink-0"></div>
                       <span className="text-xs lg:text-base font-black text-slate-700 group-hover:text-brand-blue italic leading-tight">{it.name}</span>
                    </div>
                    {it.eng && <span className="text-[9px] lg:text-xs font-black font-mono text-slate-600 group-hover:text-brand-blue/60 italic pr-3">{it.eng}</span>}
                 </div>
               ))}
             </div>
           </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          className="p-4 lg:p-5 bg-white rounded-xl lg:rounded-[1.5rem] border border-slate-100 relative group overflow-hidden h-full shadow-md hover:shadow-lg transition-all text-right"
        >
           <div className="absolute -top-10 -left-10 w-32 h-32 lg:w-48 lg:h-48 bg-brand-orange/5 rounded-full pointer-events-none group-hover:bg-brand-orange/10 transition-all group-hover:scale-125"></div>
           <div className="space-y-2 lg:space-y-3 relative z-10 h-full flex flex-col">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-sm lg:text-xl font-black text-brand-orange italic leading-tight">{p2NameAr}</h3>
                 {p2NameEn && <p className="text-[10px] lg:text-base font-bold text-brand-orange/60 italic mt-0.5">({p2NameEn}</p>}
               </div>
               <Activity size={20} className="text-brand-orange shrink-0 lg:w-6 lg:h-6" />
             </div>
             <div className="p-2 lg:p-3 bg-brand-orange/5 rounded-lg lg:rounded-xl">
               {renderMethod(CONTENT.slide6.path2.method, "text-brand-orange")}
             </div>
             <div className="space-y-1 lg:space-y-1.5 pt-1 lg:pt-2 mt-auto">
               {CONTENT.slide6.path2.items.map((it: any, j) => (
                 <div key={j} className="flex flex-col group-hover:-translate-x-1 transition-transform">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 bg-brand-blue rounded-full shrink-0"></div>
                       <span className="text-xs lg:text-base font-black text-slate-700 group-hover:text-brand-orange italic leading-tight">{it.name}</span>
                    </div>
                    {it.eng && <span className="text-[9px] lg:text-xs font-black font-mono text-slate-600 group-hover:text-brand-orange/60 italic pr-3">{it.eng}</span>}
                 </div>
               ))}
             </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

const SlideOutcomes = ({ step }: { step: number }) => {
  const [arabicTitle, englishTitle] = CONTENT.slide7.title.split(' (');

  return (
    <div className="presentation-slide space-y-4 lg:space-y-6" dir="rtl">
      <div className="flex justify-between items-end gap-4 lg:gap-6 border-b-2 border-slate-100 pb-3">
        <div className="text-right">
          <h2 className="text-2xl lg:text-5xl font-black text-brand-blue italic leading-tight">{arabicTitle}</h2>
          <p className="text-lg lg:text-2xl font-black text-brand-blue italic mt-0.5">({englishTitle}</p>
        </div>
        <div className="text-right flex flex-col border-r-4 border-brand-orange pr-3 lg:pr-4">
           <span className="text-[10px] lg:text-xs font-black tracking-[0.2em] text-[#ff0000] uppercase italic leading-none">Diagnostic Analysis</span>
           <span className="text-lg lg:text-2xl font-black italic text-brand-orange leading-tight">Value Gap Discovery</span>
        </div>
      </div>
      
      <div className="pdf-print-outcomes-body flex flex-col gap-6 lg:gap-10 items-center justify-center h-[calc(100%-100px)] max-w-6xl mx-auto py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 w-full">
          {CONTENT.slide7.outcomes.map((o, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={step >= 1 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.1, scale: 0.9, y: 30 }}
              transition={{ delay: i * 0.2 }}
              className="pdf-print-outcome-card p-8 lg:p-12 bg-white rounded-[2rem] lg:rounded-[4rem] border-2 border-slate-50 shadow-2xl hover:shadow-brand-blue/10 transition-all flex flex-col justify-between group relative overflow-hidden h-full min-h-[350px]"
            >
              <div className={`absolute top-0 right-0 w-2 h-full ${i === 0 ? 'bg-brand-blue' : 'bg-brand-orange'} opacity-20`}></div>
              
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                   {i === 0 ? <Activity size={40} className="text-brand-blue" /> : <BarChart3 size={40} className="text-brand-orange" />}
                   <h3 className={`text-2xl lg:text-4xl font-black italic leading-tight ${i === 0 ? 'text-brand-blue' : 'text-brand-orange'}`}>{o.title}</h3>
                 </div>
                 <p className="text-xs lg:text-lg font-black font-mono text-slate-400 tracking-widest italic">{o.eng}</p>
                 <div className="flex items-baseline gap-2 flex-wrap">
                   <p className={`text-base lg:text-2xl font-bold italic leading-relaxed ${i === 1 ? 'text-green-600' : 'text-slate-600'}`}>{o.desc}</p>
                   {i === 1 && <span className="text-base lg:text-2xl text-green-500 font-black italic">XX$</span>}
                 </div>
              </div>
               
              <div className="mt-8 flex items-center justify-between gap-6 border-t-2 border-slate-50 pt-8 relative z-10">
                <div className="text-center bg-slate-50 p-4 rounded-3xl flex-1">
                  <span className="text-[10px] lg:text-xs text-slate-400 font-black uppercase tracking-widest block mb-2 leading-none">After Deep Dive</span>
                  <span className="text-2xl lg:text-4xl font-black italic text-green-500 leading-none">%xx</span>
                </div>
                <div className="text-center bg-red-50 p-4 rounded-3xl flex-1">
                  <span className="text-[10px] lg:text-xs text-slate-400 font-black uppercase tracking-widest block mb-2 leading-none">Initial Assessment</span>
                  <span className="text-2xl lg:text-4xl font-black italic text-[#ff0000] leading-none">{i === 0 ? '%70' : '%75'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SlideCaseStudy = ({ step }: { step: number }) => {
  const [arabicTitle, englishTitle] = CONTENT.slide8.title.split(' (');
  const pieData = [
    { name: 'Hidden Potential', value: 67 },
    { name: 'Current Output', value: 33 },
  ];

  return (
    <div className="presentation-slide space-y-2 lg:space-y-3 !p-2 lg:!p-4 !justify-start lg:!justify-center overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-100 pb-1.5 gap-2">
        <div className="text-right flex-grow">
          <h2 className="text-3xl lg:text-4xl font-black text-brand-blue italic leading-tight">{arabicTitle}</h2>
          <p className="text-lg lg:text-2xl font-bold text-brand-blue/60 italic mb-1">({englishTitle}</p>
          <p className="text-base lg:text-xl text-brand-blue font-bold text-right italic leading-relaxed">{CONTENT.slide8.context}</p>
        </div>
      </div>

      <div className="pdf-print-case-grid grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-stretch flex-grow overflow-hidden">
        {/* Main Content Area - 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-2 lg:gap-3 justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={step >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0.1, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 bg-white rounded-2xl lg:rounded-[2.5rem] p-3 lg:p-5 border border-slate-100 relative group overflow-hidden shadow-lg items-center"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-full h-28 lg:h-36">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#f1f5f9'} />
                        ))}
                      </Pie>
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center mt-1 lg:mt-2">
                  <p className="text-2xl lg:text-4xl font-black text-red-600 italic leading-none">67%</p>
                  <p className="text-[10px] lg:text-sm text-red-600 font-black uppercase tracking-[0.4em] font-mono italic mt-1 whitespace-nowrap">Opportunity Gap</p>
              </div>
            </div>
            <div className="space-y-2 lg:space-y-4 flex flex-col justify-center text-center md:text-right">
               <div className="space-y-1">
                  <h4 className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.6em] text-slate-300 italic">{CONTENT.slide8.results.title}</h4>
                  <p className="text-brand-orange font-black text-base lg:text-xl italic leading-tight">{CONTENT.slide8.results.score}</p>
               </div>
               <p className="text-3xl lg:text-5xl font-black text-brand-blue tracking-tighter italic leading-none">140M<span className="text-base lg:text-lg italic ml-2">SAR+</span></p>
               <p className="text-sm lg:text-lg font-bold italic text-slate-400">بنسبة تقارب: <span className="text-brand-orange">67%</span></p>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {step >= 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 lg:p-7 bg-white rounded-2xl lg:rounded-[2.5rem] border-4 border-brand-orange/20 shadow-2xl relative overflow-hidden italic text-right"
              >
                 <div className="absolute top-0 right-0 w-32 lg:w-48 h-32 lg:h-48 bg-brand-orange/5 rounded-full blur-3xl"></div>
                 <h4 className="text-brand-orange font-black italic text-base lg:text-2xl mb-2 lg:mb-4 underline decoration-4 underline-offset-8">
                   {CONTENT.slide8.conclusion.title}
                 </h4>
                 <p className="text-sm lg:text-xl font-bold italic leading-relaxed text-slate-800">
                    {CONTENT.slide8.conclusion.text}
                 </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Findings - 4 Columns */}
        <div className="pdf-print-case-sidebar lg:col-span-4 flex flex-col gap-2 lg:gap-3 overflow-hidden">
           <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 shrink-0">
              {CONTENT.slide8.initialFeedback.map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0.1, scale: 0.8 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-1.5 lg:p-3 bg-white/90 border border-slate-100 rounded-lg lg:rounded-xl flex items-center justify-center text-center font-bold text-[9px] lg:text-sm text-slate-600 italic shadow-sm"
                >
                  {text}
                </motion.div>
              ))}
           </div>
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0.1, x: -50 }}
             className="p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] bg-brand-orange text-white shadow-xl relative overflow-hidden group flex-grow flex flex-col min-h-0"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform"></div>
              <h3 className="text-sm lg:text-lg font-black italic mb-4 flex items-center gap-2 leading-tight shrink-0">
                 <div className="p-2 bg-white/20 rounded-lg">
                   <Search size={18} className="shrink-0" />
                 </div>
                 {CONTENT.slide8.deepDiveFound}
              </h3>
              <div className="space-y-2 lg:space-y-3 overflow-y-auto pr-1 flex-grow">
                 {CONTENT.slide8.findings.map((f, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0 }}
                      animate={step >= 1 ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-2.5 lg:p-4 rounded-xl lg:rounded-2xl italic font-bold text-[11px] lg:text-sm leading-tight transition-all border border-white/5 hover:border-white/20"
                    >
                       <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-brand-blue rounded-full shrink-0 animate-pulse shadow-[0_0_10px_rgba(52,74,146,0.5)]"></div>
                       {f}
                    </motion.div>
                 ))}
                 <AnimatePresence>
                   {step >= 4 && (
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="mt-4 p-4 lg:p-5 rounded-2xl bg-brand-blue/30 border border-white/10 italic text-[10px] lg:text-xs"
                     >
                        <p className="font-black text-white mb-1 uppercase tracking-wider">Strategic Note:</p>
                        <p className="text-white/70 font-medium">هذه العوامل تمثل فجوات تشغيلية حرجة تم التحقق منها ميدانياً خلال مرحلة التقييم العميق.</p>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

const SlidePhaseThree = ({ step }: { step: number }) => {
  const [arabicTitle, englishTitle] = CONTENT.slide9.title.split(' (');
  return (
    <div className="presentation-slide space-y-4 lg:space-y-6 !p-4 lg:!p-6 !justify-start overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 lg:border-b-4 border-brand-orange pb-4 lg:pb-6 text-right w-full shrink-0">
         <div className="space-y-1">
           <h2 className="text-3xl lg:text-5xl font-black text-brand-blue italic leading-tight">{arabicTitle}</h2>
           <p className="text-lg lg:text-3xl font-bold text-brand-blue/60 italic">({englishTitle}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start min-h-0">
        <div className="lg:col-span-12 xl:col-span-5 space-y-2 lg:space-y-4 flex flex-col justify-center">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-2 lg:gap-3">
             {CONTENT.slide9.actions.map((act, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, x: 20 }}
                 animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0.1, x: 20 }}
                 transition={{ delay: i * 0.1 }}
                 className="pdf-print-slide9-action p-3 lg:p-4 bg-brand-blue text-white rounded-xl lg:rounded-2xl flex items-center justify-between group hover:bg-brand-orange transition-all shadow-sm hover:shadow-md h-full"
               >
                  <span className="text-sm lg:text-base font-black italic">{act}</span>
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 shrink-0">
                    <Zap size={16} />
                  </div>
               </motion.div>
             ))}
           </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 flex flex-col">
           <AnimatePresence>
             {step >= 2 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="p-4 lg:p-6 bg-slate-50 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 flex flex-col space-y-4 lg:space-y-6 shadow-inner overflow-hidden"
               >
                  <div className="space-y-2 lg:space-y-4">
                     <h4 className="text-xs lg:text-base font-black uppercase tracking-[0.3em] text-slate-400 pr-4 border-r-2 border-brand-orange italic mb-2">المتابعة التنفيذية</h4>
                     <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        {CONTENT.slide9.followUpItems.map((item, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="p-2 lg:p-3 bg-white rounded-lg lg:rounded-xl border border-slate-100 flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-slate-600 font-bold hover:shadow-md transition-all italic text-right"
                          >
                             <CheckCircle2 size={12} className="text-brand-orange shrink-0" />
                             {item}
                          </motion.div>
                        ))}
                     </div>
                  </div>
                  <AnimatePresence>
                    {step >= 3 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 lg:space-y-4 pt-4 lg:pt-6 border-t border-slate-200"
                      >
                         <h4 className="text-sm lg:text-lg font-black uppercase tracking-[0.3em] text-green-600 pr-4 border-r-2 border-brand-orange italic mb-2">أهم المخرجات</h4>
                         <div className="flex flex-wrap gap-2 lg:gap-3">
                            {CONTENT.slide9.outcomes.map((item, i) => (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-3 lg:px-5 py-1.5 lg:py-2 bg-white border border-slate-100 rounded-full text-xs lg:text-base font-black text-brand-blue italic hover:border-brand-orange transition-all cursor-default shadow-xs"
                              >
                                 {item}
                              </motion.div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SlidePartnership = ({ step }: { step: number }) => {
  const [arabicTitle, englishTitle] = CONTENT.slide10.title.split(' (');
  return (
    <div className="presentation-slide space-y-3 lg:space-y-4 !p-3 lg:!p-5 !justify-start overflow-y-auto">
      <div className="text-center space-y-0.5 lg:space-y-1 border-b-2 border-slate-100 pb-2 lg:pb-4 flex flex-col items-center shrink-0">
        <h2 className="text-2xl lg:text-4xl font-black text-green-600 italic leading-tight">{arabicTitle}</h2>
        <p className="text-lg lg:text-2xl font-bold text-green-600/60 italic">({englishTitle}</p>
        <p className="text-sm lg:text-lg text-green-600 font-black italic mt-1">{CONTENT.slide10.duration}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
        {CONTENT.slide10.includes.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0.1, scale: 0.95 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 lg:p-5 bg-white rounded-lg lg:rounded-[1.5rem] border border-slate-100 group transition-all hover:shadow-md flex flex-col items-center text-center gap-2 lg:gap-3 shadow-md"
          >
            <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm shrink-0">
              <FileText size={16} />
            </div>
            <span className="text-xs lg:text-base font-black text-slate-700 italic group-hover:text-green-600 leading-tight">{item}</span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-600 p-4 lg:p-6 rounded-[1rem] lg:rounded-[2rem] text-white shadow-xl relative overflow-hidden shrink-0"
          >
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-40 lg:h-40 bg-white/5 rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-6 items-center relative z-10">
              <div className="md:col-span-12 lg:col-span-4 space-y-1 text-center lg:text-right">
                <h4 className="text-white font-black italic text-base lg:text-xl uppercase tracking-widest">{CONTENT.slide10.goal}</h4>
                <p className="text-xs lg:text-sm text-white font-black italic">{CONTENT.slide10.goalSummary}</p>
              </div>
              <div className="md:col-span-12 lg:col-span-8 flex flex-wrap gap-1.5 lg:gap-2 justify-center lg:justify-end">
                {CONTENT.slide10.goals.map((g, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-2 lg:px-4 py-1 lg:py-2 bg-white/10 rounded-lg text-[10px] lg:text-sm font-black italic border border-white/5 hover:bg-white hover:text-green-600 transition-all cursor-default"
                  >
                    {g}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {step >= 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-2"
          >
            <p className="text-green-600 font-black italic text-lg leading-tight">شراكة استراتيجية تهدف لضمان التنفيذ الفعلي والاستدامة المالية</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SlidePositioning = ({ step }: { step: number }) => {
  const content = (CONTENT as any).slide11;
  const [arabicTitle, englishTitle] = content.title.split(' (');

  return (
    <div className="presentation-slide flex flex-col items-center justify-center text-center space-y-8 lg:space-y-12 py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-2 lg:space-y-3"
      >
        <h2 className="text-2xl lg:text-5xl font-black text-brand-blue italic">{arabicTitle}</h2>
        <p className="text-lg lg:text-2xl font-bold text-brand-blue/60 italic">({englishTitle}</p>
        <div className="h-1 lg:h-1.5 w-20 lg:w-28 bg-brand-orange mx-auto rounded-full"></div>
      </motion.div>

      <div className="max-w-4xl w-full space-y-10 lg:space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0 }}
          className="space-y-3 lg:space-y-5"
        >
          <div className="inline-block px-8 py-2.5 bg-brand-blue rounded-xl lg:rounded-2xl shadow-lg">
             <h3 className="text-xl lg:text-3xl font-black text-white italic">{content.tagline}</h3>
          </div>
          <p className="text-base lg:text-2xl font-black text-brand-blue/80 italic">{content.statement}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          {content.pillars.map((pillar: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? 40 : -40 }}
              animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ delay: i * 0.3 }}
              className="p-6 lg:p-8 bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center gap-5 lg:gap-6 relative group hover:border-brand-orange transition-all"
            >
              <div className="absolute -top-4 lg:-top-6 w-9 h-9 lg:w-14 lg:h-14 bg-brand-orange text-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                {i === 0 ? <Zap size={24} className="lg:w-8 lg:h-8" /> : <Quote size={24} className="lg:w-8 lg:h-8" />}
              </div>
              <div className="space-y-3 lg:space-y-4 text-center pt-1 lg:pt-2">
                <h4 className="text-lg lg:text-2xl font-black text-brand-blue leading-tight italic">{pillar.arabic}</h4>
                <p className="text-[9px] lg:text-sm font-black font-mono text-slate-400 italic tracking-wider uppercase leading-relaxed">{pillar.english}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SlideThanks = ({ step }: { step: number }) => {
  const content = (CONTENT as any).thanks;
  const isPdfExport =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('pdf');
  const pdfMotion = {
    initial: { opacity: 1, x: 0, y: 0, scale: 1 } as const,
    transition: { duration: 0 } as const,
  };
  return (
    <div className="presentation-slide flex flex-col items-center justify-center text-center space-y-10 lg:space-y-16 py-8 lg:py-12">
      <div className="space-y-4 lg:space-y-8">
        <motion.h2 
          initial={isPdfExport ? pdfMotion.initial : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={isPdfExport ? pdfMotion.transition : undefined}
          className="text-6xl md:text-8xl lg:text-9xl font-black text-brand-blue tracking-tighter leading-none italic"
        >
          {content.title}
        </motion.h2>
        <motion.p 
          initial={isPdfExport ? pdfMotion.initial : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={isPdfExport ? pdfMotion.transition : { delay: 0.3 }}
          className="text-lg md:text-2xl lg:text-3xl font-bold text-brand-orange italic max-w-4xl mx-auto leading-relaxed px-4"
        >
          {content.subtitle}
        </motion.p>
      </div>

      <div className="flex flex-col items-center justify-center gap-12 lg:gap-20 w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20">
          <motion.div 
            initial={isPdfExport ? pdfMotion.initial : { opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={isPdfExport ? pdfMotion.transition : { delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="w-40 h-40 lg:w-72 lg:h-72 bg-white rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl border border-slate-100 flex items-center justify-center overflow-hidden p-6 lg:p-12 hover:scale-105 transition-transform group">
              <img 
                src="/logo.png" 
                alt="Roqqi Logo" 
                className="w-full h-full object-contain group-hover:rotate-3 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://ui-avatars.com/api/?name=R&background=344a92&color=fff';
                }}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={isPdfExport ? pdfMotion.initial : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={isPdfExport ? pdfMotion.transition : { delay: 1 }}
            className="flex flex-col items-center px-8"
          >
            <div className={`h-0.5 w-12 bg-brand-orange/40 mb-4 ${isPdfExport ? 'block' : 'hidden lg:block'}`}></div>
            <span
              className={`thanks-contact-name text-xl md:text-2xl lg:text-4xl font-black text-brand-blue text-center whitespace-nowrap ${
                isPdfExport ? 'not-italic tracking-normal' : 'uppercase tracking-widest italic'
              }`}
            >
              {content.contact}
            </span>
            <div className={`h-0.5 w-12 bg-brand-orange/40 mt-4 ${isPdfExport ? 'block' : 'hidden lg:block'}`}></div>
          </motion.div>

          <motion.div 
            initial={isPdfExport ? pdfMotion.initial : { opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={isPdfExport ? pdfMotion.transition : { delay: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="w-40 h-40 lg:w-72 lg:h-72 bg-white rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl border border-slate-100 flex items-center justify-center overflow-hidden p-4 lg:p-6 hover:scale-105 transition-transform group">
              <img 
                src="/intro-logo.png" 
                alt="90x90 Logo" 
                className="w-full h-full object-contain group-hover:-rotate-3 transition-transform"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

