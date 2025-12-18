
import { Vaccine, BabyProfile, GrowthRecord, DiaryEntry, Milestone, CalendarEvent, MedicalHistoryItem, MedicalDocument, ThemeColor } from './types';

export const INITIAL_PROFILE: BabyProfile = {
  name: "Can Bebek",
  birthDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), // 3 months old mock
  gender: 'boy',
  weightAtBirth: 3.4,
  heightAtBirth: 50,
  isPremature: false,
  gestationalWeeks: 40,
  themeColor: 'sky'
};

export const THEME_COLORS: { id: ThemeColor; label: string; bgClass: string }[] = [
  { id: 'rose', label: 'Pembe', bgClass: 'bg-rose-500' },
  { id: 'sky', label: 'Mavi', bgClass: 'bg-sky-500' },
  { id: 'cyan', label: 'Cam Göbeği', bgClass: 'bg-cyan-500' },
  { id: 'violet', label: 'Mor', bgClass: 'bg-violet-500' },
  { id: 'fuchsia', label: 'Fuçya', bgClass: 'bg-fuchsia-500' },
  { id: 'emerald', label: 'Yeşil', bgClass: 'bg-emerald-500' },
  { id: 'green', label: 'Orman', bgClass: 'bg-green-600' },
  { id: 'orange', label: 'Gün Batımı', bgClass: 'bg-orange-500' },
  { id: 'amber', label: 'Kehribar', bgClass: 'bg-amber-500' },
  { id: 'indigo', label: 'İndigo', bgClass: 'bg-indigo-500' },
  { id: 'teal', label: 'Turkuaz', bgClass: 'bg-teal-500' },
  { id: 'slate', label: 'Gri', bgClass: 'bg-slate-500' },
];

export const INITIAL_VACCINES: Vaccine[] = [
  { id: 'v1', name: 'Hepatit B (1. Doz)', monthDue: 0, completed: true, dateCompleted: '2023-10-01', description: 'Doğumda uygulanır.' },
  { id: 'v2', name: 'Hepatit B (2. Doz)', monthDue: 1, completed: true, dateCompleted: '2023-11-01', description: '1. ayın sonunda.' },
  { id: 'v3', name: 'BCG (Verem)', monthDue: 2, completed: true, dateCompleted: '2023-12-01', description: '2. ayın sonunda.' },
  { id: 'v4', name: 'KPA (Zatürre 1. Doz)', monthDue: 2, completed: true, dateCompleted: '2023-12-01', description: 'Pnömokok aşısı.' },
  { id: 'v5', name: '5\'li Karma (1. Doz)', monthDue: 2, completed: true, dateCompleted: '2023-12-01', description: 'DaBT-İPA-Hib' },
  { id: 'v6', name: 'Hepatit B (3. Doz)', monthDue: 6, completed: false, description: '6. ayın sonunda.' },
  { id: 'v7', name: 'KPA (Zatürre 2. Doz)', monthDue: 4, completed: false },
  { id: 'v8', name: '5\'li Karma (2. Doz)', monthDue: 4, completed: false },
  { id: 'v9', name: 'KKK (Kızamık)', monthDue: 12, completed: false, description: '1 yaş aşısı.' },
];

export const INITIAL_GROWTH: GrowthRecord[] = [
  { id: 'g1', date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), weight: 3.4, height: 50 },
  { id: 'g2', date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), weight: 4.5, height: 55 },
  { id: 'g3', date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), weight: 5.6, height: 59 },
  { id: 'g4', date: new Date().toISOString(), weight: 6.2, height: 61 },
];

