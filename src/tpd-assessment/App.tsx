import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, BarChart3, TrendingUp, CheckCircle2, Building2, User, Phone, Briefcase, Info, Package, HeartHandshake, Store, Factory, ShoppingCart } from 'lucide-react';
import { diagnostics } from './data/questions';
import { Diagnostic, UserData, ResponseType, SurveyResult, GroupedUser } from './types';
import { Search, Filter, ExternalLink, Calendar, RefreshCcw, LayoutDashboard, Database, Activity, Target, Printer } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import tpdLogo from './assets/tpd_logo.png';
import { DeepDive } from './DeepDive';
import {
  getCompanySituation,
  buildSessionPayload,
  type AssessmentSessionPayload,
} from './lib/trackRecommendation';

export type AppStep = 'landing' | 'onboarding' | 'survey' | 'thanks' | 'admin';

export interface FullSurveyResult {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  position: string;
  company_name: string;
  diagnostic_id: string;
  tableName: string;
  responses: Record<number, ResponseType>;
  workshop_id?: string;
}

// Components
const Header = () => (
  <header className="sticky top-0 z-50 shadow-md font-sans flex flex-col print:hidden" dir="rtl">
    {/* Main Nav Bar */}
    <div className="bg-white/80 backdrop-blur-md py-4 px-6 border-b border-primary-blue/10 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <img src={tpdLogo} alt="Talent Preparation & Development Logo" className="h-16 w-auto object-contain" />
          <div className="flex flex-col items-start border-l border-slate-200 pl-4" dir="ltr">
            <span className="text-lg font-black text-primary-blue-dark leading-none">TPD™</span>
            <span className="text-[10px] font-bold text-primary-blue mt-1 uppercase tracking-tighter opacity-70">Talent Preparation & Development</span>
          </div>
        </div>
        
      </div>
    </div>
  </header>
);

import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate, useParams } from 'react-router-dom';

export type AssessmentAppProps = {
  initialSector: 'telecom' | 'general' | 'education' | 'retail' | null;
  workshopId?: string;
  /** When true: compact UI for embedding inside the presentation deck */
  embedded?: boolean;
  apiBaseUrl?: string;
  onSessionComplete?: (payload: AssessmentSessionPayload) => void;
};

export function AssessmentApp({
  initialSector,
  workshopId,
  embedded = false,
  apiBaseUrl = '',
  onSessionComplete,
}: AssessmentAppProps) {
  const [step, setStep] = useState<AppStep>('landing');
  const [sector, setSector] = useState<'telecom' | 'general' | 'education' | 'retail' | null>(initialSector);

  // Update sector when initialSector prop changes
  useEffect(() => {
    setSector(initialSector);
    setStep('landing');
  }, [initialSector]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<Diagnostic | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [completedDiagnostics, setCompletedDiagnostics] = useState<string[]>([]);
  const [sessionScores, setSessionScores] = useState<{ raiScore: number | null, revenueScore: number | null }>({ raiScore: null, revenueScore: null });
  const [sessionResponses, setSessionResponses] = useState<Record<string, Record<number, ResponseType>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const navigate = useNavigate();

  // URL-based admin detection
  useEffect(() => {
    const isUrlAdmin = window.location.hostname.startsWith('admin.');
    const isQueryAdmin = window.location.search.includes('admin');
    const isPathAdmin = window.location.pathname === '/admin';
    
    if (isUrlAdmin || isQueryAdmin || isPathAdmin) {
      setStep('admin');
    }
  }, []);

  // Auto-scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, sector]);

  const handleStartDiagnostic = (diagnostic: Diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    if (userData) {
      setStep('survey');
    } else {
      setStep('onboarding');
    }
  };

  const [searchParams] = useSearchParams();
  const isEmbedded = embedded || searchParams.get('embed') === '1';
  const workshopParam = workshopId || searchParams.get('workshop') || undefined;

  const handleOnboardingSubmit = (data: UserData) => {
    setUserData({ ...data, workshopId: workshopParam });
    setStep('survey');
  };

  const handleSurveySubmit = async (finalResponses: Record<number, ResponseType>) => {
    if (!selectedDiagnostic || !userData) return;

    setIsSubmitting(true);
    const result: SurveyResult = {
      userData,
      diagnosticId: selectedDiagnostic.id,
      responses: finalResponses
    };

    const applySubmission = (score: number, isRai: boolean) => {
      setLastScore(score);
      setSessionScores(prev => ({
        ...prev,
        [isRai ? 'raiScore' : 'revenueScore']: score,
      }));
      setSessionResponses(prev => ({ ...prev, [selectedDiagnostic.id]: finalResponses }));
      setCompletedDiagnostics(prev =>
        prev.includes(selectedDiagnostic.id) ? prev : [...prev, selectedDiagnostic.id]
      );
      setStep('thanks');
    };

    try {
      const score = getScore(finalResponses);
      const isRai = selectedDiagnostic.id.includes('rai');
      let saved = false;

      if (!isEmbedded) {
        const response = await fetch(`${apiBaseUrl}/api/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        });
        saved = response.ok;
        if (!saved) {
          alert('Failed to save results. Please try again.');
          return;
        }
      } else {
        try {
          const response = await fetch(`${apiBaseUrl}/api/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
          });
          saved = response.ok;
        } catch {
          saved = false;
        }
        if (!saved) {
          console.warn('[Assessment] Could not reach API; continuing in isEmbedded mode.');
        }
      }

      applySubmission(score, isRai);
    } catch (error) {
      console.error('Submission error:', error);
      if (isEmbedded) {
        const score = getScore(finalResponses);
        const isRai = selectedDiagnostic.id.includes('rai');
        applySubmission(score, isRai);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForNext = () => {
    setSelectedDiagnostic(null);
    setStep('landing');
  };

  const sectorDiagnostics = diagnostics.filter(d => d.sector === sector);
  const hasRemainingDiagnostics =
    completedDiagnostics.length < sectorDiagnostics.length;

  const notifyPresentation = () => {
    const rai = sessionScores.raiScore;
    const rev = sessionScores.revenueScore;
    if (rai == null || rev == null) return;
    const payload = buildSessionPayload(rai, rev, sector, userData);
    onSessionComplete?.(payload);
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'TPD_ASSESSMENT_COMPLETE', payload }, '*');
    }
  };

  return (
    <div
      className={`${isEmbedded ? 'min-h-0 h-full' : 'min-h-screen'} bg-slate-50 text-slate-900 font-sans selection:bg-primary-blue/20 selection:text-primary-blue-dark`}
      dir="rtl"
    >
      {!isEmbedded && <Header />}

      <main
        className={`relative z-10 mx-auto w-full max-w-7xl ${
          isEmbedded ? 'h-full overflow-y-auto px-4 py-6' : 'px-6 py-12'
        }`}
      >
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <LandingPage 
              key="landing" 
              onStart={handleStartDiagnostic} 
              completed={completedDiagnostics} 
              sector={sector}
            />
          )}

          {step === 'admin' && (
            <AdminDashboard key="admin" onBack={() => navigate('/')} />
          )}

          {step === 'onboarding' && (
            <OnboardingForm 
              key="onboarding" 
              onSubmit={handleOnboardingSubmit} 
              onBack={() => setStep('landing')} 
              initialData={userData}
            />
          )}

          {step === 'survey' && selectedDiagnostic && (
            <Survey 
              key="survey" 
              diagnostic={selectedDiagnostic} 
              onSubmit={handleSurveySubmit} 
              onBack={() => setStep('landing')}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 'thanks' && (
            <ThankYou 
              key="thanks" 
              onNext={resetForNext} 
              hasRemaining={hasRemainingDiagnostics}
              sessionScores={sessionScores}
              sessionResponses={sessionResponses}
              userData={userData}
              currentScore={lastScore}
              currentDiagnosticName={selectedDiagnostic?.titleArabic}
              currentDiagnosticNameEn={selectedDiagnostic?.titleEnglish}
              sector={sector}
              embedded={isEmbedded}
              onContinuePresentation={notifyPresentation}
            />
          )}
        </AnimatePresence>
      </main>

      {!isEmbedded && (
        <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-black/10 mt-12 print:hidden">
          <p className="text-xs text-slate-500 text-center">© {new Date().getFullYear()} Talent Preparation & Development. All rights reserved.</p>
        </footer>
      )}

      {!isEmbedded && (
        <>
          <motion.div className="opacity-20 pointer-events-none fixed bottom-0 right-0 w-96 h-96 bg-primary-blue blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 z-0 print:hidden" />
          <motion.div className="opacity-20 pointer-events-none fixed top-0 left-0 w-80 h-80 bg-accent-orange blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 z-0 print:hidden" />
        </>
      )}
    </div>
  );
}

