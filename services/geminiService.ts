
import { GoogleGenAI, Content } from "@google/genai";
import { BabyProfile, ChatMessage } from "../types";

// In Vite, environment variables must be prefixed with VITE_ and accessed via import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Please create a .env file and add it.");
}
const ai = new GoogleGenAI({ apiKey: apiKey });

export const askParentingAdvisor = async (history: ChatMessage[], profile: BabyProfile): Promise<string> => {
  try {
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
