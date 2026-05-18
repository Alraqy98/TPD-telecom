const THRESHOLD = 70;

function readinessLabel(score: number): string {
  if (score >= 80) return 'جاهزية مرتفعة';
  if (score >= THRESHOLD) return 'جاهزية جيدة';
  return 'جاهزية تحتاج تعزيز';
}

/** Personalized copy for the Acceleration track card after assessment */
export function getAccelerationTrackInsight(raiScore: number, revenueScore: number): string {
  const raiLabel = readinessLabel(raiScore);
  const revLabel = readinessLabel(revenueScore);

  return (
    `درجة الجاهزية التشغيلية ${raiScore}% (${raiLabel}) ونموذج الإيرادات ${revenueScore}% (${revLabel}) — كلاهما فوق عتبة ${THRESHOLD}% على المحورين. ` +
    `هذا لا يعني أن كل شيء مكتمل، بل أن الأساس التشغيلي والإيرادي موجود: أنتم في مسار التسارع — جاهزون للنمو مع اختناقات محددة يُحددها التشخيص المعمّق، ثم تُعالج تنفيذياً خلال 90 يوماً لتحويل الإمكانات إلى نتائج ملموسة.`
  );
}

export function getAccelerationTrackInsightShort(raiScore: number, revenueScore: number): string {
  return `جاهزية تشغيلية ${raiScore}% وإيرادات ${revenueScore}% — فوق عتبة ${THRESHOLD}%: مسار التسارع هو الأنسب لشركتكم اليوم.`;
}