function WorkshopWrapper() {
  const { workshopId } = useParams();
  return <AssessmentApp initialSector={null} workshopId={workshopId} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/telecommunication" element={<AssessmentApp initialSector="telecom" />} />
        <Route path="/business" element={<AssessmentApp initialSector="telecom" />} />
        <Route path="/telecom" element={<AssessmentApp initialSector="telecom" />} />
        <Route path="/admin" element={<AssessmentApp initialSector={null} />} />
        <Route path="/:workshopId" element={<WorkshopWrapper />} />
        <Route path="/" element={<AssessmentApp initialSector={null} />} />
        <Route path="*" element={<AssessmentApp initialSector={null} />} />
      </Routes>
    </BrowserRouter>
  );
}


const DecisionGateMatrix = ({ rai, revenue, sector }: { rai: number, revenue: number, sector: string | null }) => {
  const raiThreshold = 70;
  const revThreshold = 70;
  
  const currentSituation = getCompanySituation(rai, revenue, sector);
  const activeId = currentSituation.id;
  
  // Normalize visual values so they plot perfectly across 50/50 crosshairs
  const normalizedRev = revenue < revThreshold 
    ? (revenue / revThreshold) * 50 
    : 50 + ((revenue - revThreshold) / (100 - revThreshold)) * 50;
    
  const normalizedRai = rai < raiThreshold 
    ? (rai / raiThreshold) * 50 
    : 50 + ((rai - raiThreshold) / (100 - raiThreshold)) * 50;

  return (
    <div className="w-full flex justify-center mt-6 mb-12 px-2 md:px-6 print:mb-6">
      <div className="flex w-full max-w-5xl print:max-w-[600px] gap-2 md:gap-4 lg:gap-6 items-stretch mx-auto">
        
        {/* Y Axis Explanation (Right Side) */}
        {/* In RTL layout, this first element naturally sits on the right. */}
        <div className="w-10 sm:w-16 md:w-20 flex-shrink-0 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="-rotate-90 whitespace-nowrap text-center opacity-70 text-slate-500 origin-center">
              <span className="block mb-1 text-[10px] md:text-sm font-bold text-slate-600 uppercase tracking-widest print:text-[10px]">الجاهزية التشغيلية (RAI)</span>
              <span className="block text-[8px] md:text-[10px] font-normal print:hidden">يقيس مدى كفاءة وضبط العمليات الداخلية</span>
            </div>
          </div>
        </div>

        {/* Matrix + X Axis Row */}
        <div className="flex-1 flex flex-col items-center">
          {/* Matrix Container */}
          <div className="relative w-full aspect-square border-2 border-black/20 rounded-2xl overflow-hidden print:border-slate-300 print:aspect-auto print:h-[400px] print:w-[400px] bg-white shadow-2xl">
            <div className="absolute inset-0 print:relative print:w-[400px] print:h-[400px] grid grid-cols-2 grid-rows-2">
              {/* Top Right (Physical): Revenue Activation Track */}
              <div className={`p-4 md:p-6 border-b border-l flex flex-col items-start justify-start transition-colors duration-500
                ${activeId === 'revenue_activation' 
                  ? 'bg-amber-400 border-amber-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] opacity-100 z-10 print:bg-amber-100 font-bold' 
                  : 'bg-amber-50 border-slate-300/30 opacity-40 print:opacity-100 font-medium'}`}>
                <h4 className={`text-lg md:text-xl flex items-center gap-2 print:text-amber-800 ${activeId === 'revenue_activation' ? 'text-amber-900 font-bold' : 'text-amber-700/60 font-medium'}`}>
                  <Activity className="w-5 h-5"/>
                  Revenue Activation Track™️
                </h4>
                <p className={`text-xs md:text-sm mt-2 font-medium print:text-amber-700 ${activeId === 'revenue_activation' ? 'text-amber-800' : 'text-amber-600/50'}`}>جاهزية تشغيلية مرتفعة | جاهزية إيرادات منخفضة</p>
              </div>
              {/* Top Left (Physical): Acceleration Track */}
              <div className={`p-4 md:p-6 border-b flex flex-col items-start justify-start transition-colors duration-500
                ${activeId === 'acceleration' 
                  ? 'bg-green-400 border-green-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] opacity-100 z-10 print:bg-green-100 font-bold' 
                  : 'bg-green-50 border-slate-300/30 opacity-40 print:opacity-100 font-medium'}`}>
                <h4 className={`text-lg md:text-xl flex items-center gap-2 print:text-green-800 ${activeId === 'acceleration' ? 'text-green-900 font-bold' : 'text-green-700/60 font-medium'}`}>
                  <TrendingUp className="w-5 h-5"/>
                  Acceleration Track™️
                </h4>
                <p className={`text-xs md:text-sm mt-2 font-medium print:text-green-700 ${activeId === 'acceleration' ? 'text-green-800' : 'text-green-600/50'}`}>جاهزية تشغيلية مرتفعة | جاهزية إيرادات مرتفعة</p>
              </div>
              {/* Bottom Right (Physical): Foundation Track */}
              <div className={`p-4 md:p-6 border-l flex flex-col items-start justify-end transition-colors duration-500
                ${activeId === 'foundation' 
                  ? 'bg-red-400 border-red-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] opacity-100 z-10 print:bg-red-100 font-bold' 
                  : 'bg-red-50 border-slate-300/30 opacity-40 print:opacity-100 font-medium'}`}>
                <h4 className={`text-lg md:text-xl flex items-center gap-2 print:text-red-800 ${activeId === 'foundation' ? 'text-red-900 font-bold' : 'text-red-700/60 font-medium'}`}>
                  <Building2 className="w-5 h-5"/>
                  Foundation Track™️
                </h4>
                <p className={`text-xs md:text-sm mt-2 font-medium print:text-red-700 ${activeId === 'foundation' ? 'text-red-800' : 'text-red-600/50'}`}>جاهزية تشغيلية منخفضة | جاهزية إيرادات منخفضة</p>
              </div>
              {/* Bottom Left (Physical): Governance Activation Track */}
              <div className={`p-4 md:p-6 flex flex-col items-start justify-end transition-colors duration-500
                ${activeId === 'governance_activation' 
                  ? 'bg-blue-400 border-blue-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.04)] opacity-100 z-10 print:bg-blue-100 font-bold' 
                  : 'bg-blue-50 border-slate-300/30 opacity-40 print:opacity-100 font-medium'}`}>
                <h4 className={`text-lg md:text-xl flex items-center gap-2 print:text-blue-800 ${activeId === 'governance_activation' ? 'text-blue-900 font-bold' : 'text-blue-700/60 font-medium'}`}>
                  <Target className="w-5 h-5"/>
                  Governance Activation Track™️
                </h4>
                <p className={`text-xs md:text-sm mt-2 font-medium print:text-blue-700 ${activeId === 'governance_activation' ? 'text-blue-800' : 'text-blue-600/50'}`}>جاهزية تشغيلية منخفضة | جاهزية إيرادات مرتفعة</p>
              </div>
            </div>
            
            {/* Background Grid Lines ONLY */}
            <div className="absolute inset-0 pointer-events-none print:w-[400px] print:h-[400px]">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200/50 border-dashed print:bg-slate-300 max-h-full"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200/50 border-dashed print:bg-slate-300 max-w-full"></div>
            </div>

            {/* Target Marker */}
            <div 
              className="absolute w-6 h-6 bg-red-600 border-4 border-white rounded-full shadow-lg transform translate-x-1/2 translate-y-1/2 z-10 print:bg-red-600 print:text-transparent print:border-black flex items-center justify-center transition-all duration-1000 ease-out"
              style={{ 
                right: `${Math.min(Math.max(normalizedRev, 5), 95)}%`, 
                bottom: `${Math.min(Math.max(normalizedRai, 5), 95)}%`
              }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-75" />
            </div>
          </div>

          {/* X Axis Explanation (Bottom) */}
          <div className="mt-4 md:mt-6 text-center opacity-70 text-slate-500 pr-0">
            <span className="block mb-1 text-[10px] md:text-sm font-bold text-slate-600 uppercase tracking-widest print:text-slate-500">قوة نموذج الإيرادات</span>
            <span className="block text-[8px] md:text-[10px] font-normal">يقيس القدرة على توليد الدخل واستدامته</span>
          </div>

        </div>
      </div>
    </div>
  )
}

export const getScore = (responses: Record<number, ResponseType>) => {
  const values = Object.values(responses);
  const scoreMap = { 'yes': 100, 'partial': 50, 'no': 0 };
  const total = values.reduce((acc, val) => acc + (scoreMap[val] || 0), 0);
  return values.length > 0 ? Math.round(total / values.length) : 0;
};

const getSectorTranslation = (sectorName: string) => {
  switch (sectorName) {
    case 'قطاع الاتصالات': return 'Telecommunication';
    case 'telecom': return 'Telecommunication';
    case 'قطاع التجزئة': return 'Retail';
    case 'قطاع الخدمات': return 'Services';
    case 'قطاع المصانع': return 'Manufacturing';
    case 'قطاع الأعمال': return 'B2B';
    default: return '';
  }
};

const AdminDashboard = ({ onBack }: { onBack: () => void, key?: string }) => {
  const [results, setResults] = useState<FullSurveyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<GroupedUser | null>(null);
  const [adminCreds, setAdminCreds] = useState<{email: string, pass: string} | null>(() => {
    const saved = localStorage.getItem('tpd_admin_creds');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginError, setLoginError] = useState('');
  const [deepDiveMode, setDeepDiveMode] = useState(false);

  const fetchResults = async () => {
    if (!adminCreds) return;
    setIsLoading(true);
    try {
      const auth = btoa(`${adminCreds.email}:${adminCreds.pass}`);
      const resp = await fetch('/api/admin/results', {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setResults(data);
        localStorage.setItem('tpd_admin_creds', JSON.stringify(adminCreds));
      } else if (resp.status === 401) {
        setLoginError('Incorrect email or password.');
        setAdminCreds(null);
        localStorage.removeItem('tpd_admin_creds');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminCreds) {
      fetchResults();
    }
  }, [adminCreds]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const pass = formData.get('password') as string;
    setAdminCreds({ email, pass });
  };

  const getTableLabel = (tableName: string) => {
    const labels: Record<string, string> = {
      'rai_results': 'تقييم راي الشامل',
      'revenue_results': 'تقييم الإيرادات الشامل',
      'rai_edu_results': 'تقييم راي للخدمات',
      'revenue_edu_results': 'تقييم إيرادات الخدمات',
      'rai_retail_results': 'تقييم راي للتجزئة',
      'revenue_retail_results': 'تقييم إيرادات التجزئة'
    };
    return labels[tableName] || tableName;
  };

  // Group results by phone
  const groupedUsers = React.useMemo(() => {
    const map = new Map<string, GroupedUser>();
    results.forEach(r => {
      if (!map.has(r.phone)) {
        map.set(r.phone, {
          phone: r.phone,
          fullName: r.full_name,
          companyName: r.company_name,
          position: r.position,
          workshopId: r.workshop_id,
          createdAt: r.created_at,
          results: [],
          raiScore: null,
          revenueScore: null,
          sector: null
        });
      }
      const user = map.get(r.phone)!;
      user.results.push(r);
      const score = getScore(r.responses);
      
      if (r.tableName.includes('rai')) {
        user.raiScore = score;
        if (!user.sector) user.sector = r.tableName.includes('edu') || r.tableName.includes('service') ? 'services' : r.tableName.includes('retail') ? 'retail' : r.tableName.includes('factory') ? 'factory' : 'telecom';
      }
      if (r.tableName.includes('revenue')) {
        user.revenueScore = score;
        if (!user.sector) user.sector = r.tableName.includes('edu') || r.tableName.includes('service') ? 'services' : r.tableName.includes('retail') ? 'retail' : r.tableName.includes('factory') ? 'factory' : 'telecom';
      }
      
      if (new Date(r.created_at) > new Date(user.createdAt)) {
        user.createdAt = r.created_at;
      }
    });
    return Array.from(map.values()).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [results]);

  if (!adminCreds) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto py-20"
      >
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 ml-1" />
          <span>خروج</span>
        </button>
        <div className="bg-white border border-black/10 p-10 rounded-3xl space-y-8 shadow-2xl relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-black/5 text-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h3 className="text-2xl font-bold text-black">بوابة الإدارة</h3>
            <p className="text-slate-600 text-sm mt-2">الرجاء تسجيل الدخول للوصول إلى بيانات التقييم.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 text-right">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">البريد الإلكتروني</label>
              <input 
                name="email"
                type="email" 
                required 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black/50 text-black text-left"
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">كلمة المرور</label>
              <input 
                name="password"
                type="password" 
                required 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black/50 text-black text-left"
                dir="ltr"
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{loginError}</p>
            )}
            <button 
              className="w-full bg-black hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  const filteredUsers = groupedUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm) ||
    (u.workshopId && u.workshopId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateStats = () => {
    if (results.length === 0) return { totalUsers: 0, avgRai: 0, avgRevenue: 0, chartData: [] };
    
    let totalRai = 0, countRai = 0;
    let totalRev = 0, countRev = 0;
    let highPerformers = 0;

    filteredUsers.forEach(u => {
      if (u.raiScore !== null) { totalRai += u.raiScore; countRai++; }
      if (u.revenueScore !== null) { totalRev += u.revenueScore; countRev++; }
      if (u.raiScore !== null && u.raiScore >= 80 && u.revenueScore !== null && u.revenueScore >= 80) highPerformers++;
    });

    const avgRai = countRai > 0 ? Math.round(totalRai / countRai) : 0;
    const avgRevenue = countRev > 0 ? Math.round(totalRev / countRev) : 0;

    // Group by sector for chart
    const sectorStats: Record<string, { rai: number, raiCount: number, rev: number, revCount: number }> = {
      'General': { rai: 0, raiCount: 0, rev: 0, revCount: 0 },
      'Services': { rai: 0, raiCount: 0, rev: 0, revCount: 0 },
      'Retail': { rai: 0, raiCount: 0, rev: 0, revCount: 0 },
      'Factory': { rai: 0, raiCount: 0, rev: 0, revCount: 0 }
    };

    filteredUsers.forEach(u => {
      let key = 'General';
      if (u.sector === 'services' || u.sector === 'education') key = 'Services';
      else if (u.sector === 'retail') key = 'Retail';
      else if (u.sector === 'factory') key = 'Factory';
      
      if (u.raiScore) { sectorStats[key].rai += u.raiScore; sectorStats[key].raiCount++; }
      if (u.revenueScore) { sectorStats[key].rev += u.revenueScore; sectorStats[key].revCount++; }
    });

    const chartData = [
      {
        name: 'قطاع الأعمال',
        RAI: sectorStats['General'].raiCount > 0 ? Math.round(sectorStats['General'].rai / sectorStats['General'].raiCount) : 0,
        Revenue: sectorStats['General'].revCount > 0 ? Math.round(sectorStats['General'].rev / sectorStats['General'].revCount) : 0,
      },
      {
        name: 'قطاع الخدمات',
        RAI: sectorStats['Services'].raiCount > 0 ? Math.round(sectorStats['Services'].rai / sectorStats['Services'].raiCount) : 0,
        Revenue: sectorStats['Services'].revCount > 0 ? Math.round(sectorStats['Services'].rev / sectorStats['Services'].revCount) : 0,
      },
      {
        name: 'قطاع التجزئة',
        RAI: sectorStats['Retail'].raiCount > 0 ? Math.round(sectorStats['Retail'].rai / sectorStats['Retail'].raiCount) : 0,
        Revenue: sectorStats['Retail'].revCount > 0 ? Math.round(sectorStats['Retail'].rev / sectorStats['Retail'].revCount) : 0,
      },
      {
        name: 'قطاع المصانع',
        RAI: sectorStats['Factory'].raiCount > 0 ? Math.round(sectorStats['Factory'].rai / sectorStats['Factory'].raiCount) : 0,
        Revenue: sectorStats['Factory'].revCount > 0 ? Math.round(sectorStats['Factory'].rev / sectorStats['Factory'].revCount) : 0,
      }
    ];

    return { totalUsers: filteredUsers.length, avgRai, avgRevenue, highPerformers, chartData };
  };

  const stats = calculateStats();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="space-y-8 bg-slate-50 min-h-screen text-slate-900 print:bg-white print:text-black"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <button onClick={() => deepDiveMode ? setDeepDiveMode(false) : selectedUser ? setSelectedUser(null) : onBack()} className="flex items-center gap-2 text-slate-500 hover:text-primary-blue transition-colors mb-2">
            <ArrowLeft className="rotate-180 w-4 h-4" />
            <span>{deepDiveMode ? 'العودة للتقرير' : selectedUser ? 'العودة للقائمة' : 'العودة للموقع'}</span>
          </button>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LayoutDashboard className="text-primary-blue" />
            لوحة الإدارة
          </h2>
        </div>
        <div className="flex gap-2">
          {selectedUser && !deepDiveMode && (
            <button 
              onClick={() => setDeepDiveMode(true)}
              className="px-6 py-3 bg-primary-blue border border-transparent rounded-xl text-white hover:bg-primary-blue-dark transition-all flex items-center gap-2 font-bold shadow-lg shadow-primary-blue/20"
            >
              <Target size={20} />
              <span className="hidden sm:inline">تقييم Deep Dive</span>
            </button>
          )}
          {selectedUser && !deepDiveMode && (
            <button 
              onClick={() => window.print()}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-primary-blue hover:border-primary-blue transition-all flex items-center gap-2 font-bold"
            >
              <Printer size={20} />
              <span className="hidden sm:inline">طباعة التقرير</span>
            </button>
          )}
          <button 
            onClick={fetchResults}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-primary-blue hover:border-primary-blue transition-all"
          >
            <RefreshCcw size={20} className={isLoading ? 'animate-spin text-primary-blue' : ''} />
          </button>
        </div>
      </div>

      {!selectedUser ? (
        <div className="space-y-8 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-black/10 p-6 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-black/5 text-black rounded-xl flex items-center justify-center"><User size={24} /></div>
              </div>
              <p className="text-slate-600 text-sm font-medium">إجمالي الشركات</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.totalUsers}</p>
            </div>
            
            <div className="bg-white border border-black/10 p-6 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center"><Activity size={24} /></div>
              </div>
              <p className="text-slate-600 text-sm font-medium">متوسط الحوكمة (RAI Score™️)</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.avgRai}%</p>
            </div>

            <div className="bg-white border border-black/10 p-6 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-300 text-slate-900 rounded-xl flex items-center justify-center"><TrendingUp size={24} /></div>
              </div>
              <p className="text-slate-600 text-sm font-medium">متوسط الإيرادات (Revenue Score™️)</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.avgRevenue}%</p>
            </div>

            <div className="bg-white border border-black/10 p-6 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center"><Target size={24} /></div>
              </div>
              <p className="text-slate-600 text-sm font-medium">شركات في قطاع التسارع</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.highPerformers}</p>
            </div>
          </div>

          <div className="bg-white border border-black/10 p-6 rounded-2xl shadow-lg shadow-black/5">
            <h3 className="text-lg font-bold text-black mb-6">مقارنة القطاعات</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#000000', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="RAI" name="الحوكمة التشغيلية (RAI Score™️) %" fill="#333333" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Revenue" name="جاهزية الإيرادات (Revenue Score™️) %" fill="#999999" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-primary-blue/10 rounded-3xl p-6 shadow-2xl shadow-primary-blue/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold text-slate-900">قائمة الشركات المقيمة</h3>
              <div className="relative w-full md:w-72">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-blue/40" size={18} />
                <input 
                   type="text"
                  placeholder="البحث بالاسم، الشركة، الجوال، أو رمز ورشة العمل..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-sm focus:outline-none focus:border-primary-blue/50 text-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full text-center py-10 text-primary-blue font-bold animate-pulse">جاري التحميل...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500 text-sm italic">لا توجد نتائج</div>
              ) : filteredUsers.map(u => {
                const sectors = Array.from(new Set(u.results.map(r => {
                  if (r.tableName.includes('retail')) return 'قطاع التجزئة';
                  if (r.tableName.includes('service') || r.tableName.includes('edu')) return 'قطاع الخدمات';
                  if (r.tableName.includes('factory')) return 'قطاع المصانع';
                  return 'قطاع الأعمال';
                })));
                
                return (
                  <button
                    key={u.phone}
                    onClick={() => setSelectedUser(u)}
                    className="w-full text-right p-5 rounded-2xl bg-white border border-primary-blue/5 hover:border-primary-blue/30 hover:bg-primary-blue/[0.02] transition-all flex flex-col group shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start w-full mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-blue/5 group-hover:bg-primary-blue group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0 text-primary-blue">
                        {sectors.includes('قطاع التجزئة') ? <Package size={24} /> : sectors.includes('قطاع المصانع') ? <Factory size={24} /> : <Building2 size={24} />}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {sectors.map(tag => {
                          let tagStyle = 'bg-primary-blue/5 text-primary-blue-dark border-primary-blue/10'; 
                          
                          return (
                          <div key={tag} className={`flex flex-col items-end px-2 py-1 rounded-md border ${tagStyle}`}>
                            <span className="text-xs font-bold leading-tight">
                              {tag}
                            </span>
                          </div>
                        )})}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-black text-lg leading-tight mb-1">{u.companyName}</h4>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <p className="text-sm text-slate-600">{u.fullName}</p>
                      {u.workshopId && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono border border-slate-200">
                          ورشة: {u.workshopId}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto w-full">
                      <div className="bg-white rounded-lg py-2 border border-black/10 font-mono text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">نتيجة راي</p>
                        <p className={`text-lg font-bold ${u.raiScore !== null ? 'text-black' : 'text-slate-600'}`}>
                          {u.raiScore !== null ? `${u.raiScore}%` : '-'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg py-2 border border-black/10 font-mono text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">الإيرادات</p>
                        <p className={`text-lg font-bold ${u.revenueScore !== null ? 'text-black' : 'text-slate-600'}`}>
                          {u.revenueScore !== null ? `${u.revenueScore}%` : '-'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : deepDiveMode ? (
        <DeepDive user={selectedUser} onClose={() => setDeepDiveMode(false)} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedUser.phone}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-black/10 rounded-3xl p-6 md:p-10 space-y-10 shadow-2xl print:shadow-none print:border-none print:bg-white print:p-0 w-full max-w-6xl mx-auto"
          >
            {/* Print Header */}
            <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-6 mb-8 mt-4 whitespace-nowrap">
              <div>
                <h1 className="text-3xl font-black text-black">تقرير أداء الشركة</h1>
                <p className="text-slate-500 mt-1 font-mono text-sm">{new Date().toLocaleDateString('ar-SA')}</p>
              </div>
              <div className="text-left flex flex-col items-start" dir="ltr">
                <img src={tpdLogo} alt="Talent Preparation & Development Logo" className="h-16 w-auto object-contain grayscale opacity-80" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-black/10 pb-8 print:border-slate-200">
              <div className="space-y-4">
                <div>
                  <div className="flex gap-2 mb-3">
                    {Array.from(new Set(selectedUser.results.map(r => {
                      if (r.tableName.includes('retail')) return 'قطاع التجزئة';
                      if (r.tableName.includes('service') || r.tableName.includes('edu')) return 'قطاع الخدمات';
                      if (r.tableName.includes('factory')) return 'قطاع المصانع';
                      return 'قطاع الأعمال';
                    }))).map(tag => {
                      let tagStyle = 'bg-slate-100 text-black border-black/10'; 
                      
                      return (
                      <div key={tag} className={`flex flex-col items-center px-3 py-1 rounded-md border print:border-slate-300 print:bg-transparent print:text-slate-600 ${tagStyle}`}>
                        <span className="text-sm font-bold leading-tight">
                          {tag}
                        </span>
                        <span className="text-xs font-bold opacity-70 leading-none" dir="ltr">
                          {getSectorTranslation(tag as string)}
                        </span>
                      </div>
                    )})}
                  </div>
                  <h3 className="text-4xl font-black text-black mt-2 print:text-black">{selectedUser.companyName}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-600 print:text-slate-700">
                  <span className="flex items-center gap-2"><User className="text-black w-4 h-4 print:text-slate-600" /> {selectedUser.fullName}</span>
                  <span className="flex items-center gap-2"><Briefcase className="text-black w-4 h-4 print:text-slate-600" /> {selectedUser.position}</span>
                  <span className="flex items-center gap-2" dir="ltr"><Phone className="text-black w-4 h-4 print:text-slate-600" /> {selectedUser.phone}</span>
                  <span className="flex items-center gap-2"><Calendar className="text-black w-4 h-4 print:text-slate-600" /> {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  {selectedUser.workshopId && (
                    <span className="flex items-center gap-2 text-black font-bold"><Target className="w-4 h-4 print:text-slate-600" /> ورشة العمل: {selectedUser.workshopId}</span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 self-stretch">
                <div className="text-center bg-white border border-black/10 px-8 py-6 rounded-2xl print:bg-slate-50 print:border-slate-200 flex flex-col justify-center min-w-[140px]">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 print:text-slate-500">حكومة التشغيل (RAI)™️</p>
                  <p className={`text-5xl font-black ${selectedUser.raiScore !== null ? 'text-black' : 'text-slate-700'}`}>
                    {selectedUser.raiScore !== null ? `${selectedUser.raiScore}%` : 'N/A'}
                  </p>
                </div>
                <div className="text-center bg-white border border-black/10 px-8 py-6 rounded-2xl print:bg-slate-50 print:border-slate-200 flex flex-col justify-center min-w-[140px]">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 print:text-slate-500">جاهزية الإيرادات™️</p>
                  <p className={`text-5xl font-black ${selectedUser.revenueScore !== null ? 'text-black' : 'text-slate-700'}`}>
                    {selectedUser.revenueScore !== null ? `${selectedUser.revenueScore}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {selectedUser.raiScore !== null && selectedUser.revenueScore !== null ? (
              <div className="space-y-6 print:break-inside-avoid">
                <div className="flex items-center gap-3">
                  <Target className="text-black print:text-slate-800" />
                  <h4 className="text-xl font-bold text-black print:text-black">مصفوفة توجيه القرارات</h4>
                </div>
                <p className="text-slate-600 text-sm print:text-slate-600 max-w-3xl">
                  بناءً على التقييم المزدوج، تظهر هذه المصفوفة الموقع الحالي للشركة لتحديد المسار الأنسب للمرحلة القادمة.
                </p>
                
                
                <DecisionGateMatrix rai={selectedUser.raiScore} revenue={selectedUser.revenueScore} sector={selectedUser.sector} />
                
                {/* Situation summary */}
                <div className={`mt-8 p-6 rounded-2xl border print:border-slate-300 print:bg-transparent ${getCompanySituation(selectedUser.raiScore, selectedUser.revenueScore, selectedUser.sector).bg} ${getCompanySituation(selectedUser.raiScore, selectedUser.revenueScore, selectedUser.sector).border}`}>
                  <h4 className={`text-lg font-bold mb-2 print:text-black ${getCompanySituation(selectedUser.raiScore, selectedUser.revenueScore, selectedUser.sector).color}`}>
                    الوضع الحالي: {getCompanySituation(selectedUser.raiScore, selectedUser.revenueScore, selectedUser.sector).title}
                  </h4>
                  <p className="text-slate-700 print:text-slate-700 leading-relaxed text-sm">
                    {getCompanySituation(selectedUser.raiScore, selectedUser.revenueScore, selectedUser.sector).desc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-black/5 border border-black/10 p-6 rounded-2xl text-center print:hidden">
                <Info className="w-10 h-10 text-black mx-auto mb-3" />
                <h4 className="text-black font-bold mb-2">تقييم غير مكتمل</h4>
                <p className="text-slate-600 text-sm">يجب على العميل إكمال كلا التقييمين (راي والإيرادات) لإنشاء مصفوفة توجيه القرارات.</p>
              </div>
            )}

            
            {/* Score Meanings Legend */}
            <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-xl shadow-black/5 print:shadow-none print:bg-white print:border-slate-300 print:break-inside-avoid">
              <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2 print:text-black border-r-4 border-black pr-3">
                <Info className="w-5 h-5 text-black" />
                دليل قراءة النتائج
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 print:bg-transparent print:border-slate-200">
                  <span className="block text-red-600 font-bold mb-1">أقل من 60%</span>
                  <p className="text-xs text-slate-600 print:text-slate-600"><strong>منخفض / حرج:</strong> قصور ملموس يحتاج لتدخل لإعادة الهيكلة وتأسيس الأساسيات.</p>
                </div>
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 print:bg-transparent print:border-slate-200">
                  <span className="block text-amber-600 font-bold mb-1">60% - 79%</span>
                  <p className="text-xs text-slate-600 print:text-slate-600"><strong>متوسط:</strong> أداء متوازن ومستقر مع وجود فجوات تشغيلية تتطلب التحسين المستمر.</p>
                </div>
                <div className="p-3 bg-green-500/5 rounded-xl border border-green-500/10 print:bg-transparent print:border-slate-200">
                  <span className="block text-green-600 font-bold mb-1">80% فأعلى</span>
                  <p className="text-xs text-slate-600 print:text-slate-600"><strong>مرتفع / ممتاز:</strong> أداء نموذجي وجاهزية عالية لتمكين التسارع والقيادة المطلقة بالسوق.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/10 print:border-slate-200 print:break-before-auto">
              {selectedUser.results.map((r, idx) => (
                <div key={r.id} className={`space-y-4 shadow-xl shadow-black/5 print:shadow-none bg-white p-6 rounded-2xl border border-black/10 print:bg-white print:border-slate-300 print:break-inside-avoid ${idx === 0 ? '' : 'mt-0'}`}>
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl print:bg-slate-50 print:border print:border-slate-200">
                    <h4 className="font-bold text-black border-r-4 border-black pr-3">{getTableLabel(r.tableName)}</h4>
                    <span className="font-bold text-black print:text-slate-800">{getScore(r.responses)}%</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    {Object.entries(r.responses).map(([qId, response]) => {
                      const diag = diagnostics.find(d => d.id === r.diagnostic_id);
                      const question = diag?.questions.find(q => q.id === parseInt(qId));
                      return (
                        <div key={qId} className="flex gap-3 px-1 py-3 border-b border-black/[0.05] last:border-0 print:border-slate-100 items-start justify-between">
                          <p className="text-sm text-slate-700 print:text-slate-700 font-medium leading-relaxed max-w-[80%]">{question?.textArabic || 'نص السؤال مفقود'}</p>
                          <span className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap min-w-[60px] text-center
                            ${response === 'yes' ? 'bg-green-500/10 text-green-600 print:text-green-700' : 
                              response === 'partial' ? 'bg-slate-100 text-slate-500' : 
                              'bg-red-500/10 text-red-600 print:text-red-700'}`}>
                            {response === 'yes' ? 'نعم' : response === 'partial' ? 'جزئياً' : 'لا'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );

};

const LandingPage = ({ onStart, completed, sector }: { onStart: (d: Diagnostic) => void, completed: string[], sector: 'telecom' | 'general' | 'education' | 'retail' | null, key?: string }) => {
  const filteredDiagnostics = diagnostics.filter(d => d.sector === sector);
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-block px-4 py-1.5 bg-primary-blue/5 border border-primary-blue/20 rounded-full text-primary-blue-dark text-sm font-bold tracking-wide mb-4"
        >
          RAI MODEL™
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
          اين تقف <span className="text-primary-blue">شركتك</span> اليوم؟
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          نموذج RAI هو أداة تشخيصية متقدمة تساعدك على فهم مكامن القوة والضعف في عملياتك التشغيلية ونموذج الإيراد الخاص بك.
        </p>
      </div>

      {!sector ? (
        <div className="flex justify-center pt-6 relative z-10 w-full mb-12">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/telecommunication')}
            className="bg-white border border-primary-blue/10 p-8 rounded-3xl text-center group hover:border-primary-blue/50 transition-all shadow-xl shadow-primary-blue/5 flex flex-col items-center justify-center min-w-[300px] min-h-[250px]"
          >
            <div className="w-20 h-20 bg-primary-blue/5 text-primary-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary-blue group-hover:text-white transition-all duration-300">
              <Phone size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">قطاع الاتصالات</h3>
            <p className="text-lg font-bold text-primary-blue/50 mt-2" dir="ltr">Telecommunication</p>
          </motion.button>
        </div>
      ) : (
        <div className="space-y-8 relative z-10">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="rotate-180" />
              <span>تغيير القطاع</span>
            </button>
            <div className="text-right">
              <h3 className="text-xl font-bold text-black leading-tight">
                {sector === 'telecom' ? 'قطاع الاتصالات' : sector === 'retail' ? 'قطاع التجزئة' : 'قطاع الخدمات'}
              </h3>
              <p className="text-sm font-bold text-slate-400 mt-0.5" dir="ltr">
                {sector === 'telecom' ? 'Telecommunication' : sector === 'retail' ? 'Retail' : 'Services'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredDiagnostics.map((d) => (
              <motion.button
                key={d.id}
                whileHover={!completed.includes(d.id) ? { y: -5, scale: 1.02 } : {}}
                whileTap={!completed.includes(d.id) ? { scale: 0.98 } : {}}
                onClick={() => onStart(d)}
                className={`relative overflow-hidden text-right p-8 rounded-2xl border transition-all duration-300 group
                  ${completed.includes(d.id) 
                    ? 'bg-slate-50 border-slate-200 scale-95 opacity-60 cursor-not-allowed shadow-inner' 
                    : 'bg-white border-primary-blue/10 hover:border-primary-blue/40 shadow-xl shadow-primary-blue/5'}`}
              >
                {completed.includes(d.id) && (
                  <div className="absolute top-4 left-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 
                  ${d.sector === 'telecom' ? 'bg-primary-blue/5 text-primary-blue' : 'bg-slate-200 text-slate-800'}`}>
                  {d.id.includes('rai') ? <TrendingUp size={32} /> : <BarChart3 size={32} />}
                </div>
                <div className="mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-blue transition-colors">
                    {d.titleArabic}
                  </h3>
                  <p className="text-sm font-bold text-primary-blue/40 group-hover:text-primary-blue/70 transition-colors mt-1" dir="ltr">
                    {d.titleEnglish}
                  </p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">{d.descriptionArabic}</p>
                <div className="flex items-center gap-2 text-primary-blue font-bold group-hover:gap-4 transition-all">
                  <span>{completed.includes(d.id) ? 'تم الإكمال' : 'ابدأ التقييم'}</span>
                  <ChevronRight className="rotate-180 w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 border border-primary-blue/20 rounded-2xl p-8 mt-12 text-center">
        <h4 className="text-primary-blue-dark font-bold text-xl mb-4">لماذا هذا التقييم؟</h4>
        <p className="text-slate-700 leading-relaxed max-w-3xl mx-auto">
          الإجابة الصادقة هي نقطة البداية الحقيقية لتطوير أعمالك. يساعدك هذا التقييم على تحديد المسار الأنسب لنمو شركتك بشكل مستدام من خلال تحليل دقيق يعتمد على أفضل ممارسات الحوكمة والنمو التجاري.
        </p>
      </div>
    </motion.div>
  );
};

const OnboardingForm = ({ onSubmit, onBack, initialData }: { onSubmit: (d: UserData) => void, onBack: () => void, initialData: UserData | null, key?: string }) => {
  const [formData, setFormData] = useState<UserData>(initialData || {
    fullName: '',
    phone: '',
    position: '',
    companyName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors mb-4">
        <ArrowLeft className="rotate-180 w-4 h-4" />
        <span>العودة للرئيسية</span>
      </button>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-black">بيانات التواصل</h2>
        <p className="text-slate-600">يرجى تعبئة البيانات التالية للمتابعة إلى التقييم.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6 bg-white p-8 rounded-2xl border border-primary-blue/10 relative z-10 shadow-2xl shadow-primary-blue/5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-blue" />
            الاسم الكامل
          </label>
          <input 
            required
            type="text" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-blue placeholder:text-slate-400 text-slate-900"
            placeholder="الاسم الثلاثي"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-blue" />
            رقم الهاتف
          </label>
          <input 
            required
            type="tel" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-blue placeholder:text-slate-400 text-slate-900"
            placeholder="05xxxxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary-blue" />
            المنصب الوظيفي
          </label>
          <input 
            required
            type="text" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-blue placeholder:text-slate-400 text-slate-900"
            placeholder="مثال: المدير التنفيذي"
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-blue" />
            اسم الشركة
          </label>
          <input 
            required
            type="text" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-blue placeholder:text-slate-400 text-slate-900"
            placeholder="اسم المنشأة"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
          />
        </div>

        <div className="sm:col-span-2 pt-4">
          <button 
            type="submit" 
            className="w-full bg-primary-blue hover:bg-primary-blue-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-blue/20"
          >
            بدء التقييم
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const Survey = ({ diagnostic, onSubmit, onBack, isSubmitting }: { diagnostic: Diagnostic, onSubmit: (r: Record<number, ResponseType>) => void, onBack: () => void, isSubmitting: boolean, key?: string }) => {
  const [responses, setResponses] = useState<Record<number, ResponseType>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleResponse = (questionId: number, response: ResponseType) => {
    setResponses({ ...responses, [questionId]: response });
    setShowExplanation(false);
    if (currentQuestionIndex < diagnostic.questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
    }
  };

  const currentQuestion = diagnostic.questions[currentQuestionIndex];
  const isCompleted = Object.keys(responses).length === diagnostic.questions.length;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <button onClick={onBack} disabled={isSubmitting} className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors disabled:opacity-50">
          <ArrowLeft className="rotate-180 w-4 h-4" />
          <span>الخروج</span>
        </button>
        <div className="text-black font-bold text-sm bg-black/5 px-3 py-1 rounded-full border border-black/10">
          سؤال {currentQuestionIndex + 1} من {diagnostic.questions.length}
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-900">{diagnostic.titleArabic}</h2>
        <p className="text-lg font-bold text-primary-blue-dark/40" dir="ltr">{diagnostic.titleEnglish}</p>
        <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-slate-200 mt-2 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(Object.keys(responses).length / diagnostic.questions.length) * 100}%` }}
            className="h-full bg-primary-blue rounded-full shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-primary-blue/10 rounded-3xl p-8 relative overflow-hidden min-h-[450px] flex flex-col justify-between shadow-2xl shadow-primary-blue/5">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-right space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-primary-blue/10 font-bold text-7xl font-serif select-none leading-none">#{currentQuestion.id}</span>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2
                    ${showExplanation 
                      ? 'bg-primary-blue border-primary-blue text-white' 
                      : 'bg-primary-blue/5 border-primary-blue/10 text-primary-blue hover:bg-primary-blue hover:text-white'}`}
                >
                  <Info size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
                    {showExplanation ? 'إخفاء الهدف' : 'الهدف من السؤال'}
                  </span>
                </button>
              </div>

              <h3 className="text-2xl md:text-4xl font-bold text-black leading-tight">
                {currentQuestion.textArabic}
              </h3>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-primary-blue/5 border border-primary-blue/10 p-6 rounded-2xl space-y-4 shadow-inner">
                      <div className="flex items-start gap-4">
                        <div className="w-1.5 h-full bg-primary-blue rounded-full min-h-[60px]" />
                        <div className="space-y-4">
                          <p className="text-slate-800 text-lg leading-relaxed font-bold">
                            الهدف من السؤال:
                          </p>
                          <p className="text-slate-700 text-lg leading-relaxed font-medium transition-all">
                            {currentQuestion.explanationArabic || 'سيتم إضافة الهدف التفصيلي لهذا السؤال قريباً.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { val: 'yes', label: 'نعم', color: 'hover:bg-green-50 aspect-video sm:aspect-auto', activeColor: 'bg-green-600 border-green-600 text-white shadow-green-500/20' },
                { val: 'partial', label: 'جزئياً', color: 'hover:bg-slate-100 aspect-video sm:aspect-auto', activeColor: 'bg-slate-500 border-slate-500 text-white shadow-slate-500/20' },
                { val: 'no', label: 'لا', color: 'hover:bg-red-50 aspect-video sm:aspect-auto', activeColor: 'bg-red-600 border-red-600 text-white shadow-red-500/20' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleResponse(currentQuestion.id, opt.val as ResponseType)}
                  className={`py-6 px-6 rounded-2xl border-2 transition-all font-bold text-2xl flex items-center justify-center
                    ${responses[currentQuestion.id] === opt.val 
                      ? `${opt.activeColor} scale-105 shadow-xl` 
                      : `bg-white border-slate-200 text-slate-700 ${opt.color}`}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-8 border-t border-black/5 mt-8">
          <button 
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            className="text-slate-500 hover:text-black transition-colors text-sm font-medium disabled:opacity-20"
          >
            السؤال السابق
          </button>
          <div className="flex gap-1">
            {diagnostic.questions.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentQuestionIndex ? 'w-4 bg-black' : responses[diagnostic.questions[idx].id] ? 'bg-black/40' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {isCompleted && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <button 
            disabled={isSubmitting}
            onClick={() => onSubmit(responses)}
            className="w-full bg-black hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-slate-200/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>تأكيد وإرسال الإجابات</span>
                <ChevronRight className="rotate-180 w-6 h-6" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

const ThankYou = ({ onNext, hasRemaining, sessionScores, sessionResponses, userData, currentScore, currentDiagnosticName, currentDiagnosticNameEn, sector, embedded, onContinuePresentation }: { onNext: () => void, hasRemaining: boolean, sessionScores?: {raiScore: number | null, revenueScore: number | null}, sessionResponses?: Record<string, Record<number, ResponseType>>, userData?: UserData | null, currentScore?: number | null, currentDiagnosticName?: string, currentDiagnosticNameEn?: string, sector: 'telecom' | 'general' | 'education' | 'retail' | null, embedded?: boolean, onContinuePresentation?: () => void, key?: string }) => {
  const inEmbed =
    Boolean(embedded) ||
    new URLSearchParams(window.location.search).get('embed') === '1' ||
    (typeof window !== 'undefined' && window.parent !== window);

  const handlePrint = () => {
    window.print();
  };

  return (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center space-y-8 bg-white p-12 rounded-3xl border border-primary-blue/10 shadow-2xl relative z-10 print:transform-none print:shadow-none print:border-none print:p-0"
  >
    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 print:hidden">
      <CheckCircle2 size={48} />
    </div>
    <div className="space-y-4 print:hidden">
      <h2 className="text-4xl font-bold text-slate-900">شكراً جزيلاً!</h2>
      <p className="text-xl text-slate-600 max-w-md mx-auto leading-relaxed">
        تم استلام تقييمك بنجاح. لقد قمت بخطوة هامة نحو فهم أفضل لمستقبل شركتك.
      </p>
    </div>

    {hasRemaining ? (
      <div className="pt-8 space-y-6">
        {currentScore !== null && currentScore !== undefined && (
          <div className="bg-primary-blue/5 border border-primary-blue/10 p-6 rounded-2xl inline-block mb-8 w-full max-w-sm mx-auto shadow-sm">
            <p className="text-sm text-primary-blue font-bold uppercase tracking-widest mb-1 text-center">نتيجة {currentDiagnosticName || 'التقييم'}</p>
            <p className="text-sm text-primary-blue/40 font-bold mb-3 text-center" dir="ltr">{currentDiagnosticNameEn}</p>
            <p className="text-6xl font-black text-primary-blue-dark text-center">{currentScore}%</p>
            <p className="text-[10px] text-primary-blue/30 mt-2 text-center">Revenue Readiness Score™️ / RAI Score™️</p>
          </div>
        )}
        <div className="bg-accent-orange/5 border border-accent-orange/10 p-6 rounded-2xl">
          <p className="text-accent-orange font-bold mb-2">هل تعلم؟</p>
          <p className="text-slate-700 text-sm">إكمال التقييم الآخر يساعدنا على تقديم تحليل أكثر دقة وشمولية للحالة الراهنة لأعمالك والحصول على بوابة القرار ومصفوفة تحديد التوجه.</p>
        </div>
        <button 
          onClick={onNext}
          className="w-full bg-primary-blue hover:bg-primary-blue-dark text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-primary-blue/20"
        >
          <span>المتابعة للتقييم المتبقي</span>
          <ChevronRight className="rotate-180" />
        </button>
      </div>
    ) : (
      <div className="pt-8 space-y-6 text-right" dir="rtl">
        
        {/* PRINT HEADER - ONLY VISIBLE ON PRINT */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-6 mb-8 mt-4 whitespace-nowrap">
          <div>
            <h1 className="text-3xl font-black text-black">التقرير الشامل للحالة الراهنة</h1>
            <p className="text-slate-500 mt-1 font-mono text-sm">{new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          {tpdLogo && (
            <img src={tpdLogo} alt="Company Logo" className="h-16 object-contain" />
          )}
        </div>

        {/* PRINT ONLY - USER INFO */}
        {userData && (
          <div className="hidden print:grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div>
              <p className="text-sm text-slate-500 mb-1">الشركة</p>
              <p className="font-bold">{userData.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">المسؤول</p>
              <p className="font-bold">{userData.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">المنصب</p>
              <p className="font-bold">{userData.position}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">رقم الهاتف</p>
              <p className="font-bold tracking-wider" dir="ltr">{userData.phone}</p>
            </div>
          </div>
        )}

        {sessionScores?.raiScore !== null && sessionScores?.revenueScore !== null && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8 mt-4 w-full max-w-4xl mx-auto print:mb-6">
              <div className="bg-white border border-primary-blue/10 p-6 rounded-2xl text-center print:bg-transparent print:border-slate-300">
                <p className="text-sm text-primary-blue-dark uppercase tracking-widest font-bold mb-2">النتيجة: الحوكمة التشغيلية (RAI Score™️)</p>
                <p className="text-5xl font-black text-primary-blue-dark">{sessionScores.raiScore}%</p>
              </div>
              <div className="bg-white border border-primary-blue/10 p-6 rounded-2xl text-center print:bg-transparent print:border-slate-300">
                <p className="text-sm text-primary-blue-dark uppercase tracking-widest font-bold mb-2">النتيجة: جاهزية الإيرادات (Revenue Score™️)</p>
                <p className="text-5xl font-black text-primary-blue-dark">{sessionScores.revenueScore}%</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-primary-blue/10 mb-8 w-full max-w-4xl mx-auto hidden print:block print:bg-white print:border-slate-300 print:break-inside-avoid">
              <h4 className="text-lg font-bold text-primary-blue-dark mb-4 flex items-center gap-2 print:text-black border-r-4 border-primary-blue pr-3">
                <Info className="w-5 h-5" />
                دليل قراءة النتائج
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 print:bg-transparent print:border-slate-200">
                  <span className="block text-rose-600 font-bold mb-1">أقل من 60%</span>
                  <p className="text-xs text-slate-600 font-medium"><strong>منخفض / حرج:</strong> قصور ملموس يحتاج لتدخل لإعادة الهيكلة وتأسيس الأساسيات.</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 print:bg-transparent print:border-slate-200">
                  <span className="block text-amber-600 font-bold mb-1">60% - 79%</span>
                  <p className="text-xs text-slate-600 font-medium"><strong>متوسط:</strong> أداء متوازن ومستقر مع وجود فجوات تشغيلية تتطلب التحسين المستمر.</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 print:bg-transparent print:border-slate-200">
                  <span className="block text-emerald-600 font-bold mb-1">80% فأعلى</span>
                  <p className="text-xs text-slate-600 font-medium"><strong>مرتفع / ممتاز:</strong> أداء نموذجي وجاهزية عالية لتمكين التسارع والقيادة المطلقة بالسوق.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary-blue/10 bg-white p-6 shadow-sm mb-8 w-full max-w-4xl mx-auto print:shadow-none print:bg-transparent print:border-none print:p-0 print:break-inside-avoid">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">بوابة القرار</h3>
              <div className="flex justify-center -mr-12 md:-mr-6 scale-90 md:scale-100 print:transform-none print:m-0 origin-center">
                <DecisionGateMatrix rai={sessionScores.raiScore} revenue={sessionScores.revenueScore} sector={sector} />
              </div>
              <div className={`mt-8 p-6 rounded-2xl border print:border-slate-300 print:bg-transparent ${getCompanySituation(sessionScores.raiScore, sessionScores.revenueScore, sector).bg} ${getCompanySituation(sessionScores.raiScore, sessionScores.revenueScore, sector).border}`}>
                <h4 className={`text-lg font-bold mb-2 print:text-black ${getCompanySituation(sessionScores.raiScore, sessionScores.revenueScore, sector).color}`}>
                  أين تقف الآن: {getCompanySituation(sessionScores.raiScore, sessionScores.revenueScore, sector).title}
                </h4>
                <p className="text-slate-700 print:text-slate-700 leading-relaxed text-sm">
                  {getCompanySituation(sessionScores.raiScore, sessionScores.revenueScore, sector).desc}
                </p>
              </div>
            </div>
          </>
        )}

        {/* PRINT ONLY - FULL QUESTIONS AND ANSWERS */}
        {sessionResponses && (
          <div className="hidden print:block mt-12 print:mt-0 print:break-before-auto space-y-8">
            <h3 className="text-2xl font-bold text-primary-blue-dark mb-6 border-b-2 border-primary-blue/10 pb-2">تفاصيل الإجابات</h3>
            {Object.entries(sessionResponses).map(([diagnosticId, responses]) => {
              const diag = diagnostics.find(d => d.id === diagnosticId);
              if (!diag) return null;
              return (
                <div key={diagnosticId} className="space-y-6">
                  <div className="bg-primary-blue/5 p-4 rounded-lg border border-primary-blue/10 mb-6">
                    <h4 className="text-xl font-bold text-primary-blue-dark">{diag.titleArabic}</h4>
                    <p className="text-sm font-bold text-primary-blue mt-1" dir="ltr">{diag.titleEnglish}</p>
                  </div>
                  <div className="space-y-4">
                    {diag.questions.map(q => {
                      const answer = responses[q.id];
                      return (
                        <div key={q.id} className="border-b border-slate-100 pb-4 break-inside-avoid">
                          <p className="font-bold text-slate-900 text-sm mb-2">{q.textArabic}</p>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              answer === 'yes' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                              answer === 'no' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                              answer === 'partial' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                              {answer === 'yes' ? 'نعم (مطبق وموثق)' :
                               answer === 'no' ? 'لا (غير موجود)' :
                               answer === 'partial' ? 'جزئياً (موجود وغير مكتمل)' : 'غير مجاب'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 print:hidden">
          {inEmbed && !hasRemaining && onContinuePresentation && (
            <button
              type="button"
              onClick={onContinuePresentation}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white bg-accent-orange hover:bg-accent-orange/90 transition-all px-8 py-4 rounded-xl shadow-lg font-bold"
            >
              <span>متابعة العرض التقديمي</span>
              <ChevronRight className="rotate-180" />
            </button>
          )}
          {!inEmbed && (
            <>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 text-white bg-primary-blue hover:bg-primary-blue-dark transition-all px-8 py-4 rounded-xl shadow-lg shadow-primary-blue/20 font-bold"
              >
                <Printer size={18} />
                <span>تحميل التقرير (PDF)</span>
              </button>
              <button 
                onClick={onNext}
                className="text-slate-600 hover:text-primary-blue transition-colors px-8 py-4 rounded-xl border border-primary-blue/10 font-bold"
              >
                العودة للرئيسية
              </button>
            </>
          )}
        </div>
      </div>
    )}
  </motion.div>
  );
};
