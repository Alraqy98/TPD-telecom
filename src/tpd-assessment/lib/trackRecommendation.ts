export type TrackSituationId =
  | 'foundation'
  | 'acceleration'
  | 'revenue_activation'
  | 'governance_activation';

export interface TrackSituation {
  id: TrackSituationId;
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

const colorfulClasses = {
  revenue_activation: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  acceleration: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  foundation: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  governance_activation: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export const getCompanySituation = (
  rai: number,
  rev: number,
  _sector: string | null = null
): TrackSituation => {
  const raiThreshold = 70;
  const revThreshold = 70;

  if (rai >= raiThreshold && rev < revThreshold) {
    return {
      id: 'revenue_activation',
      title: 'Revenue Activation Track™️',
      ...colorfulClasses.revenue_activation,
      desc: 'مرحلة تفعيل الإيرادات تعني أن التقييم الأولي يظهر استقراراً في البنية التشغيلية لشركتكم، لكن مع وجود فجوات في نموذج توليد الإيرادات.',
    };
  }
  if (rai >= raiThreshold && rev >= revThreshold) {
    return {
      id: 'acceleration',
      title: 'Acceleration Track™️',
      ...colorfulClasses.acceleration,
      desc: 'مرحلة التسارع تشير إلى أداء أولي إيجابي وتوازن ملحوظ بين الكفاءة التشغيلية في شركتكم ونتائج الإيرادات.',
    };
  }
  if (rai < raiThreshold && rev < revThreshold) {
    return {
      id: 'foundation',
      title: 'Foundation Track™️',
      ...colorfulClasses.foundation,
      desc: 'مرحلة التأسيس تعني أن التقييم الأولي يوضح وجود تحديات أساسية في البنية التشغيلية ونموذج الإيرادات معاً في شركتكم.',
    };
  }
  return {
    id: 'governance_activation',
    title: 'Governance Activation Track™️',
    ...colorfulClasses.governance_activation,
    desc: 'مرحلة تفعيل الحوكمة تدل على أن الإيرادات جيدة، ولكن التقييم الأولي يظهر هشاشة في البنية التشغيلية التي قد تعيق التوسع في شركتكم.',
  };
};

export interface AssessmentSessionPayload {
  raiScore: number;
  revenueScore: number;
  trackId: TrackSituationId;
  trackTitle: string;
  trackDescription: string;
  companyName?: string;
  fullName?: string;
}

export function buildSessionPayload(
  raiScore: number,
  revenueScore: number,
  sector: string | null,
  userData?: { companyName?: string; fullName?: string } | null
): AssessmentSessionPayload {
  const situation = getCompanySituation(raiScore, revenueScore, sector);
  return {
    raiScore,
    revenueScore,
    trackId: situation.id,
    trackTitle: situation.title,
    trackDescription: situation.desc,
    companyName: userData?.companyName,
    fullName: userData?.fullName,
  };
}
