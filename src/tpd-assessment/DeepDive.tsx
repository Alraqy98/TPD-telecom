import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GroupedUser } from './types';
import { ArrowLeft, Target, Calculator, CheckCircle2, Factory, Package, Activity, ArrowRight, Save, LayoutDashboard, Loader2 } from 'lucide-react';

const opGovQuestions = [
  {
    title: 'الهيكل التنظيمي',
    questions: [
      'هل يوجد هيكل تنظيمي معتمد ومحدث؟',
      'هل جميع الفروع لديها مدير مسؤول واضح؟',
      'هل الأدوار والمسؤوليات محددة لكل وظيفة؟',
      'هل يوجد فصل واضح بين المهام؟',
      'هل يتم الالتزام بالهيكل فعليًا؟'
    ]
  },
  {
    title: 'مصفوفة الصلاحيات (DOA)',
    questions: [
      'هل توجد مصفوفة صلاحيات واضحة؟',
      'هل صلاحيات التسعير محددة؟',
      'هل صلاحيات الخصومات واضحة؟',
      'هل الفروع لديها صلاحيات تشغيلية؟',
      'هل يتم اتخاذ القرارات ضمن إطار واضح؟'
    ]
  },
  {
    title: 'الرقابة والتقارير',
    questions: [
      'هل يوجد تقرير مبيعات يومي؟',
      'هل تتم متابعة الأداء بشكل دوري؟',
      'هل توجد تقارير مالية أساسية؟',
      'هل يتم استخدام التقارير في اتخاذ القرار؟',
      'هل الإدارة لديها رؤية فورية للأداء؟'
    ]
  },
  {
    title: 'السياسات والإجراءات + KPIs',
    questions: [
      'هل توجد سياسات وإجراءات مكتوبة؟',
      'هل يوجد وصف وظيفي لكل وظيفة؟',
      'هل توجد مؤشرات أداء واضحة؟',
      'هل يتم قياس الأداء؟',
      'هل يوجد ربط بين الأداء والحوافز؟'
    ]
  }
];

const revEffQuestions = [
  {
    title: 'التحويل (Conversion)',
    key: 'conversion',
    questions: [
      'هل يتم قياس عدد الزوار (Footfall) لكل فرع؟',
      'هل يتم قياس نسبة التحويل (زوار ← مشترين)؟',
      'هل يتم تحليل الفروقات في التحويل بين الفروع؟',
      'هل يوجد تدريب منهجي للموظفين على مهارات البيع والإقفال؟'
    ]
  },
  {
    title: 'متوسط السلة (Basket Size)',
    key: 'basket',
    questions: [
      'هل يتم قياس متوسط قيمة الفاتورة بشكل دوري؟',
      'هل يتم تطبيق أساليب البيع الإضافي (Upselling)؟',
      'هل توجد باكجات (Bundles) أو عروض مجمعة جاهزة؟',
      'هل يتم اقتراح منتجات مكملة (Cross-selling) للعميل؟'
    ]
  },
  {
    title: 'تشكيلة المنتجات (Product Mix)',
    key: 'product_mix',
    questions: [
      'هل يتم تحليل أفضل المنتجات مبيعًا بشكل دوري؟',
      'هل يتم توجيه البيع نحو منتجات أو فئات محددة؟',
      'هل يوجد توازن في توزيع المبيعات بين الفئات؟',
      'هل يتم التعامل مع المنتجات الراكدة بشكل منهجي؟'
    ]
  },
  {
    title: 'كفاءة المخزون (Inventory Efficiency)',
    key: 'inventory',
    questions: [
      'هل يتم قياس معدل دوران المخزون بشكل دوري؟',
      'هل يوجد تقرير واضح للمنتجات الراكدة (Dead Stock)؟',
      'هل يتم توزيع المخزون بين الفروع بناءً على الأداء؟',
      'هل يتم ربط قرارات الشراء بالمبيعات الفعلية؟'
    ]
  },
  {
    title: 'تنفيذ عملية البيع (Sales Execution)',
    key: 'sales_execution',
    questions: [
      'هل يوجد أسلوب بيع موحد داخل الفروع؟',
      'هل يتم متابعة أداء الموظفين في البيع بشكل دوري؟',
      'هل يوجد مستهدف مبيعات لكل فرع أو موظف؟',
      'هل يتم مراجعة وتحسين تجربة العميل داخل الفرع؟'
    ]
  }
];

