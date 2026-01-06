
import { GoogleGenAI, Content } from "@google/genai";
import { BabyProfile, ChatMessage } from "../types";

// Performance: Lazily initialize the AI client to prevent server crashes
// on startup if the API key is missing or invalid. This also avoids
// loading the SDK until it's actually needed.
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set. AI features will not be available.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export const askParentingAdvisor = async (history: ChatMessage[], profile: BabyProfile): Promise<string> => {
  const aiClient = getAiClient();
  if (!aiClient) {
    return "AI Asistanı için API anahtarı yapılandırılmamış. Lütfen .env.local dosyasını kontrol edin.";
  }

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

    const response = await aiClient.models.generateContent({
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
