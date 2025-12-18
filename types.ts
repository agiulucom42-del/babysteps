
export interface DiaryEntry {
  id: string;
  date: string; // ISO String
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  tags?: string[];
  category?: 'memory' | 'feeding' | 'sleep' | 'diaper' | 'tooth';
  details?: {
    subType?: string; // e.g., 'breast', 'bottle', 'wet', 'dirty'
    amount?: string; // e.g., '120ml', '20dk'
    stoolColor?: string; // yellow, green, brown, black, red, white
    stoolConsistency?: string; // liquid, soft, hard, mucus
    side?: 'left' | 'right' | 'both';
    toothId?: string; // e.g. 'ul1' (Upper Left 1)
  };
}

export interface GrowthRecord {
  id: string;
  date: string;
  weight: number; // kg
  height: number; // cm
  headCircumference?: number; // cm
  percentileWeight?: number; // Calculated percentile
  percentileHeight?: number; // Calculated percentile
}

export interface Vaccine {
  id: string;
  name: string;
  monthDue: number;
  completed: boolean;
  dateCompleted?: string;
  description?: string;
}

export interface Milestone {
  id: string;
  title: string;
  expectedMonth: number;
  isCompleted: boolean;
  dateCompleted?: string;
  category: 'motor' | 'social' | 'language' | 'cognitive';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO String
  type: 'doctor' | 'playdate' | 'other';
  notes?: string;
}

export interface MedicalHistoryItem {
  id: string;
  category: 'allergy' | 'condition' | 'surgery';
  title: string;
  date?: string; // Diagnosis or surgery date
  notes?: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  date: string;
  type: 'lab' | 'imaging' | 'prescription' | 'report';
  fileUrl: string; // Base64 image
  notes?: string;
}

export type ThemeColor = 'rose' | 'sky' | 'violet' | 'emerald' | 'amber' | 'indigo' | 'slate' | 'teal' | 'orange' | 'green' | 'cyan' | 'fuchsia';

export interface BabyProfile {
  name: string;
  birthDate: string;
  gender: 'boy' | 'girl';
  weightAtBirth: number;
  heightAtBirth: number;
  photoUrl?: string;
  isPremature?: boolean;
  gestationalWeeks?: number; // E.g., 34 weeks
  themeColor?: ThemeColor; // User selected theme
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export type ViewState = 'dashboard' | 'diary' | 'health' | 'growth' | 'ai-chat';

export interface ThemeProps {
  themeColor: string;
}
