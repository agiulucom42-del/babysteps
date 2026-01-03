
import React, { useState, useEffect, useRef } from 'react';
import { BabyProfile, GrowthRecord, DiaryEntry, Vaccine, CalendarEvent, ThemeProps, ThemeColor } from '../types';
import { THEME_COLORS } from '../constants';
import { Calendar, TrendingUp, Syringe, Settings, X, Save, Bell, Gift, AlertTriangle, Camera, Baby, ShieldCheck, Lock, HardDrive, Cpu, CalendarClock, Palette, Check, Trash2, GraduationCap } from 'lucide-react';

interface DashboardViewProps extends ThemeProps {
  profile: BabyProfile;
  latestGrowth: GrowthRecord | undefined;
  vaccines: Vaccine[]; 
  recentEntries: DiaryEntry[];
  customEvents: CalendarEvent[];
  onChangeView: (view: any) => void;
  onUpdateProfile: (profile: BabyProfile) => void;
}

interface Notification {
  id: string;
  type: 'vaccine' | 'birthday' | 'milestone' | 'event';
  title: string;
  message: string;
  date?: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ profile, latestGrowth, vaccines, recentEntries, customEvents, onChangeView, onUpdateProfile, themeColor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showGraduation, setShowGraduation] = useState(false);
  const [editForm, setEditForm] = useState<BabyProfile>(profile);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate age helpers
  const getAgeInMonths = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    const now = new Date();
    return (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  };

  const calculateAge = (birthDate: string, isPremature?: boolean, gestWeeks?: number) => {
    const start = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Chronological Age String
    let chronoString = "";
    if (diffDays < 30) {
        chronoString = `${diffDays} Günlük`;
    } else {
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        chronoString = `${months} Ay ${days > 0 ? `${days} Gün` : ''}`;
    }

    // Corrected Age Logic (Only if premature and under 2 years)
    let correctedString = "";
    if (isPremature && gestWeeks && gestWeeks < 40 && diffDays < 730) {
        const daysToDueDate = (40 - gestWeeks) * 7;
        const correctedDays = diffDays - daysToDueDate;
        
        if (correctedDays > 0) {
            if (correctedDays < 30) {
                correctedString = `${correctedDays} Gün`;
            } else {
                const cMonths = Math.floor(correctedDays / 30);
                const cDays = correctedDays % 30;
                correctedString = `${cMonths} Ay ${cDays > 0 ? `${cDays} G` : ''}`;
            }
        } else {
            correctedString = "Düzeltilmiş yaş için erken";
        }
    }

    return { chronoString, correctedString };
  };

  const ageData = calculateAge(profile.birthDate, profile.isPremature, profile.gestationalWeeks);

  // Check for 5-Year Graduation (60 Months)
  useEffect(() => {
    const ageInMonths = getAgeInMonths(profile.birthDate);
    const graduationKey = `babysteps_grad_seen_${profile.name}`;
    
    // If age >= 5 years (60 months) and not seen before
    if (ageInMonths >= 60) {
      const hasSeen = localStorage.getItem(graduationKey);
      if (!hasSeen) {
        setShowGraduation(true);
      }
    }
  }, [profile]);

  const handleDismissGraduation = () => {
    const graduationKey = `babysteps_grad_seen_${profile.name}`;
    localStorage.setItem(graduationKey, 'true');
    setShowGraduation(false);
  };

  // Generate Notifications
  useEffect(() => {
    const newNotifications: Notification[] = [];
    const ageInMonths = getAgeInMonths(profile.birthDate);
    const today = new Date();
    const birthDate = new Date(profile.birthDate);

    // 1. Birthday / Month-versary Check
    if (today.getDate() === birthDate.getDate()) {
      newNotifications.push({
        id: 'birthday',
        type: 'birthday',
        title: ageInMonths % 12 === 0 ? "Mutlu Yıllar!" : `${ageInMonths}. Ay Dönümü!`,
        message: `${profile.name} bugün tam ${ageInMonths} aylık oldu! Gelişimini kaydetmeyi unutma.`
      });
    }

    // 2. Vaccine Check (Due this month and not completed)
    const dueVaccines = vaccines.filter(v => v.monthDue === ageInMonths && !v.completed);
    if (dueVaccines.length > 0) {
      newNotifications.push({
        id: 'vaccine',
        type: 'vaccine',
        title: 'Aşı Zamanı',
        message: `Bu ay ${dueVaccines.length} aşı görünmektedir: ${dueVaccines.map(v => v.name).join(', ')}.`
      });
    }

    // 3. Next Upcoming / Overdue Vaccine Check
    const sortedVaccines = [...vaccines].sort((a, b) => a.monthDue - b.monthDue);
    const nextUncompleted = sortedVaccines.find(v => !v.completed);

    if (nextUncompleted) {
      // Don't duplicate if it's already in "dueVaccines" (due this month)
      const isDueThisMonth = nextUncompleted.monthDue === ageInMonths;
      
      const dueDate = new Date(birthDate);
      dueDate.setMonth(birthDate.getMonth() + nextUncompleted.monthDue);

      if (!isDueThisMonth) {
        if (nextUncompleted.monthDue > ageInMonths) {
            newNotifications.push({
                id: 'upcoming-vaccine',
                type: 'vaccine',
                title: 'Sıradaki Aşı',
                message: `${nextUncompleted.name}\nBeklenen Tarih: ${dueDate.toLocaleDateString('tr-TR')}`
            });
        } else {
            // Overdue
            newNotifications.push({
                id: 'overdue-vaccine',
                type: 'vaccine',
                title: 'Eksik Aşı Uyarısı',
                message: `${nextUncompleted.name} (${nextUncompleted.monthDue}. Ay) henüz tamamlanmadı.`
            });
        }
      }
    }

    // 4. Custom Events Check (Approaching in next 3 days)
    const now = new Date();
    customEvents.forEach(event => {
       const eventDate = new Date(event.date);
       const diffTime = eventDate.getTime() - now.getTime();
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

       if (diffDays >= 0 && diffDays <= 3) {
          const dayText = diffDays === 0 ? "Bugün" : diffDays === 1 ? "Yarın" : `${diffDays} gün sonra`;
          newNotifications.push({
             id: `event-${event.id}`,
             type: 'event',
             title: 'Yaklaşan Etkinlik',
             message: `${event.title} - ${dayText}`
          });
       }
    });

    setNotifications(newNotifications);
  }, [profile, vaccines, customEvents]);

  const handleSaveProfile = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  // Helper to convert file to Base64 for persistence
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setEditForm(prev => ({ ...prev, photoUrl: base64 }));
      } catch (error) {
        console.error("Error converting file:", error);
      }
    }
  };

  const handleRemovePhoto = () => {
    setEditForm(prev => ({ ...prev, photoUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Determine next vaccine for status card (Sorted)
  const sortedVaccines = [...vaccines].sort((a, b) => a.monthDue - b.monthDue);
  const nextVaccine = sortedVaccines.find(v => !v.completed);

  return (
    <div className="space-y-6 pb-24 animate-fade-in relative">
      
      {/* Notification Dropdown Overlay */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" 
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Graduation Modal (5 Years Old) */}
      {showGraduation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border-2 border-yellow-200 text-center">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                 <GraduationCap size={40} className="text-yellow-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-2">Mezuniyet Zamanı! 🎓</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                 <span className="font-bold text-slate-700">{profile.name}</span> artık 5 yaşında! 
                 Dünya Sağlık Örgütü (WHO) standartlarına göre yoğun gelişim takibi dönemi başarıyla tamamlandı.
              </p>

              <div className="bg-yellow-50 p-3 rounded-xl text-xs text-yellow-700 text-left space-y-2 mb-6 border border-yellow-100">
                 <div className="flex gap-2">
                    <Check size={14} className="mt-0.5" />
                    <span>WHO Gelişim Grafikleri tamamlandı.</span>
                 </div>
                 <div className="flex gap-2">
                    <Check size={14} className="mt-0.5" />
                    <span>Aşı takvimi 13 yaşa kadar devam edecek.</span>
                 </div>
                 <div className="flex gap-2">
                    <Check size={14} className="mt-0.5" />
                    <span>Anılar ve Günlük sonsuza kadar seninle!</span>
                 </div>
              </div>

              <button 
                  onClick={handleDismissGraduation}
                  className={`w-full bg-${themeColor}-500 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-95 transition-transform`}
              >
                  Harika, Büyümeye Devam!
              </button>
           </div>
        </div>
      )}

      {/* Security Info Modal */}
      {showSecurity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-white/50">
                <button onClick={() => setShowSecurity(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full p-1">
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm rotate-3">
                        <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Güvenlik Merkezi</h3>
                    <p className="text-xs text-slate-400 font-medium">Verileriniz nasıl korunuyor?</p>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                        <div className={`bg-${themeColor}-50 p-2 rounded-lg text-${themeColor}-500 mt-0.5`}>
                            <HardDrive size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-700">Cihaz İçi Depolama</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                                Tüm fotoğraflar, günlükler ve sağlık verileri sadece bu cihazın hafızasında (IndexedDB) saklanır. Hiçbir bulut sunucusuna gönderilmez.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <div className={`bg-${themeColor}-50 p-2 rounded-lg text-${themeColor}-500 mt-0.5`}>
                            <Lock size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-700">Şifreli Kayıt</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                                Veriler veritabanına kaydedilmeden önce özel algoritmalarla şifrelenir. Cihazınız çalınsa bile verilere doğrudan erişilemez.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <div className={`bg-${themeColor}-50 p-2 rounded-lg text-${themeColor}-500 mt-0.5`}>
                            <Cpu size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-700">AI Gizliliği</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                                Asistan ile yaptığınız konuşmalar, cevap üretilmesi için anlık olarak Google Gemini servisine iletilir ancak kaydedilmez.
                            </p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setShowSecurity(false)}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl mt-8 shadow-lg shadow-slate-200 active:scale-95 transition-transform"
                >
                    Güvendeyim, Devam Et
                </button>
            </div>
        </div>
      )}

      {/* Header Profile */}
      <div className={`relative bg-gradient-to-br from-${themeColor}-400 to-${themeColor}-300 text-white p-6 rounded-3xl shadow-lg shadow-${themeColor}-200/50 overflow-hidden z-30 transition-colors duration-500`}>
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className={`absolute bottom-0 left-0 w-24 h-24 bg-${themeColor}-600 opacity-10 rounded-full -ml-10 -mb-10 blur-xl`}></div>

        {!isEditing ? (
          <>
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center text-${themeColor}-400 text-2xl font-bold shadow-inner ring-4 ring-white/30 overflow-hidden relative`}>
                   {profile.photoUrl ? (
                     <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                   ) : (
                     profile.name.charAt(0)
                   )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
                  <p className={`text-${themeColor}-50 font-medium opacity-90`}>{ageData.chronoString}</p>
                  {ageData.correctedString && (
                     <div className={`flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md mt-1 w-fit`}>
                         <Baby size={10} className={`text-${themeColor}-100`} />
                         <p className={`text-[10px] text-${themeColor}-50`}>Düzeltilmiş: {ageData.correctedString}</p>
                     </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                 {/* Security Info Button */}
                 <button 
                  onClick={() => setShowSecurity(true)}
                  className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <ShieldCheck size={18} className="text-white" />
                </button>

                 {/* Notification Button */}
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm relative"
                >
                  <Bell size={18} className="text-white" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-rose-300 animate-pulse"></span>
                  )}
                </button>

                <button 
                  onClick={() => { setEditForm(profile); setIsEditing(true); }}
                  className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <Settings size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className={`absolute top-16 right-4 bg-white text-slate-800 p-4 rounded-2xl shadow-xl w-72 border border-${themeColor}-100 z-50 animate-fade-in origin-top-right`}>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-700">Bildirimler</h3>
                  <span className={`text-xs bg-${themeColor}-100 text-${themeColor}-600 px-2 py-0.5 rounded-full font-bold`}>{notifications.length}</span>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Şu an yeni bildirim yok.</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="flex gap-3 bg-slate-50 p-2.5 rounded-xl">
                        <div className={`mt-1 flex-shrink-0 ${
                            notif.type === 'birthday' ? 'text-purple-500' : 
                            notif.type === 'event' ? 'text-blue-500' :
                            `text-${themeColor}-500`
                        }`}>
                           {notif.type === 'birthday' ? <Gift size={16} /> : 
                            notif.type === 'event' ? <CalendarClock size={16} /> :
                            <AlertTriangle size={16} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{notif.title}</p>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5 whitespace-pre-wrap">{notif.message}</p>
                          {notif.type === 'vaccine' && (
                            <button 
                               onClick={() => onChangeView('health')}
                               className="text-[10px] text-blue-500 font-bold mt-1 hover:underline"
                            >
                              Takvime Git
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <p className={`text-xs text-${themeColor}-50 mb-1 font-medium`}>Son Kilo</p>
                <p className="text-xl font-bold tracking-wide">{latestGrowth?.weight || profile.weightAtBirth} kg</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <p className={`text-xs text-${themeColor}-50 mb-1 font-medium`}>Son Boy</p>
                <p className="text-xl font-bold tracking-wide">{latestGrowth?.height || profile.heightAtBirth} cm</p>
              </div>
            </div>
          </>
        ) : (
          <div className="relative z-10 animate-fade-in max-h-[80vh] overflow-y-auto no-scrollbar pb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">Profili Düzenle</h3>
              <button onClick={() => setIsEditing(false)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Photo Upload */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative group">
                   <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center overflow-hidden">
                      {editForm.photoUrl ? (
                        <img src={editForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-white font-bold">{editForm.name.charAt(0)}</span>
                      )}
                   </div>
                   
                   {/* Upload Button */}
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className={`absolute bottom-0 right-0 bg-white text-${themeColor}-500 p-2 rounded-full shadow-lg hover:bg-${themeColor}-50 transition-colors z-10`}
                   >
                     <Camera size={16} />
                   </button>

                   {/* Delete Button - Only if photo exists */}
                   {editForm.photoUrl && (
                     <button 
                       onClick={handleRemovePhoto}
                       className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                       title="Fotoğrafı Kaldır"
                     >
                       <Trash2 size={12} />
                     </button>
                   )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoChange} 
                />
              </div>

              <div>
                <label className={`text-xs text-${themeColor}-100 ml-1`}>Bebek Adı</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-white/90 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className={`text-xs text-${themeColor}-100 ml-1`}>Doğum Tarihi</label>
                    <input 
                      type="date" 
                      value={editForm.birthDate.split('T')[0]}
                      onChange={(e) => setEditForm({...editForm, birthDate: new Date(e.target.value).toISOString()})}
                      className="w-full bg-white/90 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className={`text-xs text-${themeColor}-100 ml-1`}>Cinsiyet</label>
                    <select 
                       value={editForm.gender}
                       onChange={(e) => setEditForm({...editForm, gender: e.target.value as 'boy' | 'girl'})}
                       className="w-full bg-white/90 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="boy">Erkek</option>
                      <option value="girl">Kız</option>
                    </select>
                 </div>
              </div>
              
              {/* Theme Color Selector */}
              <div>
                <label className={`text-xs text-${themeColor}-100 ml-1 mb-1 flex items-center gap-1`}>
                  <Palette size={12} />
                  Tema Rengi
                </label>
                <div className="bg-white/20 p-3 rounded-xl border border-white/20 flex gap-2 overflow-x-auto no-scrollbar">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setEditForm({...editForm, themeColor: color.id})}
                      className={`flex-shrink-0 w-8 h-8 rounded-full ${color.bgClass} flex items-center justify-center border-2 transition-all ${
                        (editForm.themeColor || (editForm.gender === 'boy' ? 'sky' : 'rose')) === color.id 
                          ? 'border-white scale-110 shadow-lg' 
                          : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      title={color.label}
                    >
                      {(editForm.themeColor || (editForm.gender === 'boy' ? 'sky' : 'rose')) === color.id && <Check size={14} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Premature Check */}
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                 <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="checkbox" 
                      id="isPremature"
                      checked={editForm.isPremature || false}
                      onChange={(e) => setEditForm({...editForm, isPremature: e.target.checked})}
                      className={`accent-${themeColor}-500 w-4 h-4 rounded`}
                    />
                    <label htmlFor="isPremature" className="text-sm text-white font-medium">Prematüre Doğum</label>
                 </div>
                 
                 {editForm.isPremature && (
                   <div>
                     <label className={`text-xs text-${themeColor}-100 ml-1`}>Doğum Haftası</label>
                     <input 
                       type="number" 
                       value={editForm.gestationalWeeks || 36}
                       min="24"
                       max="40"
                       onChange={(e) => setEditForm({...editForm, gestationalWeeks: parseInt(e.target.value)})}
                       className="w-full bg-white/90 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                       placeholder="Örn: 36"
                     />
                     <p className={`text-[10px] text-${themeColor}-100 mt-1`}>Düzeltilmiş yaş hesaplaması için gereklidir.</p>
                   </div>
                 )}
              </div>

              <button 
                onClick={handleSaveProfile}
                className={`w-full bg-white text-${themeColor}-500 font-bold py-2.5 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg`}
              >
                <Save size={16} />
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions / Status */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onChangeView('health')}
          className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start space-y-2 hover:border-${themeColor}-200 transition-all hover:shadow-md group`}
        >
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
            <Syringe size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-sm">Sıradaki Aşı</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
              {nextVaccine ? nextVaccine.name : 'Tümü Tamamlandı'}
            </p>
          </div>
        </button>

        <button 
          onClick={() => onChangeView('growth')}
          className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start space-y-2 hover:border-${themeColor}-200 transition-all hover:shadow-md group`}
        >
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-sm">Gelişim</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {latestGrowth ? new Date(latestGrowth.date).toLocaleDateString('tr-TR') : 'Kayıt yok'}
            </p>
          </div>
        </button>
      </div>

      {/* Recent Memories */}
      <div>
        <div className="flex justify-between items-end mb-4 px-1">
          <div>
            <h2 className="text-lg font-bold text-slate-700">Son Anılar</h2>
            <p className="text-xs text-slate-400">Unutulmaz anları biriktirin</p>
          </div>
          <button onClick={() => onChangeView('diary')} className={`text-xs text-${themeColor}-500 font-bold bg-${themeColor}-50 px-3 py-1 rounded-full hover:bg-${themeColor}-100 transition-colors`}>
            Tümünü Gör
          </button>
        </div>
        
        <div className="space-y-4">
          {recentEntries.length === 0 ? (
             <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                 <Calendar size={20} />
               </div>
               <p className="text-slate-500 text-sm font-medium">Henüz bir anı eklenmedi.</p>
               <button onClick={() => onChangeView('diary')} className={`mt-2 text-${themeColor}-500 text-xs font-bold`}>İlk anıyı ekle</button>
             </div>
          ) : (
            recentEntries.slice(0, 3).map(entry => (
              <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex space-x-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onChangeView('diary')}>
                {entry.mediaUrl && (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
                    <img src={entry.mediaUrl} alt="memory" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                <div className="flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-[10px] font-bold text-${themeColor}-400 bg-${themeColor}-50 px-2 py-0.5 rounded-md flex items-center gap-1`}>
                      <Calendar size={10} />
                      {new Date(entry.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 mt-2 line-clamp-2 font-medium leading-relaxed">{entry.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Bolt ⚡: Memoizing DashboardView.
// Why: This component is complex and receives many props from the root App component.
// `React.memo` prevents it from re-rendering if its props haven't changed, avoiding
// costly re-calculations of age, notifications, etc. This is a huge win because many
// state changes in App.tsx (like navigating views) don't affect DashboardView's props.
// Impact: Significantly reduces re-renders of the main dashboard, making the app feel snappier.
export default React.memo(DashboardView);