export const INITIAL_ENTRIES: DiaryEntry[] = [
  {
    id: 'e1',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    content: "Bugün ilk defa sesli güldü! Çok heyecan vericiydi.",
    mediaUrl: "https://picsum.photos/400/300",
    mediaType: 'image',
    tags: ['Gülümseme', 'İlkler']
  },
  {
    id: 'e2',
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    content: "Banyo yaparken biraz ağladı ama sonra sakinleşti.",
    mediaUrl: "https://picsum.photos/400/301",
    mediaType: 'image',
    tags: ['Banyo']
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  { id: 'm1', title: 'İlk Gülümseme', expectedMonth: 1, isCompleted: true, dateCompleted: new Date().toISOString(), category: 'social' },
  { id: 'm2', title: 'Başını Dik Tutma', expectedMonth: 2, isCompleted: true, dateCompleted: new Date().toISOString(), category: 'motor' },
  { id: 'm3', title: 'Ellerini Keşfetme', expectedMonth: 3, isCompleted: false, category: 'motor' },
  { id: 'm4', title: 'Sesli Gülme', expectedMonth: 3, isCompleted: false, category: 'social' },
  { id: 'm5', title: 'Dönme (Sırttan Karna)', expectedMonth: 4, isCompleted: false, category: 'motor' },
  { id: 'm6', title: 'Destekli Oturma', expectedMonth: 5, isCompleted: false, category: 'motor' },
  { id: 'm7', title: 'Katı Gıda Tadımı', expectedMonth: 6, isCompleted: false, category: 'motor' },
  { id: 'm8', title: 'Emekleme', expectedMonth: 8, isCompleted: false, category: 'motor' },
  { id: 'm9', title: 'İlk Kelime', expectedMonth: 9, isCompleted: false, category: 'language' },
  { id: 'm10', title: 'Ayakta Durma', expectedMonth: 10, isCompleted: false, category: 'motor' },
  { id: 'm11', title: 'İlk Adımlar', expectedMonth: 12, isCompleted: false, category: 'motor' },
  { id: 'm12', title: 'Desteksiz Yürüme', expectedMonth: 15, isCompleted: false, category: 'motor' },
  { id: 'm13', title: '2 Kelimeli Cümle', expectedMonth: 18, isCompleted: false, category: 'language' },
  { id: 'm14', title: 'Koşma', expectedMonth: 18, isCompleted: false, category: 'motor' },
];

export const INITIAL_EVENTS: CalendarEvent[] = [];

export const INITIAL_MEDICAL_HISTORY: MedicalHistoryItem[] = [];

export const INITIAL_DOCUMENTS: MedicalDocument[] = [];

// Simplified WHO Growth Standards (0-24 months)
// Format: [Month]: { boy: { w: [3%, 50%, 97%], h: [3%, 50%, 97%] }, girl: { ... } }
export const WHO_STANDARDS: Record<number, { 
    boy: { w: number[], h: number[] }, 
    girl: { w: number[], h: number[] } 
}> = {
    0: { boy: { w: [2.5, 3.3, 4.4], h: [46.1, 49.9, 53.7] }, girl: { w: [2.4, 3.2, 4.2], h: [45.4, 49.1, 52.9] } },
    1: { boy: { w: [3.4, 4.5, 5.8], h: [50.8, 54.7, 58.6] }, girl: { w: [3.2, 4.2, 5.5], h: [49.8, 53.7, 57.6] } },
    2: { boy: { w: [4.3, 5.6, 7.1], h: [54.4, 58.4, 62.4] }, girl: { w: [3.9, 5.1, 6.6], h: [53.0, 57.1, 61.1] } },
    3: { boy: { w: [5.0, 6.4, 8.0], h: [57.3, 61.4, 65.5] }, girl: { w: [4.5, 5.8, 7.5], h: [55.6, 59.8, 64.0] } },
    4: { boy: { w: [5.6, 7.0, 8.7], h: [59.7, 63.9, 68.0] }, girl: { w: [5.0, 6.4, 8.2], h: [57.8, 62.1, 66.4] } },
    5: { boy: { w: [6.0, 7.5, 9.3], h: [61.7, 65.9, 70.1] }, girl: { w: [5.4, 6.9, 8.8], h: [59.6, 64.0, 68.5] } },
    6: { boy: { w: [6.4, 7.9, 9.8], h: [63.3, 67.6, 71.9] }, girl: { w: [5.7, 7.3, 9.3], h: [61.2, 65.7, 70.3] } },
    7: { boy: { w: [6.7, 8.3, 10.3], h: [64.8, 69.2, 73.5] }, girl: { w: [6.0, 7.6, 9.8], h: [62.7, 67.3, 71.9] } },
    8: { boy: { w: [6.9, 8.6, 10.7], h: [66.2, 70.6, 75.0] }, girl: { w: [6.3, 7.9, 10.2], h: [64.0, 68.7, 73.5] } },
    9: { boy: { w: [7.1, 8.9, 11.0], h: [67.5, 72.0, 76.5] }, girl: { w: [6.5, 8.2, 10.5], h: [65.3, 70.1, 75.0] } },
    10: { boy: { w: [7.4, 9.2, 11.4], h: [68.7, 73.3, 77.9] }, girl: { w: [6.7, 8.5, 10.9], h: [66.5, 71.5, 76.4] } },
    11: { boy: { w: [7.6, 9.4, 11.7], h: [69.9, 74.5, 79.2] }, girl: { w: [6.9, 8.7, 11.2], h: [67.7, 72.8, 77.8] } },
    12: { boy: { w: [7.7, 9.6, 12.0], h: [71.0, 75.7, 80.5] }, girl: { w: [7.0, 8.9, 11.5], h: [68.9, 74.0, 79.2] } },
    18: { boy: { w: [8.8, 10.9, 13.7], h: [76.9, 82.3, 87.7] }, girl: { w: [8.1, 10.2, 13.2], h: [74.9, 80.7, 86.5] } },
    24: { boy: { w: [9.7, 12.2, 15.3], h: [81.0, 87.1, 93.2] }, girl: { w: [9.0, 11.5, 14.8], h: [79.3, 86.4, 92.9] } },
};
