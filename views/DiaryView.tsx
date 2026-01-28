
import React, { useState, useRef, useEffect } from 'react';
import { DiaryEntry, ThemeProps } from '../types';
import { Plus, Image as ImageIcon, Video, X, Milk, Moon, Baby, Droplets, Utensils, Clock, Play, Pause, Music, StopCircle, CircleDot, Share2, Smile } from 'lucide-react';

interface DiaryViewProps extends ThemeProps {
  entries: DiaryEntry[];
  onAddEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: string) => void;
}

// Sound Definitions
const SOUNDS = [
    { id: 'shush', name: 'Pış Pış', color: 'bg-indigo-100 text-indigo-500' },
    { id: 'white_noise', name: 'Beyaz Gürültü', color: 'bg-slate-200 text-slate-600' },
    { id: 'hair_dryer', name: 'Fön Makinesi', color: 'bg-rose-100 text-rose-500' },
];

// Stool Definitions
const COLOR_MAP: Record<string, string> = {
  yellow: 'Sarı',
  green: 'Yeşil',
  brown: 'Kahverengi',
  black: 'Siyah',
  red: 'Kırmızı',
  white: 'Beyaz'
};

const CONSISTENCY_MAP: Record<string, string> = {
  liquid: 'Sıvı',
  soft: 'Yumuşak',
  hard: 'Sert/Katı',
  mucus: 'Mukuslu'
};

// Teeth Definition (Primary Teeth)
const TEETH_UPPER = [
  { id: 'UR5', label: 'Sağ 2. Azı' },
  { id: 'UR4', label: 'Sağ 1. Azı' },
  { id: 'UR3', label: 'Sağ Köpek' },
  { id: 'UR2', label: 'Sağ Yan' },
  { id: 'UR1', label: 'Sağ Ön' },
  { id: 'UL1', label: 'Sol Ön' },
  { id: 'UL2', label: 'Sol Yan' },
  { id: 'UL3', label: 'Sol Köpek' },
  { id: 'UL4', label: 'Sol 1. Azı' },
  { id: 'UL5', label: 'Sol 2. Azı' },
];

const TEETH_LOWER = [
  { id: 'LR5', label: 'Sağ 2. Azı' },
  { id: 'LR4', label: 'Sağ 1. Azı' },
  { id: 'LR3', label: 'Sağ Köpek' },
  { id: 'LR2', label: 'Sağ Yan' },
  { id: 'LR1', label: 'Sağ Ön' },
  { id: 'LL1', label: 'Sol Ön' },
  { id: 'LL2', label: 'Sol Yan' },
  { id: 'LL3', label: 'Sol Köpek' },
  { id: 'LL4', label: 'Sol 1. Azı' },
  { id: 'LL5', label: 'Sol 2. Azı' },
];

