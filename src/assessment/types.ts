export type TrackSituationId =
  | 'foundation'
  | 'acceleration'
  | 'revenue_activation'
  | 'governance_activation';

export interface AssessmentSessionResult {
  raiScore: number;
  revenueScore: number;
  trackId: TrackSituationId;
  trackTitle: string;
  trackDescription: string;
  companyName?: string;
  fullName?: string;
}

export const ASSESSMENT_STORAGE_KEY = 'tpd_presentation_assessment';

/** Maps assessment decision-gate track to slide5 track card index */
export function trackIdToSlideIndex(trackId: TrackSituationId): number {
  switch (trackId) {
    case 'foundation':
      return 0;
    case 'acceleration':
      return 1;
    case 'revenue_activation':
    case 'governance_activation':
      return 2;
    default:
      return 2;
  }
}
