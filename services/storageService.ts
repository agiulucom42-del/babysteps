
import { BabyProfile, DiaryEntry, GrowthRecord, Vaccine, Milestone, CalendarEvent, MedicalHistoryItem, MedicalDocument } from '../types';

// --- Environment Check ---
// This is the crucial check. If 'window' is not defined, we're not in a browser.
const isBrowser = typeof window !== 'undefined';

// --- Constants ---
const DB_NAME = 'BabyStepsDB';
const STORE_NAME = 'app_data';
const DATA_KEY = 'backup_v1';
const PIN_KEY = 'babysteps_pin';
const LAUNCH_KEY = 'babysteps_has_launched';

export interface AppData {
  profile: BabyProfile;
  entries: DiaryEntry[];
  growthRecords: GrowthRecord[];
  vaccines: Vaccine[];
  milestones: Milestone[];
  customEvents: CalendarEvent[];
  medicalHistory: MedicalHistoryItem[];
  documents: MedicalDocument[];
}

// --- Encryption Helpers ---
const encrypt = (text: string, key: string): string => {
  if (!isBrowser || !key || !text) return text;
  try {
    const uriEncoded = encodeURIComponent(text);
    let result = '';
    for (let i = 0; i < uriEncoded.length; i++) {
      result += String.fromCharCode(uriEncoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  } catch (e) {
    console.error("Encryption failed:", e);
    return "";
  }
};

const decrypt = (encryptedText: string, key: string): string => {
  if (!isBrowser || !key || !encryptedText) return encryptedText;
  try {
    const xorString = atob(encryptedText);
    let uriEncoded = '';
    for (let i = 0; i < xorString.length; i++) {
      uriEncoded += String.fromCharCode(xorString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decodeURIComponent(uriEncoded);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "";
  }
};

// --- IndexedDB Wrapper ---
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Guard clause: If not in a browser or indexedDB is not supported, reject immediately.
    if (!isBrowser || !('indexedDB' in window)) {
      return reject(new Error("IndexedDB not supported or not in a browser environment."));
    }

    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Service Definition ---
export const storageService = {
  hasPin: (): boolean => {
    if (!isBrowser) return false;
    return !!localStorage.getItem(PIN_KEY);
  },

  verifyPin: (inputPin: string): boolean => {
    if (!isBrowser) return false;
    const storedPin = localStorage.getItem(PIN_KEY);
    return storedPin === btoa(inputPin);
  },

  setPin: (newPin: string) => {
    if (!isBrowser) return;
    localStorage.setItem(PIN_KEY, btoa(newPin));
  },

  removePin: () => {
    if (!isBrowser) return;
    localStorage.removeItem(PIN_KEY);
  },

  isFirstLaunch: (): boolean => {
    if (!isBrowser) return false; // Default to not first launch in non-browser envs
    return !localStorage.getItem(LAUNCH_KEY);
  },

  setLaunched: () => {
    if (!isBrowser) return;
    localStorage.setItem(LAUNCH_KEY, 'true');
  },

  saveData: async (data: AppData) => {
    if (!isBrowser) return; // Do nothing if not in a browser
    try {
      const db = await openDB();
      const json = JSON.stringify(data);
      const encrypted = encrypt(json, 'babysteps_secret_key'); 
      
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(encrypted, DATA_KEY);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Storage Save Failed:", error);
    }
  },

  loadData: async (): Promise<AppData | null> => {
    if (!isBrowser) return Promise.resolve(null); // Return null immediately if not in browser
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DATA_KEY);

        request.onsuccess = () => {
          const encrypted = request.result;
          if (!encrypted) {
            return resolve(null);
          }
          const json = decrypt(encrypted, 'babysteps_secret_key');
          try {
             if (!json) throw new Error("Decryption returned empty string");
             const parsed = JSON.parse(json) as AppData;
             resolve(parsed);
          } catch(parseError) {
             console.error("JSON Parse Error or Corrupt Data:", parseError);
             resolve(null); // Resolve with null on parsing error
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Storage Load Failed:", error);
      // Explicitly return null in case of error to prevent uncaught promise rejection
      return Promise.resolve(null);
    }
  },
  
  clearData: async () => {
    if (!isBrowser) return;
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem(LAUNCH_KEY);
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
    } catch (e) {
      console.error("Failed to clear IndexedDB", e);
    }
  }
};
