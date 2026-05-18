export type ResponseType = 'yes' | 'partial' | 'no';

export interface Question {
  id: number;
  textArabic: string;
  textEnglish: string;
  explanationArabic?: string;
  explanationEnglish?: string;
}

export interface Diagnostic {
  id: string;
  sector: 'general' | 'education' | 'retail' | 'telecom';
  titleArabic: string;
  titleEnglish: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  questions: Question[];
}

export interface UserData {
  fullName: string;
  phone: string;
  position: string;
  companyName: string;
  workshopId?: string;
}

export interface GroupedUser {
  phone: string;
  fullName: string;
  companyName: string;
  position: string;
  workshopId?: string;
  createdAt: string;
  results: any[]; // Avoid circular dependency with FullSurveyResult if possible, or define it here
  raiScore: number | null;
  revenueScore: number | null;
  sector: 'general' | 'education' | 'services' | 'retail' | 'factory' | 'telecom' | null;
}

export interface SurveyResult {
  userData: UserData;
  diagnosticId: string;
  responses: Record<number, ResponseType>;
}
