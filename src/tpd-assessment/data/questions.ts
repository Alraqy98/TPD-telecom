import { Diagnostic } from '../types';

export const diagnostics: Diagnostic[] = [
  {
    id: 'rai-diagnostic',
    sector: 'telecom',
    titleArabic: 'جاهزية التشغيل',
    titleEnglish: 'Operational Readiness™️',
    descriptionArabic: 'تقييم كفاءة العمليات التشغيلية والهيكل التنظيمي للشركة.',
    descriptionEnglish: 'Assess the efficiency of operational processes and the organizational structure of the company.',
    questions: [
      { id: 1, textArabic: 'هل لدى الشركة أهداف سنوية وشهرية موزعة فعلياً على الإدارات؟', textEnglish: 'Does the company have annual and monthly goals actually distributed to departments?', explanationArabic: 'الهدف: قياس مدى وضوح الرؤية والمستهدفات لكل قسم، بحيث يعرف كل موظف ما هو المطلوب منه لتحقيق رؤية الشركة.', explanationEnglish: 'Goal: Measure the clarity of the vision and targets for each department, so every employee knows what is required to achieve the company vision.' },
      { id: 2, textArabic: 'هل يتم متابعة الأهداف بتقارير واضحة ومنتظمة؟', textEnglish: 'Are goals monitored with clear and regular reports?', explanationArabic: 'الهدف: التحقق من وجود آليات متابعة حقيقية واجتماعات دورية لمراجعة الإنجاز مقابل المستهدفات وضمان دقة التقارير.', explanationEnglish: 'Goal: Verify the existence of real monitoring mechanisms and periodic meetings to review achievements against targets and ensure report accuracy.' },
      { id: 3, textArabic: 'هل يوجد هيكل تنظيمي واضح ومطبق فعلياً؟', textEnglish: 'Is there a clear and actually implemented organizational structure?', explanationArabic: 'الهدف: التأكد من تحديد خطوط السلطة والمسؤولية بوضوح بحيث يعرف كل موظف مِديره المباشر ونطاق عمله.', explanationEnglish: 'Goal: Ensure lines of authority and responsibility are clearly defined so every employee knows their direct supervisor and scope of work.' },
      { id: 4, textArabic: 'هل توجد مصفوفة صلاحيات واضحة ومطبقة؟', textEnglish: 'Is there a clear and implemented authority matrix?', explanationArabic: 'الهدف: التحقق من وجود نظام يحدد حقوق التوقيع والاعتمادات المالية لتجنب المركزية المفرطة أو تداخل الصلاحيات.', explanationEnglish: 'Goal: Verify the existence of a system that defines signing rights and financial approvals to avoid excessive centralization or overlapping authorities.' },
      { id: 5, textArabic: 'هل تصل تقارير شهرية تشمل المبيعات والتدفق النقدي والأرباح؟', textEnglish: 'Are monthly reports received including sales, cash flow, and profits?', explanationArabic: 'الهدف: ضمان توفر لوحة قيادة مالية وتشغيلية دقيقة وتلقائية تساعد الإدارة على اتخاذ قرارات سريعة ومبنية على الواقع.', explanationEnglish: 'Goal: Ensure the availability of an accurate and automatic financial and operational dashboard that helps management make quick, fact-based decisions.' },
      { id: 6, textArabic: 'هل يوجد ربط فعلي بين المبيعات والتشغيل والمالية؟', textEnglish: 'Is there an actual link between sales, operations, and finance?', explanationArabic: 'الهدف: قياس مستوى التنسيق الداخلي لضمان استعداد قسم التشغيل للمبيعات المتوقعة وعلم المالية بالتدفقات النقدية.', explanationEnglish: 'Goal: Measure the level of internal coordination to ensure the operations department is prepared for expected sales and finance is aware of cash flows.' },
      { id: 7, textArabic: 'هل السياسات والإجراءات تُستخدم فعلياً في العمل اليومي؟', textEnglish: 'Are policies and procedures actually used in daily work?', explanationArabic: 'الهدف: التأكد من أن السياسات هي المرجع الحي والفعلي عند تنفيذ العمليات الروتينية أو مواجهة التحديات التشغيلية.', explanationEnglish: 'Goal: Ensure that policies are the living and actual reference when executing routine operations or facing operational challenges.' },
      { id: 8, textArabic: 'هل المسؤوليات واضحة وغير متداخلة بين الإدارات؟', textEnglish: 'Are responsibilities clear and not overlapping between departments?', explanationArabic: 'الهدف: منع تعارض المهام أو ضياع المسؤوليات بين الأقسام لضمان سلاسة سير العمل التشغيلي.', explanationEnglish: 'Goal: Prevent conflict of tasks or loss of responsibilities between departments to ensure smooth operational workflow.' },
      { id: 9, textArabic: 'هل القرارات تُتخذ بناءً على بيانات واضحة؟', textEnglish: 'Are decisions made based on clear data?', explanationArabic: 'الهدف: التحقق من نضج عملية اتخاذ القرار والاعتماد على الأرقام والحقائق بدلاً من الحدس الشخصي فقط.', explanationEnglish: 'Goal: Verify the maturity of the decision-making process and reliance on numbers and facts instead of just personal intuition.' },
      { id: 10, textArabic: 'هل يتم تقييم الأداء بشكل دوري بناءً على مؤشرات واضحة؟', textEnglish: 'Is performance periodically evaluated based on clear indicators?', explanationArabic: 'الهدف: التحقق من وجود نظام KPIs فعال يقيس إنتاجية الموظفين والأقسام بشكل عادل وموضوعي.', explanationEnglish: 'Goal: Verify the existence of an effective KPIs system that measures the productivity of employees and departments fairly and objectively.' },
    ]
  },
  {
    id: 'revenue-diagnostic',
    sector: 'telecom',
    titleArabic: 'جاهزية الإيرادات',
    titleEnglish: 'Telecom Commercial Readiness Assessment™️',
    descriptionArabic: 'تقييم الجاهزية التجارية وقدرة الشركة على النمو وتحويل الإيرادات بشكل مستدام.',
    descriptionEnglish: 'Assess commercial readiness and the ability to grow and convert revenue sustainably.',
    questions: [
      { 
        id: 1, 
        textArabic: 'هل تمتلك الإدارة رؤية واضحة ومحدثة لأداء الـ Sales Funnel عبر جميع القنوات البيعية؟', 
        textEnglish: 'Does management have a clear and updated view of the Sales Funnel performance across all sales channels?', 
        explanationArabic: 'الهدف: قياس مستوى الـ Funnel Visibility واكتشاف احتمالية وجود تسرب غير مرئي داخل دورة البيع.', 
        explanationEnglish: 'Goal: Measure Funnel Visibility and discover potential invisible leakage within the sales cycle.' 
      },
      { 
        id: 2, 
        textArabic: 'هل يتم قياس وتحليل معدلات الـ Churn (هروب العملاء) بشكل دوري مع وجود فهم واضح لأسباب فقدان العملاء؟', 
        textEnglish: 'Are Churn rates measured and analyzed periodically with a clear understanding of the reasons for customer loss?', 
        explanationArabic: 'الهدف: قياس جاهزية الشركة لإدارة الاحتفاظ بالعملاء وتقليل Revenue Leakage.', 
        explanationEnglish: 'Goal: Measure the company\'s readiness to manage customer retention and reduce Revenue Leakage.' 
      },
      { 
        id: 3, 
        textArabic: 'هل تمتلك الشركة آلية واضحة لقياس أداء قنوات الاكتساب المختلفة (Acquisition)؟ (Retail, Telesales, Digital, Partners, Kiosks)', 
        textEnglish: 'Does the company have a clear mechanism for measuring the performance of different acquisition channels? (Retail, Telesales, Digital, Partners, Kiosks)', 
        explanationArabic: 'الهدف: قياس مستوى الـ Acquisition Efficiency ووضوح أداء القنوات البيعية.', 
        explanationEnglish: 'Goal: Measure Acquisition Efficiency and clarity of sales channel performance.' 
      },
      { 
        id: 4, 
        textArabic: 'هل توجد مؤشرات واضحة لقياس التحويل بين مراحل رحلة العميل؟ (Lead → Interested → Proposal → Activation)', 
        textEnglish: 'Are there clear indicators to measure conversion between stages of the customer journey? (Lead → Interested → Proposal → Activation)', 
        explanationArabic: 'الهدف: قياس مستوى الـ Conversion Visibility واكتشاف احتمالية وجود Funnel Leakage.', 
        explanationEnglish: 'Goal: Measure Conversion Visibility and discover potential Funnel Leakage.' 
      },
      { 
        id: 5, 
        textArabic: 'هل تمتلك الإدارة رؤية واضحة حول أثر الخصومات والعروض على الربحية والاستدامة التجارية؟', 
        textEnglish: 'Does management have a clear view on the impact of discounts and offers on profitability and commercial sustainability?', 
        explanationArabic: 'الهدف: قياس مستوى الـ Pricing Governance والاعتماد على العروض لتحفيز المبيعات.', 
        explanationEnglish: 'Goal: Measure Pricing Governance and reliance on offers to stimulate sales.' 
      },
      { 
        id: 6, 
        textArabic: 'هل يتم استخدام CRM أو أنظمة متابعة العملاء بشكل فعّال لدعم القرارات التجارية وتحسين التحويل؟', 
        textEnglish: 'Are CRM or customer tracking systems used effectively to support commercial decisions and improve conversion?', 
        explanationArabic: 'الهدف: قياس مستوى Commercial Visibility وإدارة الفرص البيعية.', 
        explanationEnglish: 'Goal: Measure Commercial Visibility and sales opportunity management.' 
      },
      { 
        id: 7, 
        textArabic: 'هل يمتلك فريق المبيعات فهمًا واضحًا للـ Value Proposition مقارنة بالمنافسين الرئيسيين؟', 
        textEnglish: 'Does the sales team have a clear understanding of the Value Proposition compared to key competitors?', 
        explanationArabic: 'الهدف: قياس readiness للبيع القائم على القيمة بدل المنافسة السعرية فقط.', 
        explanationEnglish: 'Goal: Measure readiness for value-based selling instead of just price competition.' 
      },
      { 
        id: 8, 
        textArabic: 'هل توجد مراجعات دورية لمؤشرات الأداء التجارية مثل: ARPU، CAC، Conversion، Churn، Activation Rate؟', 
        textEnglish: 'Are there periodic reviews of commercial performance indicators such as: ARPU, CAC, Conversion, Churn, Activation Rate?', 
        explanationArabic: 'الهدف: قياس مستوى Commercial Performance Governance.', 
        explanationEnglish: 'Goal: Measure Commercial Performance Governance level.' 
      },
      { 
        id: 9, 
        textArabic: 'هل تمتلك الشركة خطة واضحة لتحسين Customer Retention ورفع Customer Lifetime Value؟', 
        textEnglish: 'Does the company have a clear plan to improve Customer Retention and raise Customer Lifetime Value?', 
        explanationArabic: 'الهدف: قياس maturity إدارة النمو المستدام وليس فقط اكتساب العملاء.', 
        explanationEnglish: 'Goal: Measure the maturity of sustainable growth management, not just customer acquisition.' 
      },
      { 
        id: 10, 
        textArabic: 'هل تمتلك الإدارة رؤية واضحة حول مناطق Revenue Leakage أو الفرص التجارية غير المستغلة داخل المنظومة الحالية؟', 
        textEnglish: 'Does management have a clear view of Revenue Leakage areas or unexploited commercial opportunities within the current system?', 
        explanationArabic: 'الهدف: قياس مستوى الوعي التنفيذي بالفجوات التجارية المحتملة قبل الـ Deep Dive.', 
        explanationEnglish: 'Goal: Measure the level of executive awareness of potential commercial gaps before the Deep Dive.' 
      }
    ]
  }
];
