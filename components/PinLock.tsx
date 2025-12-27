
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete, AlertCircle } from 'lucide-react';

interface PinLockProps {
  mode: 'setup' | 'unlock';
  onSuccess: (pin: string) => void;
  onReset?: () => void; 
  themeColor?: string; // Optional since it might be called before theme is set
}

const PinLock: React.FC<PinLockProps> = ({ mode, onSuccess, onReset, themeColor = 'rose' }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState(''); // For setup mode
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter'); // For setup flow

  const handleNumClick = (num: number) => {
    setError('');
    if (step === 'enter') {
      if (pin.length < 4) setPin(prev => prev + num);
    } else {
      if (confirmPin.length < 4) setConfirmPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setError('');
    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    // Check Logic when 4 digits entered
    if (mode === 'unlock') {
      if (pin.length === 4) {
        onSuccess(pin);
        // If success handler doesn't unmount us (wrong pin), we reset
        setTimeout(() => {
            if (pin.length === 4) { // Still here?
                setPin('');
                setError('Hatalı PIN');
            }
        }, 300);
      }
    } else if (mode === 'setup') {
      if (step === 'enter' && pin.length === 4) {
        setStep('confirm');
      } else if (step === 'confirm' && confirmPin.length === 4) {
        if (pin === confirmPin) {
          onSuccess(pin);
        } else {
          setError('PINler eşleşmiyor. Tekrar dene.');
          setPin('');
          setConfirmPin('');
          setStep('enter');
        }
      }
    }
  }, [pin, confirmPin, mode, step, onSuccess]);

  return (
    <div className={`fixed inset-0 z-[60] bg-${themeColor}-500 flex flex-col items-center justify-center text-white p-6 animate-fade-in`}>
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
          {mode === 'unlock' ? <Lock size={32} /> : <Unlock size={32} />}
        </div>
        <h2 className="text-2xl font-bold">
          {mode === 'setup' 
            ? (step === 'enter' ? 'Yeni PIN Belirle' : 'PIN\'i Doğrula') 
            : 'Hoşgeldiniz'}
        </h2>
        <p className={`text-${themeColor}-100 text-sm mt-2`}>
          {mode === 'setup' 
            ? 'Verilerinizi korumak için 4 haneli bir şifre girin.' 
            : 'Devam etmek için şifrenizi girin.'}
        </p>
      </div>

      {/* PIN Dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              (step === 'enter' ? pin.length : confirmPin.length) > i 
                ? 'bg-white scale-110' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-500/50 px-4 py-2 rounded-lg text-sm font-bold animate-pulse">
           <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-2xl font-bold transition-all active:scale-95 flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        <div className="w-16 h-16"></div>
        <button
          onClick={() => handleNumClick(0)}
          className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-2xl font-bold transition-all active:scale-95 flex items-center justify-center"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          aria-label="Son rakamı sil"
          className="w-16 h-16 rounded-full hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 text-white/70 hover:text-white"
        >
          <Delete size={24} />
        </button>
      </div>

      {mode === 'unlock' && onReset && (
         <button onClick={onReset} className={`text-xs text-${themeColor}-200 underline hover:text-white opacity-60`}>
            Verileri Sil ve Sıfırla
         </button>
      )}
    </div>
  );
};

export default PinLock;