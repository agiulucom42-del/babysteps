<div align="center">
  <img width="1200" height="475" alt="BabySteps Application Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BabySteps - Bebek Gelişim Takibi

**BabySteps** is a modern, privacy-focused Progressive Web App (PWA) designed to help parents track their baby's developmental journey. From daily diary entries to important health records, BabySteps provides a secure and easy-to-use platform to store and manage precious moments and vital information, all stored locally on your device.

## ✨ Key Features

- **👶 Profil Yönetimi:** Bebeğinizin adı, doğum tarihi, ve cinsiyeti gibi temel bilgileri içeren bir profil oluşturun. Ayrıca, uygulama deneyimini kişiselleştirmek için bir tema rengi seçin.
- **📅 Günlük:** Fotoğraf ve metin içeren günlük girişleri oluşturarak bebeğinizin büyüme anlarını ve özel anılarını kaydedin. Bu anılar, bebeğinizin gelişim yolculuğunun değerli bir kaydını oluşturur.
- **🩺 Sağlık Takibi:** Aşıları, tıbbi geçmişi, ve önemli belgeleri takip edin. Sağlık takvimi ile bebeğinizin aşı programını ve diğer önemli sağlık olaylarını kolayca yönetin.
- **📈 Büyüme ve Gelişim:** Bebeğinizin kilo ve boy gibi büyüme verilerini kaydedin. Ayrıca, ilk gülümseme veya ilk adım gibi önemli gelişimsel kilometre taşlarını işaretleyin.
- **🤖 AI Asistanı:** Ebeveynlikle ilgili sorularınıza anında yanıtlar alın. Google Gemini tarafından desteklenen AI asistanımız, güvenilir bilgiler ve tavsiyeler sunar.
- **🔒 Gizlilik Odaklı:** Tüm verileriniz (fotoğraflar, günlükler, sağlık kayıtları) yalnızca cihazınızda saklanır. Hiçbir kişisel veri bulut sunucularına gönderilmez, bu da tam bir gizlilik ve güvenlik sağlar.
- **🎨 Özelleştirilebilir Arayüz:** Uygulamanın renk temasını kişisel zevkinize göre ayarlayın, bu da kullanıcı deneyimini daha keyifli hale getirir.

## 🛠️ Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Icons:** Lucide React
- **Local Storage:** IndexedDB for secure, on-device data persistence.
- **AI:** Google Gemini API

## 🚀 Getting Started

Follow these instructions to set up and run the project locally for development.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (LTS version recommended)
- [pnpm](https://pnpm.io/installation)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/babysteps.git
    cd babysteps
    ```

2.  **Install dependencies using pnpm:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env.local` in the root of the project and add your Google Gemini API key.
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
    *Note: The app will run without a valid API key, but the AI Assistant feature will not be functional.*

4.  **Run the development server:**
    ```bash
    pnpm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 🔒 Data Privacy

This application is built with a strong emphasis on privacy. **All data you enter is stored exclusively in your browser's IndexedDB storage.** No personal information, photos, or health records are ever uploaded to a server, ensuring that you have full control over your family's data.