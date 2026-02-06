
import type { GoogleGenAI, Content } from "@google/genai";
import { BabyProfile, ChatMessage } from "../types";

// ⚡ Performance Optimization: Dynamically import the Google AI SDK.
// The static import `import { GoogleGenAI } from "@google/genai"` causes the
// application to hang on startup if the GEMINI_API_KEY is missing or invalid.
// By moving the import inside the function that uses it, we ensure the SDK is
// only loaded when a user actually interacts with the AI assistant, preventing
// the entire app from failing to start. This improves initial load performance
// and resilience.
// We also use `import type` for the types to ensure they are available at
// compile time without triggering a runtime import.

export const askParentingAdvisor = async (history: ChatMessage[], profile: BabyProfile): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    throw new Error('GEMINI_API_KEY is not set.');
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    // Yaş hesaplama
    const birthDate = new Date(profile.birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let ageDescription = "";

    if (diffDays < 30) {
      ageDescription = `${diffDays} günlük`;
    } else {
      const months = Math.floor(diffDays / 30);
      ageDescription = `${months} aylık`;
    }

    // Prematüre ve Düzeltilmiş Yaş Bağlamı
    let prematureContext = "";
    if (profile.isPremature && profile.gestationalWeeks && profile.gestationalWeeks < 40) {
       const daysToDueDate = (40 - profile.gestationalWeeks) * 7;
       const correctedDays = diffDays - daysToDueDate;
       if (correctedDays > 0) {
          const correctedMonths = Math.floor(correctedDays / 30);
          prematureContext = `ÖNEMLİ: Bebek ${40 - profile.gestationalWeeks} hafta erken doğdu (Prematüre). Kronolojik yaşı ${ageDescription} olsa da, gelişimsel olarak düzeltilmiş yaşına (${correctedMonths} aylık) göre değerlendirme yapmalısın.`;
       }
    }
    
    // System Instruction with Context
    const systemInstruction = `
      Sen uzman, şefkatli ve yardımsever bir çocuk gelişim ve ebeveynlik asistanısın.
      
      HAKKINDA KONUŞULAN BEBEK PROFİLİ:
      - İsim: ${profile.name}
      - Cinsiyet: ${profile.gender === 'boy' ? 'Erkek' : 'Kız'}
      - Yaş: ${ageDescription}.
      ${prematureContext}
      
      GÖREVLERİN:
      1. Kullanıcının bebeğiyle ilgili sorularını cevapla.
      2. Cevap verirken bebeğin yaşını, ismini ve varsa prematüre durumunu mutlaka göz önünde bulundur. (Örn: 3 aylık bebeğe katı gıda önerme).
      3. Cevapların kısa, güven verici, net ve bilgilendirici olsun. Uzun paragraflardan kaçın.
      4. Tıbbi teşhis koyma, sadece genel tavsiye ver ve "doktora danışın" uyarısını gerektiğinde ekle.
      5. Türkçe cevap ver.
    `;

    // Convert internal message format to Gemini API Content format
    const contents: Content[] = history.map(msg => ({
      role: msg.role, 
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.";
  }
};
