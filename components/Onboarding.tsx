
import React, { useState } from 'react';
import { ShieldCheck, Brain, Heart, ChevronRight, Check, Activity } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      id: 1,
      title: "BabySteps'e Hoşgeldin",
      desc: "Bebeğinin büyüme yolculuğunda sana eşlik edecek en güvenli ve akıllı asistan.",
      icon: <Heart size={64} className="text-white" />,
      bg: "bg-rose-400"
    },
    {
      id: 2,
      title: "%100 Veri Gizliliği",
      desc: "Fotoğrafların ve bilgilerin bulutta değil, şifrelenmiş olarak sadece senin telefonunda saklanır.",
      icon: <ShieldCheck size={64} className="text-white" />,
      bg: "bg-emerald-500"
    },
    {
      id: 3,
      title: "Yapay Zeka Desteği",
      desc: "Bebeğinin gelişimine özel, bağlamı bilen Gemini AI asistanına dilediğini sor.",
      icon: <Brain size={64} className="text-white" />,
      bg: "bg-indigo-500"
    },
    {
      id: 4,
      title: "Her Şey Kontrol Altında",
      desc: "Aşılar, gelişim eğrileri, uyku saatleri ve özel anılar tek bir yerde.",
      icon: <Activity size={64} className="text-white" />,
      bg: "bg-orange-400"
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 text-white transition-colors duration-500 ${slides[step].bg}`}>
      
      {/* Skip Button */}
      <div className="w-full flex justify-end pt-4">
        <button onClick={onComplete} className="text-white/70 text-sm font-bold hover:text-white">
          Geç
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center text-center space-y-8 mt-10 animate-fade-in" key={step}>
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl ring-4 ring-white/10">
          {slides[step].icon}
        </div>
        
        <div className="space-y-4 max-w-xs">
          <h2 className="text-3xl font-bold tracking-tight">{slides[step].title}</h2>
          <p className="text-white/90 text-lg leading-relaxed font-medium">
            {slides[step].desc}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full flex flex-col items-center gap-8 mb-8">
        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`} 
            />
          ))}
        </div>

        {/* Button */}
        <button 
          onClick={handleNext}
          className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 active:scale-95 transition-transform flex items-center justify-center gap-2 group"
        >
          {step === slides.length - 1 ? (
             <>
               Hadi Başlayalım <Check size={20} className="text-emerald-500" />
             </>
          ) : (
             <>
               Devam Et <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