export const DeepDive = ({ user, onClose }: { user: GroupedUser, onClose: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [opGovAnswers, setOpGovAnswers] = useState<Record<string, Record<number, number>>>({});
  const [revEffAnswers, setRevEffAnswers] = useState<Record<string, Record<number, number>>>({});
  
  const [valueData, setValueData] = useState({
    traffic: '',
    transactions: '',
    totalSales: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminCreds = JSON.parse(localStorage.getItem('tpd_admin_creds') || '{}');
        const auth = btoa(`${adminCreds.email}:${adminCreds.pass}`);
        const res = await fetch(`/api/admin/deepdive?phone=${encodeURIComponent(user.phone)}`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.opGovAnswers) setOpGovAnswers(data.opGovAnswers);
            if (data.revEffAnswers) setRevEffAnswers(data.revEffAnswers);
            if (data.valueData) setValueData(data.valueData);
          }
        }
      } catch (err) {
        console.error("Failed to load deep dive data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.phone]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const adminCreds = JSON.parse(localStorage.getItem('tpd_admin_creds') || '{}');
      const auth = btoa(`${adminCreds.email}:${adminCreds.pass}`);
      const payload = {
        phone: user.phone,
        opGovAnswers,
        revEffAnswers,
        valueData
      };
      
      const res = await fetch('/api/admin/deepdive', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const getSectionScore = (answers: Record<number, number>, totalQuestions: number) => {
    if (!answers || Object.keys(answers).length === 0) return 0;
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((total / (totalQuestions * 10)) * 100);
  };

  const calculateOpGovScores = () => {
    const scores = opGovQuestions.map(sec => getSectionScore(opGovAnswers[sec.title] || {}, sec.questions.length));
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { scores, avg };
  };

  const calculateRevEffScores = () => {
    const categories = ['conversion', 'basket', 'product_mix', 'inventory', 'sales_execution'];
    const scores: Record<string, number> = {};
    let total = 0;
    revEffQuestions.forEach((sec) => {
      const s = getSectionScore(revEffAnswers[sec.title] || {}, sec.questions.length);
      scores[sec.key] = s;
      total += s;
    });
    return { scores, avg: Math.round(total / revEffQuestions.length) };
  };

  const renderQuestionBlock = (title: string, questions: string[], answers: Record<string, Record<number, number>>, setAnswers: any) => {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-primary-blue-dark mb-4">{title}</h3>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const currentAnswer = answers[title]?.[idx];
            return (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-slate-200 last:border-0">
                <span className="text-slate-700 font-medium flex-1">{q}</span>
                <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm self-start md:self-auto">
                  <button 
                    onClick={() => setAnswers({...answers, [title]: {...(answers[title] || {}), [idx]: 10}})}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${currentAnswer === 10 ? 'bg-green-500 text-white' : 'hover:bg-slate-50 text-slate-600 border-l border-slate-200'}`}
                  >
                    نعم
                  </button>
                  <button 
                    onClick={() => setAnswers({...answers, [title]: {...(answers[title] || {}), [idx]: 5}})}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${currentAnswer === 5 ? 'bg-orange-500 text-white' : 'hover:bg-slate-50 text-slate-600 border-l border-slate-200'}`}
                  >
                    جزئياً
                  </button>
                  <button 
                    onClick={() => setAnswers({...answers, [title]: {...(answers[title] || {}), [idx]: 0}})}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${currentAnswer === 0 ? 'bg-red-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    لا
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const calculateValueGap = () => {
    const traffic = parseFloat(valueData.traffic) || 0;
    const transactions = parseFloat(valueData.transactions) || 0;
    const sales = parseFloat(valueData.totalSales) || 0;
    
    if (!traffic || !transactions || !sales) return null;

    const currentBasket = sales / transactions;
    const currentConversion = transactions / traffic;

    const { scores } = calculateRevEffScores();
    const convEff = scores['conversion'] || 1;
    const basketEff = scores['basket'] || 1;

    // We assume the gap acts as a multiplier. If efficiency is 80%, we have 20% room to improve.
    // e.g. New Conversion = Current Conversion * (1 + (100 - Efficiency)/100)
    const newConversion = currentConversion * (1 + (100 - (convEff || 0)) / 100);
    const newBasket = currentBasket * (1 + (100 - (basketEff || 0)) / 100);

    const expectedRevenue = traffic * newConversion * newBasket;
    const gap = expectedRevenue - sales;

    return {
      currentBasket,
      currentConversion,
      newBasket,
      newConversion,
      expectedRevenue,
      monthlyGap: gap,
      annualGap: gap * 12
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl relative min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl relative">
      <div className="flex justify-between items-start mb-8">
        <div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 rotate-180" />
            <span className="text-sm font-bold">العودة</span>
          </button>
          <h2 className="text-3xl font-black text-primary-blue-dark">Deep Dive™️ التشخيص العميق</h2>
          <p className="text-slate-500 font-medium mt-2">بالشراكة مع {user.companyName} | {user.fullName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              saveStatus === 'success' 
                ? 'bg-green-500 text-white' 
                : saveStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-primary-blue-dark text-white hover:bg-blue-800'
            }`}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>{isSaving ? 'جاري الحفظ...' : saveStatus === 'success' ? 'تم الحفظ' : saveStatus === 'error' ? 'خطأ في الحفظ' : 'حفظ التقدم'}</span>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
        {[
          { num: 1, title: 'الحوكمة التشغيلية' },
          { num: 2, title: 'كفاءة الإيرادات' },
          { num: 3, title: 'الفجوة المالية' },
        ].map(s => (
          <button 
            key={s.num}
            onClick={() => setStep(s.num as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border whitespace-nowrap transition-all ${step === s.num ? 'bg-accent-orange text-white border-accent-orange shadow-lg shadow-accent-orange/20' : step > s.num ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s.num ? 'bg-white text-accent-orange' : 'bg-slate-200 text-slate-600'}`}>
              {s.num}
            </span>
            <span className="font-bold">{s.title}</span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
            <h3 className="font-bold text-blue-900 mb-1">الهدف</h3>
            <p className="text-sm text-blue-800">يهدف هذا التقييم إلى قياس مستوى الجاهزية التشغيلية للشركة من خلال تحليل 4 أضلاع رئيسية تمثل منظومة الحوكمة التشغيلية، لتحديد الفجوات التي تؤثر على كفاءة الأداء.</p>
          </div>

          {opGovQuestions.map(sec => renderQuestionBlock(sec.title, sec.questions, opGovAnswers, setOpGovAnswers))}
          
          {Object.keys(opGovAnswers).length > 0 && (
            <div className="bg-slate-800 text-white p-6 rounded-2xl mb-8">
              <h3 className="text-xl font-bold mb-4">نتائج الحوكمة التشغيلية (RAI Score™️)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {opGovQuestions.map((sec, i) => (
                  <div key={i} className="bg-slate-700 p-4 rounded-xl text-center border border-slate-600">
                    <p className="text-xs text-slate-300 mb-2">{sec.title}</p>
                    <p className="text-3xl font-black text-amber-400">{getSectionScore(opGovAnswers[sec.title] || {}, sec.questions.length)}%</p>
                  </div>
                ))}
              </div>
              <div className="bg-accent-orange text-white p-4 rounded-xl text-center border border-orange-400">
                <p className="text-sm opacity-90 mb-1">المتوسط العام للحوكمة التشغيلية (RAI Score™️)</p>
                <p className="text-4xl font-black">{calculateOpGovScores().avg}%</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="bg-primary-blue-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors">
              المتابعة لكفاءة الإيرادات
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
            <h3 className="font-bold text-blue-900 mb-1">الهدف</h3>
            <p className="text-sm text-blue-800">تحليل كفاءة محركات الإيرادات وتحديد الفجوة بين الأداء الحالي والإمكانات المتاحة.</p>
          </div>

          {user.sector !== 'retail' ? (
            <div className="bg-slate-50 border border-slate-200 p-10 rounded-2xl text-center mb-8">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">التقييم قيد التطوير</h3>
              <p className="text-slate-500">تقييم كفاءة الإيرادات المفصل متوفر حالياً لقطاع التجزئة فقط. سيتم توفير النماذج الخاصة بالقطاعات الأخرى قريباً.</p>
            </div>
          ) : (
            <>
              {revEffQuestions.map(sec => renderQuestionBlock(sec.title, sec.questions, revEffAnswers, setRevEffAnswers))}

              {Object.keys(revEffAnswers).length > 0 && (
                <div className="bg-slate-800 text-white p-6 rounded-2xl mb-8">
                  <h3 className="text-xl font-bold mb-4">نتائج كفاءة الإيرادات (Revenue Score™️)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {revEffQuestions.map((sec, i) => (
                      <div key={i} className="bg-slate-700 p-4 rounded-xl text-center border border-slate-600">
                        <p className="text-xs text-slate-300 mb-2">{sec.key === 'conversion' ? 'التحويل' : sec.key === 'basket' ? 'السلة' : sec.key === 'product_mix' ? 'التشكيلة' : sec.key === 'inventory' ? 'المخزون' : 'التنفيذ'}</p>
                        <p className="text-3xl font-black text-emerald-400">{getSectionScore(revEffAnswers[sec.title] || {}, sec.questions.length)}%</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-accent-orange text-white p-4 rounded-xl text-center border border-orange-400">
                    <p className="text-sm opacity-90 mb-1">الكفاءة العامة للإيرادات (Revenue Score™️)</p>
                    <p className="text-4xl font-black">{calculateRevEffScores().avg}%</p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="text-slate-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors border border-slate-200">
              <ArrowRight className="w-5 h-5" />
              السابق
            </button>
            <button onClick={() => setStep(3)} className="bg-primary-blue-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors">
              المتابعة لتحليل الفجوة المالية
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-green-50 border border-green-200 p-6 rounded-2xl mb-8">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              تحليل الفجوة المالية (Value Gap™️)
            </h3>
            <p className="text-sm text-green-800">تحديد الفرق بين الإيرادات الحالية والإيرادات الممكن تحقيقها بناءً على نسبة كفاءة التشغيل.</p>
          </div>

          {user.sector !== 'retail' ? (
            <div className="bg-slate-50 border border-slate-200 p-10 rounded-2xl text-center mb-8">
              <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">التقييم غير ممكن حالياً</h3>
              <p className="text-slate-500">يعتمد تحليل الفجوة المالية على مدخلات تقييم كفاءة الإيرادات المفصل والمتاح حالياً لقطاع التجزئة فقط.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <h4 className="font-bold text-primary-blue-dark mb-2">إدخال البيانات الحالية</h4>
                
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">الزوار (Traffic) الشهري</label>
                  <input 
                    type="number" 
                    value={valueData.traffic}
                    onChange={e => setValueData({...valueData, traffic: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:border-accent-orange focus:outline-none"
                    placeholder="مثال: 10000"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">عدد العمليات (Transactions) الشهرية</label>
                  <input 
                    type="number" 
                    value={valueData.transactions}
                    onChange={e => setValueData({...valueData, transactions: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:border-accent-orange focus:outline-none"
                    placeholder="مثال: 1500"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">إجمالي المبيعات (Total Sales) الشهرية - ريال</label>
                  <input 
                    type="number" 
                    value={valueData.totalSales}
                    onChange={e => setValueData({...valueData, totalSales: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:border-accent-orange focus:outline-none"
                    placeholder="مثال: 300000"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-primary-blue-dark">المعطيات من التشخيص العميق</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl text-center">
                    <p className="text-xs text-amber-700 font-bold mb-1">كفاءة التحويل الحالية (مستخرجة)</p>
                    <p className="text-3xl font-black text-amber-600">{calculateRevEffScores().scores['conversion'] || 0}%</p>
                  </div>
                  <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl text-center">
                    <p className="text-xs text-amber-700 font-bold mb-1">كفاءة السلة الحالية (مستخرجة)</p>
                    <p className="text-3xl font-black text-amber-600">{calculateRevEffScores().scores['basket'] || 0}%</p>
                  </div>
                </div>

                {valueData.traffic && valueData.transactions && valueData.totalSales && (
                  <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700">
                    <h4 className="text-center font-bold text-slate-300 mb-6">السيناريو المستهدف (الإمكانيات غير المستغلة)</h4>
                    
                    {(() => {
                      const res = calculateValueGap();
                      if (!res) return null;
                      return (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center border-b border-slate-600 pb-4">
                            <div>
                              <p className="text-xs text-slate-400 mb-1">الحالي</p>
                              <p className="font-mono">{Math.round(res.currentConversion * 100)}% تحويل | {Math.round(res.currentBasket)}ر.س سلة</p>
                            </div>
                            <ArrowLeft className="text-slate-500" />
                            <div className="text-left">
                              <p className="text-xs text-emerald-400 mb-1">المستهدف بناءً على الفجوة</p>
                              <p className="font-mono text-emerald-400 font-bold">{Math.round(res.newConversion * 100)}% تحويل | {Math.round(res.newBasket)}ر.س سلة</p>
                            </div>
                          </div>

                          <div className="bg-slate-900 rounded-xl p-4 text-center">
                            <p className="text-sm text-slate-400 mb-1">الإيرادات المتوقعة بعد سد الفجوة (شهرياً)</p>
                            <p className="text-3xl font-black text-white">{Math.round(res.expectedRevenue).toLocaleString()} ر.س</p>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                              <p className="text-xs text-red-300 mb-1">الفجوة المالية (Value Gap) لـ شهر</p>
                              <p className="text-xl font-bold text-red-400">{Math.round(res.monthlyGap).toLocaleString()} ر.س</p>
                            </div>
                            <div className="flex-1 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                              <p className="text-xs text-white mb-1">الأثر السنوي الضائع</p>
                              <p className="text-2xl font-black text-white">{Math.round(res.annualGap).toLocaleString()} ر.س</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="text-slate-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors border border-slate-200">
              <ArrowRight className="w-5 h-5" />
              السابق
            </button>
            <button onClick={() => window.print()} className="bg-accent-orange text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
              <LayoutDashboard className="w-5 h-5" />
              طباعة استنتاج التشخيص العميق (Deep Dive)
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