const DiaryView: React.FC<DiaryViewProps> = ({ entries, onAddEntry, onDeleteEntry, themeColor }) => {
  const [activeTab, setActiveTab] = useState<'memories' | 'routine'>('memories');
  
  // Memories State
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Media State (Image or Video)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Routine State
  const [activeAction, setActiveAction] = useState<'feeding' | 'sleep' | 'diaper' | 'tooth' | null>(null);
  
  // Routine Form States
  const [feedType, setFeedType] = useState<'breast' | 'bottle'>('breast');
  const [feedAmount, setFeedAmount] = useState(''); // minutes or ml
  const [feedSide, setFeedSide] = useState<'left' | 'right' | 'both' | null>(null); // New: Side tracking
  const [sleepDuration, setSleepDuration] = useState(''); // hours or minutes text
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'mixed'>('wet');
  const [selectedTooth, setSelectedTooth] = useState<{id: string, label: string} | null>(null);
  
  // Stool Details
  const [stoolColor, setStoolColor] = useState('yellow');
  const [stoolConsistency, setStoolConsistency] = useState('soft');

  // Breastfeeding Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Sleep Timer
  const [isSleepTimerRunning, setIsSleepTimerRunning] = useState(false);
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState(0);
  const sleepTimerRef = useRef<number | null>(null);

  // New: Sound Player State & Refs
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // --- Audio Cleanup ---
  useEffect(() => {
    return () => {
      stopSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // --- Feeding Timer Logic ---
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // --- Sleep Timer Logic ---
  useEffect(() => {
    if (isSleepTimerRunning) {
      sleepTimerRef.current = window.setInterval(() => {
        setSleepTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
       if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    }
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [isSleepTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDurationText = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds} sn`;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) return `${hours} sa ${minutes} dk`;
    return `${minutes} dk`;
  };

  const toggleSleepTimer = () => {
    if (isSleepTimerRunning) {
        // Stopping
        setIsSleepTimerRunning(false);
        setSleepDuration(formatDurationText(sleepTimerSeconds));
    } else {
        // Starting
        setIsSleepTimerRunning(true);
    }
  };

  const resetSleepTimer = () => {
      setIsSleepTimerRunning(false);
      setSleepTimerSeconds(0);
      setSleepDuration('');
  };

  // --- Audio Generation Logic ---
  const stopSound = () => {
     if (sourceRef.current) {
         try { sourceRef.current.stop(); } catch(e){}
         sourceRef.current.disconnect();
         sourceRef.current = null;
     }
     if (lfoRef.current) {
         try { lfoRef.current.stop(); } catch(e){}
         lfoRef.current.disconnect();
         lfoRef.current = null;
     }
  };

  const toggleSound = (soundId: string) => {
    // Initialize Audio Context if needed
    if (!audioCtxRef.current) {
       audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    
    // Stop any currently playing sound
    stopSound();

    // If clicking same sound, just stop (state reset follows)
    if (playingSound === soundId) {
        setPlayingSound(null);
        return;
    }

    // Start new sound
    setPlayingSound(soundId);
    
    // Create Master Gain
    if (!gainRef.current) {
        gainRef.current = ctx.createGain();
        gainRef.current.connect(ctx.destination);
    }
    const masterGain = gainRef.current;
    masterGain.gain.setValueAtTime(0.5, ctx.currentTime); // 50% Volume

    // Create 2-second Buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generators
    const fillWhiteNoise = () => {
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    };
    
    const fillPinkNoise = () => {
        let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11; 
            b6 = white * 0.115926;
        }
    };

    const fillBrownNoise = () => {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; 
        }
    };

    const source = ctx.createBufferSource();
    source.loop = true;

    if (soundId === 'white_noise') {
        fillWhiteNoise();
        source.buffer = buffer;
        source.connect(masterGain);
    } 
    else if (soundId === 'hair_dryer') {
        fillBrownNoise();
        source.buffer = buffer;
        // Lowpass Filter for rumble
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        source.connect(filter);
        filter.connect(masterGain);
    } 
    else if (soundId === 'shush') {
        fillPinkNoise();
        source.buffer = buffer;
        
        // Amplitude Modulation for "Shhh... Shhh..." rhythm
        const shushGain = ctx.createGain();
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.5; // Rhythm speed (0.5 Hz)
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 1.0; 

        lfo.connect(lfoGain);
        lfoGain.connect(shushGain.gain); // Modulate volume
        
        // Base volume offset
        shushGain.gain.setValueAtTime(0.5, ctx.currentTime);

        source.connect(shushGain);
        shushGain.connect(masterGain);
        
        lfo.start();
        lfoRef.current = lfo;
    }

    source.start();
    sourceRef.current = source;
  };

  // --- File Handler (Base64 for Persistence) ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      
      try {
        const base64 = await fileToBase64(file);
        setSelectedMedia(base64);
        setSelectedMediaType(isVideo ? 'video' : 'image');
      } catch (error) {
        console.error("File upload error:", error);
        alert("Dosya yüklenirken bir hata oluştu.");
      }
    }
  };

  const handleSaveMemory = () => {
    if (!newNote.trim() && !selectedMedia) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: newNote,
      mediaUrl: selectedMedia || undefined,
      mediaType: selectedMedia ? selectedMediaType : undefined,
      category: 'memory'
    };

    onAddEntry(newEntry);
    setNewNote('');
    setSelectedMedia(null);
    setSelectedMediaType('image');
    setIsAdding(false);
  };

  const handleShareEntry = async (entry: DiaryEntry) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BabySteps Anısı',
          text: `${new Date(entry.date).toLocaleDateString('tr-TR')} - ${entry.content}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("Paylaşım özelliği bu cihazda desteklenmiyor.");
    }
  };

  const handleSaveRoutine = () => {
    let content = '';
    let category: DiaryEntry['category'] = 'feeding';
    let details: DiaryEntry['details'] = {};

    if (activeAction === 'feeding') {
      category = 'feeding';
      // Use timer if available and greater than 0
      const amount = isTimerRunning || timerSeconds > 0 
        ? `${Math.ceil(timerSeconds / 60)} dk` 
        : (feedType === 'breast' ? `${feedAmount} dk` : `${feedAmount} ml`);
      
      let sideText = '';
      if (feedType === 'breast' && feedSide) {
          sideText = feedSide === 'left' ? ' (Sol)' : feedSide === 'right' ? ' (Sağ)' : ' (Her İkisi)';
          details.side = feedSide;
      }

      content = `${feedType === 'breast' ? 'Emzirme' : 'Biberon/Mama'}: ${amount}${sideText}`;
      details = { ...details, subType: feedType, amount: amount };
      
      // Reset timer
      setIsTimerRunning(false);
      setTimerSeconds(0);
      setFeedSide(null);

    } else if (activeAction === 'sleep') {
      category = 'sleep';
      
      // Use sleep timer if running or has value
      let finalDuration = sleepDuration;
      if (isSleepTimerRunning || (sleepTimerSeconds > 0 && !sleepDuration)) {
          finalDuration = formatDurationText(sleepTimerSeconds);
      }

      content = `Uyku Süresi: ${finalDuration}`;
      details = { amount: finalDuration };
      
      // Reset sleep timer
      resetSleepTimer();

    } else if (activeAction === 'diaper') {
      category = 'diaper';
      const typeLabels = { wet: 'Sadece Çiş', dirty: 'Sadece Kaka', mixed: 'Çiş & Kaka' };
      
      let extraInfo = '';
      if (diaperType !== 'wet') {
         const colorLabel = COLOR_MAP[stoolColor] || stoolColor;
         const consistencyLabel = CONSISTENCY_MAP[stoolConsistency] || stoolConsistency;
         extraInfo = ` (${colorLabel}, ${consistencyLabel})`;
      }
      
      content = `Alt Değiştirme: ${typeLabels[diaperType]}${extraInfo}`;
      details = { 
        subType: diaperType,
        stoolColor: diaperType !== 'wet' ? stoolColor : undefined,
        stoolConsistency: diaperType !== 'wet' ? stoolConsistency : undefined
      };
      
      // Reset stool state
      setStoolColor('yellow');
      setStoolConsistency('soft');
    } else if (activeAction === 'tooth') {
      category = 'tooth';
      if (!selectedTooth) return;
      
      // Determine if it's Upper or Lower for better description
      const isUpper = selectedTooth.id.startsWith('U');
      const position = isUpper ? 'Üst Çene' : 'Alt Çene';
      
      content = `Diş Çıkardı: ${position} ${selectedTooth.label} 🎉`;
      details = { toothId: selectedTooth.id };
      setSelectedTooth(null);
    }

    if (!content) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: content,
      category: category,
      details: details
    };

    onAddEntry(newEntry);
    setActiveAction(null);
    setFeedAmount('');
    setSleepDuration('');
    setFeedSide(null);
  };

  const routineEntries = entries.filter(e => e.category && e.category !== 'memory');
  const memoryEntries = entries.filter(e => !e.category || e.category === 'memory');

  return (
    <div className="pb-24 space-y-6">
      
      {/* Header & Tabs */}
      <div>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Günlük Takip</h2>
        <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('memories')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'memories' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Anılar
          </button>
          <button 
            onClick={() => setActiveTab('routine')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'routine' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Günlük Rutin
          </button>
        </div>
      </div>

      {activeTab === 'memories' ? (
        // --- MEMORIES TAB CONTENT ---
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400 font-medium">Bebeğinizin özel anlarını kaydedin.</p>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={`bg-${themeColor}-500 text-white p-2 rounded-full shadow-lg shadow-${themeColor}-200 active:scale-95 transition-transform`}
            >
              <Plus size={24} />
            </button>
          </div>

          {isAdding && (
            <div className={`bg-white p-4 rounded-2xl shadow-lg border border-${themeColor}-100 animate-fade-in-down`}>
              <textarea
                className={`w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-${themeColor}-200 text-slate-700 placeholder:text-slate-400 resize-none text-sm`}
                rows={3}
                placeholder="Bugün bebeğin neler yaptı? Unutulmaz anları not al..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              
              {selectedMedia && (
                <div className="relative mt-3 inline-block">
                  {selectedMediaType === 'video' ? (
                    <video 
                      src={selectedMedia} 
                      className="h-24 w-24 object-cover rounded-xl border border-slate-200" 
                      controls={false}
                      muted
                    />
                  ) : (
                    <img 
                      src={selectedMedia} 
                      alt="Preview" 
                      className="h-24 w-24 object-cover rounded-xl border border-slate-200" 
                    />
                  )}
                  <button 
                    onClick={() => { setSelectedMedia(null); setSelectedMediaType('image'); }}
                    className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full text-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center space-x-2 text-${themeColor}-500 text-sm font-medium px-3 py-2 rounded-lg hover:bg-${themeColor}-50 transition-colors`}
                >
                  <div className="flex -space-x-1">
                     <ImageIcon size={18} />
                     <Video size={18} className="opacity-50" />
                  </div>
                  <span>Medya Ekle</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileChange} 
                />
                
                <button 
                  onClick={handleSaveMemory}
                  disabled={!newNote && !selectedMedia}
                  className={`bg-${themeColor}-500 disabled:bg-${themeColor}-200 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-${themeColor}-100`}
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {memoryEntries.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">Henüz bir anı eklenmedi.</p>
               </div>
            ) : (
              memoryEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                <div key={entry.id} className={`relative pl-8 border-l-2 border-${themeColor}-100 last:border-0`}>
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-${themeColor}-200 border-2 border-white`}></div>
                  
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold text-${themeColor}-400 bg-${themeColor}-50 px-2 py-1 rounded-lg`}>
                        {new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                      </span>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => handleShareEntry(entry)} 
                           className="text-slate-300 hover:text-blue-400 transition-colors p-1"
                           title="Paylaş"
                         >
                           <Share2 size={14} />
                         </button>
                         <button 
                           onClick={() => {
                               if (window.confirm("Bu anıyı silmek istediğinizden emin misiniz?")) {
                                   onDeleteEntry(entry.id);
                               }
                           }}
                           className="text-slate-300 hover:text-red-400 transition-colors p-1"
                         >
                           <X size={14} />
                         </button>
                      </div>
                    </div>

                    {entry.mediaUrl && (
                      <div className="mb-3 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                        {entry.mediaType === 'video' ? (
                          <video 
                            src={entry.mediaUrl} 
                            controls 
                            className="w-full h-auto max-h-72 object-contain"
                          />
                        ) : (
                          <img 
                            src={entry.mediaUrl} 
                            alt="Memory" 
                            className="w-full h-auto object-cover max-h-72" 
                          />
                        )}
                      </div>
                    )}

                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // --- ROUTINE TAB CONTENT ---
        <div className="animate-fade-in space-y-6">
          
          {/* Sounds Widget */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <h3 className="font-bold flex items-center gap-2 text-sm"><Music size={16}/> Uyku Arkadaşı</h3>
                   <p className="text-[10px] text-indigo-100 opacity-90">Bebeğinizi rahatlatacak sesler</p>
                </div>
                <div className="flex gap-2">
                   {SOUNDS.map(sound => (
                      <button 
                        key={sound.id}
                        onClick={() => toggleSound(sound.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${playingSound === sound.id ? 'bg-white text-indigo-500 animate-pulse scale-110 shadow-lg' : 'bg-white/20 hover:bg-white/30'}`}
                        title={sound.name}
                      >
                         {playingSound === sound.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                      </button>
                   ))}
                </div>
             </div>
             {playingSound && (
                <div className="relative z-10 mt-2 text-[10px] bg-black/20 px-2 py-1 rounded w-fit animate-fade-in">
                   Çalıyor: {SOUNDS.find(s => s.id === playingSound)?.name}
                </div>
             )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={() => setActiveAction('feeding')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${activeAction === 'feeding' ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-orange-100 hover:bg-orange-50/50'}`}
            >
              <div className={`p-2 rounded-full ${activeAction === 'feeding' ? 'bg-orange-100' : 'bg-slate-50'}`}>
                <Milk size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold">Beslenme</span>
            </button>

            <button 
              onClick={() => setActiveAction('sleep')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${activeAction === 'sleep' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100 hover:bg-indigo-50/50'}`}
            >
               <div className={`p-2 rounded-full ${activeAction === 'sleep' ? 'bg-indigo-100' : 'bg-slate-50'}`}>
                <Moon size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold">Uyku</span>
            </button>

            <button 
              onClick={() => setActiveAction('diaper')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${activeAction === 'diaper' ? 'bg-cyan-50 border-cyan-200 text-cyan-600 shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-cyan-100 hover:bg-cyan-50/50'}`}
            >
               <div className={`p-2 rounded-full ${activeAction === 'diaper' ? 'bg-cyan-100' : 'bg-slate-50'}`}>
                <Baby size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold">Alt Değiş.</span>
            </button>

            <button 
              onClick={() => setActiveAction('tooth')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${activeAction === 'tooth' ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-rose-100 hover:bg-rose-50/50'}`}
            >
               <div className={`p-2 rounded-full ${activeAction === 'tooth' ? 'bg-rose-100' : 'bg-slate-50'}`}>
                <Smile size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold">Diş</span>
            </button>
          </div>

          {/* Action Forms */}
          {activeAction === 'feeding' && (
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-lg animate-fade-in">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                 <Utensils size={18} className="text-orange-500"/> Beslenme Detayı
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                 <button onClick={() => setFeedType('breast')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${feedType === 'breast' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}>Anne Sütü</button>
                 <button onClick={() => setFeedType('bottle')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${feedType === 'bottle' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}>Biberon/Mama</button>
              </div>
              
              {/* Breastfeeding Timer Feature */}
              {feedType === 'breast' && (
                 <div className="mb-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex justify-center mb-4">
                      <div className="flex bg-white/50 rounded-lg p-1 gap-1">
                        <button 
                          onClick={() => setFeedSide('left')}
                          className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition-all ${feedSide === 'left' ? 'bg-orange-500 text-white shadow' : 'text-orange-400 hover:bg-orange-100'}`}
                        >
                          Sol
                        </button>
                        <button 
                          onClick={() => setFeedSide('right')}
                          className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition-all ${feedSide === 'right' ? 'bg-orange-500 text-white shadow' : 'text-orange-400 hover:bg-orange-100'}`}
                        >
                          Sağ
                        </button>
                        <button 
                          onClick={() => setFeedSide('both')}
                          className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition-all ${feedSide === 'both' ? 'bg-orange-500 text-white shadow' : 'text-orange-400 hover:bg-orange-100'}`}
                        >
                          Her İkisi
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                       <p className="text-4xl font-mono font-bold text-orange-600 mb-4 tracking-wider drop-shadow-sm">{formatTime(timerSeconds)}</p>
                       <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all ${isTimerRunning ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}`}
                          >
                             {isTimerRunning ? <Pause size={16}/> : <Play size={16}/>}
                             {isTimerRunning ? 'Durdur' : 'Başlat'}
                          </button>
                          <button 
                             onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}
                             className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-300 transition-colors"
                          >
                             <StopCircle size={16}/> Sıfırla
                          </button>
                       </div>
                       {isTimerRunning && (
                         <div className="mt-3 text-xs text-orange-400 animate-pulse font-medium flex justify-center items-center gap-1">
                            <CircleDot size={10} />
                            {feedSide === 'left' ? 'Sol' : feedSide === 'right' ? 'Sağ' : feedSide === 'both' ? 'Her İkisi' : 'Süre'} kaydediliyor...
                         </div>
                       )}
                    </div>
                 </div>
              )}

              <div className="mb-4">
                 <label className="text-xs font-medium text-slate-400 ml-1 mb-1 block">{feedType === 'breast' ? 'Süre (dakika) - Elle Giriş' : 'Miktar (ml)'}</label>
                 <input 
                   type="number" 
                   value={feedAmount}
                   onChange={e => setFeedAmount(e.target.value)}
                   placeholder={feedType === 'breast' ? 'Örn: 20' : 'Örn: 120'}
                   className="w-full bg-slate-50 p-3 rounded-xl text-slate-700 focus:ring-2 focus:ring-orange-200 outline-none"
                 />
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setActiveAction(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">İptal</button>
                 <button onClick={handleSaveRoutine} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-orange-200">Kaydet</button>
              </div>
            </div>
          )}

          {activeAction === 'sleep' && (
            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-lg animate-fade-in">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                 <Moon size={18} className="text-indigo-500"/> Uyku Detayı
              </h3>

              {/* Sleep Timer */}
              <div className="mb-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                 <p className="text-4xl font-mono font-bold text-indigo-600 mb-4 tracking-wider drop-shadow-sm">{formatTime(sleepTimerSeconds)}</p>
                 <div className="flex justify-center gap-3">
                    <button 
                      onClick={toggleSleepTimer}
                      className={`px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all ${isSleepTimerRunning ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200'}`}
                    >
                        {isSleepTimerRunning ? <Pause size={16}/> : <Play size={16}/>}
                        {isSleepTimerRunning ? 'Durdur' : 'Başlat'}
                    </button>
                    <button 
                        onClick={resetSleepTimer}
                        className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-300 transition-colors"
                    >
                        <StopCircle size={16}/> Sıfırla
                    </button>
                 </div>
                 {isSleepTimerRunning && (
                    <div className="mt-3 text-xs text-indigo-400 animate-pulse font-medium flex justify-center items-center gap-1">
                      <CircleDot size={10} />
                      Uyku süresi kaydediliyor...
                    </div>
                 )}
              </div>

              <div className="mb-4">
                 <label className="text-xs font-medium text-slate-400 ml-1 mb-1 block">Uyku Süresi (Elle Düzenle)</label>
                 <input 
                   type="text" 
                   value={sleepDuration}
                   onChange={e => setSleepDuration(e.target.value)}
                   placeholder="Örn: 2 sa 15 dk"
                   className="w-full bg-slate-50 p-3 rounded-xl text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none"
                 />
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setActiveAction(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">İptal</button>
                 <button onClick={handleSaveRoutine} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-200">Kaydet</button>
              </div>
            </div>
          )}

          {activeAction === 'diaper' && (
             <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-lg animate-fade-in">
               <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                 <Droplets size={18} className="text-cyan-500"/> Bez Değişimi
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                 <button 
                   onClick={() => setDiaperType('wet')} 
                   className={`py-3 rounded-xl border font-bold text-xs transition-all ${diaperType === 'wet' ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                 >
                   Sadece Çiş
                 </button>
                 <button 
                   onClick={() => setDiaperType('dirty')} 
                   className={`py-3 rounded-xl border font-bold text-xs transition-all ${diaperType === 'dirty' ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                 >
                   Sadece Kaka
                 </button>
                 <button 
                   onClick={() => setDiaperType('mixed')} 
                   className={`py-3 rounded-xl border font-bold text-xs transition-all ${diaperType === 'mixed' ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                 >
                   Çiş & Kaka
                 </button>
              </div>

              {/* Advanced Stool Tracking */}
              {diaperType !== 'wet' && (
                <div className="space-y-3 mb-4 animate-fade-in">
                   <div>
                      <div className="flex justify-between items-center mb-2">
                         <p className="text-xs font-bold text-slate-500">Renk</p>
                         <span className="text-[10px] font-bold text-slate-400">{COLOR_MAP[stoolColor]}</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[
                          {val: 'yellow', bg: 'bg-yellow-400'},
                          {val: 'green', bg: 'bg-green-600'},
                          {val: 'brown', bg: 'bg-amber-800'},
                          {val: 'black', bg: 'bg-slate-900'},
                          {val: 'red', bg: 'bg-red-600'},
                          {val: 'white', bg: 'bg-slate-100 border border-slate-300'},
                        ].map(c => (
                           <button
                             key={c.val}
                             onClick={() => setStoolColor(c.val)}
                             className={`w-8 h-8 rounded-full flex-shrink-0 ${c.bg} ${stoolColor === c.val ? 'ring-2 ring-cyan-400 scale-110' : ''}`}
                           />
                        ))}
                      </div>
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-500 mb-2">Kıvam</p>
                      <div className="grid grid-cols-2 gap-2">
                         {['liquid', 'soft', 'hard', 'mucus'].map(t => (
                            <button
                              key={t}
                              onClick={() => setStoolConsistency(t)}
                              className={`py-2 px-3 rounded-lg text-xs font-medium border ${stoolConsistency === t ? 'bg-cyan-50 border-cyan-400 text-cyan-700' : 'border-slate-200 text-slate-500'}`}
                            >
                               {CONSISTENCY_MAP[t]}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              <div className="flex gap-2">
                 <button onClick={() => setActiveAction(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">İptal</button>
                 <button onClick={handleSaveRoutine} className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-200">Kaydet</button>
              </div>
             </div>
          )}

          {activeAction === 'tooth' && (
             <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-lg animate-fade-in">
               <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                 <Smile size={18} className="text-rose-500"/> Hangi Diş Çıktı?
               </h3>
               
               <p className="text-xs text-slate-400 mb-3 text-center">Çıkan dişi seçmek için üzerine dokunun</p>

               {/* Dental Chart Visualization */}
               <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-50 mb-4">
                  {/* Upper Jaw */}
                  <div className="flex justify-center gap-1 mb-2">
                      <div className="flex gap-1">
                        {TEETH_UPPER.slice(0, 5).reverse().map(tooth => (
                           <button
                             key={tooth.id}
                             onClick={() => setSelectedTooth(tooth)}
                             className={`w-7 h-9 rounded-b-md border shadow-sm text-[8px] font-bold transition-all ${selectedTooth?.id === tooth.id ? 'bg-rose-500 text-white border-rose-600 scale-110' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300'}`}
                             title={tooth.label}
                           >
                             {tooth.id}
                           </button>
                        ))}
                      </div>
                      <div className="w-2"></div>
                      <div className="flex gap-1">
                        {TEETH_UPPER.slice(5).map(tooth => (
                           <button
                             key={tooth.id}
                             onClick={() => setSelectedTooth(tooth)}
                             className={`w-7 h-9 rounded-b-md border shadow-sm text-[8px] font-bold transition-all ${selectedTooth?.id === tooth.id ? 'bg-rose-500 text-white border-rose-600 scale-110' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300'}`}
                             title={tooth.label}
                           >
                             {tooth.id}
                           </button>
                        ))}
                      </div>
                  </div>

                  {/* Lower Jaw */}
                  <div className="flex justify-center gap-1">
                      <div className="flex gap-1">
                        {TEETH_LOWER.slice(0, 5).reverse().map(tooth => (
                           <button
                             key={tooth.id}
                             onClick={() => setSelectedTooth(tooth)}
                             className={`w-7 h-9 rounded-t-md border shadow-sm text-[8px] font-bold transition-all ${selectedTooth?.id === tooth.id ? 'bg-rose-500 text-white border-rose-600 scale-110' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300'}`}
                             title={tooth.label}
                           >
                             {tooth.id}
                           </button>
                        ))}
                      </div>
                      <div className="w-2"></div>
                      <div className="flex gap-1">
                        {TEETH_LOWER.slice(5).map(tooth => (
                           <button
                             key={tooth.id}
                             onClick={() => setSelectedTooth(tooth)}
                             className={`w-7 h-9 rounded-t-md border shadow-sm text-[8px] font-bold transition-all ${selectedTooth?.id === tooth.id ? 'bg-rose-500 text-white border-rose-600 scale-110' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300'}`}
                             title={tooth.label}
                           >
                             {tooth.id}
                           </button>
                        ))}
                      </div>
                  </div>
               </div>

               {selectedTooth && (
                 <div className="text-center mb-4">
                    <p className="text-sm font-bold text-rose-600">{selectedTooth.label}</p>
                 </div>
               )}

               <div className="flex gap-2">
                 <button onClick={() => { setActiveAction(null); setSelectedTooth(null); }} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">İptal</button>
                 <button onClick={handleSaveRoutine} disabled={!selectedTooth} className="flex-1 py-3 bg-rose-500 disabled:bg-rose-300 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-200">Kaydet</button>
              </div>
             </div>
          )}

          {/* Routine List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Bugünün Rutini</h3>
            {routineEntries.length === 0 ? (
               <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs">Bugün henüz bir kayıt yok.</p>
               </div>
            ) : (
               routineEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => {
                 let icon = <Clock size={16} />;
                 let colorClass = 'bg-slate-100 text-slate-500';
                 
                 if (entry.category === 'feeding') {
                   icon = <Milk size={16} />;
                   colorClass = 'bg-orange-100 text-orange-500';
                 } else if (entry.category === 'sleep') {
                   icon = <Moon size={16} />;
                   colorClass = 'bg-indigo-100 text-indigo-500';
                 } else if (entry.category === 'diaper') {
                   icon = <Droplets size={16} />;
                   colorClass = 'bg-cyan-100 text-cyan-500';
                 } else if (entry.category === 'tooth') {
                   icon = <Smile size={16} />;
                   colorClass = 'bg-rose-100 text-rose-500';
                 }

                 return (
                   <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                            {icon}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-700">{entry.content}</p>
                            <div className="flex gap-2 mt-0.5">
                               <p className="text-[10px] text-slate-400 font-medium">
                                  {new Date(entry.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                               </p>
                               {/* Show detail tags if available */}
                               {entry.details?.stoolColor && (
                                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: entry.details.stoolColor === 'brown' ? '#92400e' : entry.details.stoolColor}}></span>
                               )}
                               {entry.details?.side && (
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-md font-bold">
                                    {entry.details.side === 'left' ? 'Sol' : entry.details.side === 'right' ? 'Sağ' : 'Her İkisi'}
                                  </span>
                               )}
                            </div>
                         </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="text-slate-300 hover:text-red-400 p-2"
                      >
                        <X size={14} />
                      </button>
                   </div>
                 )
               })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryView;
