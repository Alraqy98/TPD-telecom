declare module '@tpd-assessment/App' {
  import type { ReactNode } from 'react';

  export type AssessmentSessionPayload = {
    raiScore: number;
    revenueScore: number;
    trackId: string;
    trackTitle: string;
    trackDescription: string;
    companyName?: string;
    fullName?: string;
  };

  export type AssessmentAppProps = {
    initialSector: 'telecom' | 'general' | 'education' | 'retail' | null;
    workshopId?: string;
    embedded?: boolean;
    apiBaseUrl?: string;
    onSessionComplete?: (payload: AssessmentSessionPayload) => void;
  };

  export function AssessmentApp(props: AssessmentAppProps): ReactNode;
}

declare module '@tpd-assessment/index.css';
