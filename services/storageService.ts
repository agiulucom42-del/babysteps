
import { BabyProfile, DiaryEntry, GrowthRecord, Vaccine, Milestone, CalendarEvent, MedicalHistoryItem, MedicalDocument } from '../types';

const DB_NAME = 'BabyStepsDB';
const STORE_NAME = 'app_data';
const DATA_KEY = 'backup_v1';
const PIN_KEY = 'babysteps_pin'; // Keep PIN in localStorage for fast synchronous access
const LAUNCH_KEY = 'babysteps_has_launched'; // To track onboarding status

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

// --- Encryption Helpers for Unicode Support ---

// Safely encrypts unicode strings (like Turkish characters) by encoding to URI format first
const encrypt = (text: string, key: string): string => {
  if (!key || !text) return text;
  try {
    // 1. Convert Unicode to ASCII-safe URI format
    const uriEncoded = encodeURIComponent(text); 
    
    // 2. XOR encryption
    let result = '';
    for (let i = 0; i < uriEncoded.length; i++) {
      result += String.fromCharCode(uriEncoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    // 3. Base64 encode (safe because XOR of ASCII is within Latin1 range)
    return btoa(result);
  } catch (e) {
    console.error("Encryption failed:", e);
    return "";
  }
};

const decrypt = (encryptedText: string, key: string): string => {
  if (!key || !encryptedText) return encryptedText;
  try {
    // 1. Base64 decode
    const xorString = atob(encryptedText);
    
    // 2. XOR decryption
    let uriEncoded = '';
    for (let i = 0; i < xorString.length; i++) {
      uriEncoded += String.fromCharCode(xorString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    // 3. Decode URI component back to Unicode
    return decodeURIComponent(uriEncoded);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "";
  }
};

// --- IndexedDB Wrapper ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Timeout defense for headless environments
    const timeout = setTimeout(() => {
      reject(new Error("IndexedDB opening timed out"));
    }, 5000);

    if (!('indexedDB' in window)) {
        clearTimeout(timeout);
        reject(new Error("IndexedDB not supported"));
        return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      resolve(request.result);
    };
    request.onerror = () => {
      clearTimeout(timeout);
      reject(request.error);
    };
  });
};

export const storageService = {
  // PIN operations stay in localStorage for synchronous/blocking check at startup
  hasPin: (): boolean => {
    return !!localStorage.getItem(PIN_KEY);
  },

  verifyPin: (inputPin: string): boolean => {
    const storedPin = localStorage.getItem(PIN_KEY);
    return storedPin === btoa(inputPin);
  },

  setPin: (newPin: string) => {
    localStorage.setItem(PIN_KEY, btoa(newPin));
  },

  removePin: () => {
    localStorage.removeItem(PIN_KEY);
  },

  // Onboarding Logic
  isFirstLaunch: (): boolean => {
    return !localStorage.getItem(LAUNCH_KEY);
  },

  setLaunched: () => {
    localStorage.setItem(LAUNCH_KEY, 'true');
  },

  // Data operations use IndexedDB (Async)
  saveData: async (data: AppData) => {
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
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DATA_KEY);

        request.onsuccess = () => {
          const encrypted = request.result;
          if (!encrypted) {
            resolve(null);
            return;
          }
          const json = decrypt(encrypted, 'babysteps_secret_key');
          try {
             if (!json) throw new Error("Decryption returned empty string");
             const parsed = JSON.parse(json) as AppData;
             resolve(parsed);
          } catch(parseError) {
             console.error("JSON Parse Error or Corrupt Data:", parseError);
             resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Storage Load Failed:", error);
      return null;
    }
  },
  
  clearData: async () => {
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
