
import React, { useState, useRef } from 'react';
import { Vaccine, CalendarEvent, MedicalHistoryItem, MedicalDocument, ThemeProps } from '../types';
import { Check, Clock, AlertCircle, Calendar, Plus, Stethoscope, ToyBrick, MoreHorizontal, Trash2, AlertTriangle, Activity, Scissors, FileText, FlaskConical, Scan, Pill, Upload, X, Eye } from 'lucide-react';

interface HealthViewProps extends ThemeProps {
  vaccines: Vaccine[];
  customEvents: CalendarEvent[];
  medicalHistory: MedicalHistoryItem[];
  documents?: MedicalDocument[];
  onToggleVaccine: (id: string) => void;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onAddHistory: (item: MedicalHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onAddDocument?: (doc: MedicalDocument) => void;
  onDeleteDocument?: (id: string) => void;
}

const HealthView: React.FC<HealthViewProps> = ({ 
    vaccines, customEvents, medicalHistory, documents = [], 
    onToggleVaccine, onAddEvent, onDeleteEvent, 
    onAddHistory, onDeleteHistory, onAddDocument, onDeleteDocument,
    themeColor 
}) => {
  const [activeTab, setActiveTab] = useState<'vaccines' | 'events' | 'history' | 'documents'>('vaccines');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  
  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('doctor');
  const [eventNotes, setEventNotes] = useState('');

  // History Form State
  const [histCategory, setHistCategory] = useState<MedicalHistoryItem['category']>('condition');
  const [histTitle, setHistTitle] = useState('');
  const [histDate, setHistDate] = useState('');
  const [histNotes, setHistNotes] = useState('');

  // Document Form State
  const [docTitle, setDocTitle] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [docType, setDocType] = useState<MedicalDocument['type']>('lab');
  const [docFile, setDocFile] = useState<string | null>(null);
  const [docNotes, setDocNotes] = useState('');
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group vaccines by month
  const groupedVaccines = vaccines.reduce((acc, vaccine) => {
    const key = vaccine.monthDue;
    if (!acc[key]) acc[key] = [];
    acc[key].push(vaccine);
    return acc;
  }, {} as Record<number, Vaccine[]>);

  const months = Object.keys(groupedVaccines).map(Number).sort((a, b) => a - b);

  // Filter and Sort Events
  const upcomingEvents = customEvents
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = customEvents
    .filter(e => new Date(e.date) < new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddEvent = () => {
    if (!eventTitle || !eventDate) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      date: new Date(eventDate).toISOString(),
      type: eventType,
      notes: eventNotes
    };

    onAddEvent(newEvent);
    
    // Reset Form
    setEventTitle('');
    setEventDate('');
    setEventNotes('');
    setEventType('doctor');
    setShowEventForm(false);
  };

  const handleAddHistory = () => {
    if (!histTitle) return;

    const newItem: MedicalHistoryItem = {
        id: Date.now().toString(),
        category: histCategory,
        title: histTitle,
        date: histDate ? new Date(histDate).toISOString() : undefined,
        notes: histNotes
    };

    onAddHistory(newItem);

    // Reset
    setHistTitle('');
    setHistDate('');
    setHistNotes('');
    setShowHistoryForm(false);
  };

  // Document Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
          setDocFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = () => {
      if (!docTitle || !docFile || !onAddDocument) return;

      const newDoc: MedicalDocument = {
          id: Date.now().toString(),
          title: docTitle,
          date: new Date(docDate).toISOString(),
          type: docType,
          fileUrl: docFile,
          notes: docNotes
      };

      onAddDocument(newDoc);
      
      // Reset
      setDocTitle('');
      setDocDate(new Date().toISOString().split('T')[0]);
      setDocType('lab');
      setDocFile(null);
      setDocNotes('');
      setShowDocForm(false);
  };

  const getCategoryStyle = (cat: string) => {
      switch(cat) {
          case 'allergy': return { 
              icon: <AlertTriangle size={24} />, 
              bg: 'bg-red-50', 
              text: 'text-red-500', 
              border: 'border-red-100',
              badge: 'bg-red-100 text-red-600',
              label: 'Alerji' 
          };
          case 'surgery': return { 
              icon: <Scissors size={24} />, 
              bg: 'bg-blue-50', 
              text: 'text-blue-500', 
              border: 'border-blue-100',
              badge: 'bg-blue-100 text-blue-600',
              label: 'Cerrahi / İşlem' 
          };
          case 'condition': default: return { 
              icon: <Activity size={24} />, 
              bg: 'bg-amber-50', 
              text: 'text-amber-500', 
              border: 'border-amber-100',
              badge: 'bg-amber-100 text-amber-600',
              label: 'Hastalık / Durum' 
          };
      }
  };

  const getDocTypeStyle = (type: string) => {
    switch (type) {
        case 'lab': return { icon: <FlaskConical size={20} />, label: 'Tahlil', color: 'text-emerald-500', bg: 'bg-emerald-50' };
        case 'imaging': return { icon: <Scan size={20} />, label: 'Röntgen/Film', color: 'text-slate-600', bg: 'bg-slate-200' };
        case 'prescription': return { icon: <Pill size={20} />, label: 'Reçete', color: 'text-rose-500', bg: 'bg-rose-50' };
        case 'report': default: return { icon: <FileText size={20} />, label: 'Rapor', color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };

  return (
    <div className="pb-24 space-y-6 relative">
      <h2 className="text-2xl font-bold text-slate-700">Takvim ve Sağlık</h2>

      <div className="flex p-1 bg-slate-100 rounded-xl mb-4 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('vaccines')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'vaccines' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Aşılar
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'events' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Etkinlikler
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Geçmiş
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'documents' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Belgeler
          </button>
      </div>

      {activeTab === 'vaccines' && (
        <>
          <div className="space-y-6 animate-fade-in">
            {months.map((month) => (
              <div key={month} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-600">
                    {month === 0 ? 'Doğumda' : `${month}. Ayın Sonu`}
                  </h3>
                  {groupedVaccines[month].every(v => v.completed) && (
                     <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Tamamlandı</span>
                  )}
                </div>
                
                <div className="divide-y divide-slate-50">
                  {groupedVaccines[month].map((vaccine) => (
                    <div key={vaccine.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                      <button 
                        onClick={() => onToggleVaccine(vaccine.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          vaccine.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : `border-slate-300 text-transparent hover:border-${themeColor}-300`
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium text-sm ${vaccine.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {vaccine.name}
                          </h4>
                        </div>
                        {vaccine.description && (
                          <p className="text-xs text-slate-400 mt-1">{vaccine.description}</p>
                        )}
                        
                        {!vaccine.completed && (
                           <div className={`mt-2 flex items-center text-${themeColor}-500 text-xs font-medium`}>
                             <AlertCircle size={12} className="mr-1" />
                             <span>Bekleniyor</span>
                           </div>
                        )}
                        
                        {vaccine.completed && vaccine.dateCompleted && (
                          <div className="mt-1 flex items-center text-green-600 text-xs">
                            <Clock size={12} className="mr-1" />
                            <span>Yapıldı: {new Date(vaccine.dateCompleted).toLocaleDateString('tr-TR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
           <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-700 leading-relaxed text-center">
              Bu liste Sağlık Bakanlığı aşı takvimine göre genel bir rehberdir. Lütfen doktorunuzun önerilerini takip ediniz.
            </p>
          </div>
        </>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-end">
            <button 
              onClick={() => setShowEventForm(!showEventForm)}
              className={`flex items-center gap-2 bg-${themeColor}-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-${themeColor}-200`}
            >
              <Plus size={16} />
              <span>Etkinlik Ekle</span>
            </button>
          </div>

          {showEventForm && (
            <div className={`bg-white p-5 rounded-2xl shadow-lg border border-${themeColor}-100 space-y-4 animate-fade-in`}>
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Başlık</label>
                  <input 
                    type="text" 
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                    placeholder="Örn: Doktor Kontrolü"
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">Tarih</label>
                    <input 
                      type="date" 
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">Tür</label>
                    <select 
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as any)}
                      className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                    >
                      <option value="doctor">Doktor</option>
                      <option value="playdate">Oyun</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Notlar (İsteğe bağlı)</label>
                  <textarea 
                    rows={2}
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                    className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm resize-none`}
                    placeholder="Yanına aşı kartını al..."
                  />
               </div>

               <div className="flex gap-2">
                 <button 
                   onClick={() => setShowEventForm(false)}
                   className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs"
                 >
                   İptal
                 </button>
                 <button 
                   onClick={handleAddEvent}
                   className={`flex-1 py-3 bg-${themeColor}-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-${themeColor}-200`}
                 >
                   Kaydet
                 </button>
               </div>
            </div>
          )}

          {upcomingEvents.length === 0 && pastEvents.length === 0 && !showEventForm && (
            <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-slate-200">
              <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm">Henüz planlanmış bir etkinlik yok.</p>
            </div>
          )}

          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Yaklaşanlar</h3>
              {upcomingEvents.map(event => (
                 <div key={event.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                       event.type === 'doctor' ? 'bg-blue-100 text-blue-500' :
                       event.type === 'playdate' ? 'bg-yellow-100 text-yellow-600' :
                       'bg-purple-100 text-purple-500'
                    }`}>
                       {event.type === 'doctor' && <Stethoscope size={18} />}
                       {event.type === 'playdate' && <ToyBrick size={18} />}
                       {event.type === 'other' && <MoreHorizontal size={18} />}
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-700 text-sm">{event.title}</h4>
                       <p className={`text-xs text-${themeColor}-500 font-bold mt-1 bg-${themeColor}-50 w-fit px-2 py-0.5 rounded-md`}>
                          {new Date(event.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                       </p>
                       {event.notes && <p className="text-xs text-slate-400 mt-2">{event.notes}</p>}
                    </div>
                    <button 
                      onClick={() => onDeleteEvent(event.id)}
                      className="text-slate-300 hover:text-red-400 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
              ))}
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-3 opacity-70">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1 mt-6">Geçmiş</h3>
              {pastEvents.map(event => (
                 <div key={event.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-200 text-slate-500 grayscale">
                       {event.type === 'doctor' && <Stethoscope size={18} />}
                       {event.type === 'playdate' && <ToyBrick size={18} />}
                       {event.type === 'other' && <MoreHorizontal size={18} />}
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-600 text-sm line-through">{event.title}</h4>
                       <p className="text-xs text-slate-400 mt-1">
                          {new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                       </p>
                    </div>
                    <button 
                      onClick={() => onDeleteEvent(event.id)}
                      className="text-slate-300 hover:text-red-400 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
              <div className="flex justify-end">
                  <button 
                    onClick={() => setShowHistoryForm(!showHistoryForm)}
                    className={`flex items-center gap-2 bg-${themeColor}-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-${themeColor}-200`}
                  >
                    <Plus size={16} />
                    <span>Kayıt Ekle</span>
                  </button>
              </div>

              {showHistoryForm && (
                  <div className={`bg-white p-5 rounded-2xl shadow-lg border border-${themeColor}-100 space-y-4 animate-fade-in`}>
                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">Kategori</label>
                          <div className="flex gap-2">
                              {['condition', 'allergy', 'surgery'].map((cat) => {
                                 const style = getCategoryStyle(cat);
                                 const isSelected = histCategory === cat;
                                 return (
                                     <button 
                                       key={cat}
                                       onClick={() => setHistCategory(cat as any)} 
                                       className={`flex-1 py-3 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-2 border ${
                                           isSelected 
                                           ? `bg-white ${style.text} ${style.border} shadow-md ring-2 ring-opacity-50 ring-${style.text.split('-')[1]}-200` 
                                           : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                                       }`}
                                     >
                                         <div className={`${isSelected ? 'scale-110' : 'grayscale opacity-70'} transition-transform duration-300`}>
                                           {style.icon}
                                         </div>
                                         <span className="text-[10px] tracking-tight">{style.label}</span>
                                     </button>
                                 )
                              })}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1">Başlık</label>
                          <input 
                            type="text" 
                            value={histTitle}
                            onChange={(e) => setHistTitle(e.target.value)}
                            className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                            placeholder={histCategory === 'allergy' ? 'Örn: Fıstık Alerjisi' : 'Örn: Su Çiçeği'}
                          />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1">Tarih (İsteğe bağlı)</label>
                          <input 
                            type="date" 
                            value={histDate}
                            onChange={(e) => setHistDate(e.target.value)}
                            className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                          />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1">Notlar</label>
                          <textarea 
                            rows={2}
                            value={histNotes}
                            onChange={(e) => setHistNotes(e.target.value)}
                            className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm resize-none`}
                            placeholder="Detaylar..."
                          />
                      </div>

                      <div className="flex gap-2">
                          <button 
                            onClick={() => setShowHistoryForm(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs"
                          >
                            İptal
                          </button>
                          <button 
                            onClick={handleAddHistory}
                            className={`flex-1 py-3 bg-${themeColor}-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-${themeColor}-200`}
                          >
                            Kaydet
                          </button>
                      </div>
                  </div>
              )}

              <div className="space-y-3">
                  {medicalHistory.length === 0 ? (
                      <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                          <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                          <p className="text-slate-400 text-sm">Medikal geçmiş kaydı yok.</p>
                      </div>
                  ) : (
                      medicalHistory.map(item => {
                          const style = getCategoryStyle(item.category);
                          return (
                            <div key={item.id} className={`p-4 rounded-2xl shadow-sm border flex items-start gap-4 transition-all hover:shadow-md ${style.bg} bg-opacity-30 border-${style.text.split('-')[1]}-100`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm ${style.text}`}>
                                    {style.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${style.badge}`}>
                                          {style.label}
                                      </span>
                                    </div>
                                    
                                    {item.date && (
                                        <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    )}
                                    
                                    {item.notes && <p className="text-xs text-slate-500 mt-2 bg-white/50 p-2 rounded-lg">{item.notes}</p>}
                                </div>
                                <button 
                                  onClick={() => onDeleteHistory(item.id)}
                                  className="text-slate-300 hover:text-red-400 p-2 bg-white/50 rounded-full"
                                >
                                  <Trash2 size={16} />
                                </button>
                            </div>
                          );
                      })
                  )}
              </div>
          </div>
      )}

      {activeTab === 'documents' && (
          <div className="space-y-6 animate-fade-in">
              <div className="flex justify-end">
                  <button 
                    onClick={() => setShowDocForm(!showDocForm)}
                    className={`flex items-center gap-2 bg-${themeColor}-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-${themeColor}-200`}
                  >
                    <Upload size={16} />
                    <span>Belge Yükle</span>
                  </button>
              </div>

              {showDocForm && (
                  <div className={`bg-white p-5 rounded-2xl shadow-lg border border-${themeColor}-100 space-y-4 animate-fade-in`}>
                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">Tür</label>
                          <div className="grid grid-cols-2 gap-2">
                              {['lab', 'imaging', 'prescription', 'report'].map((t) => {
                                  const style = getDocTypeStyle(t);
                                  const isSelected = docType === t;
                                  return (
                                      <button 
                                        key={t}
                                        onClick={() => setDocType(t as any)}
                                        className={`p-2 rounded-xl flex items-center gap-2 border transition-all ${isSelected ? `${style.bg} ${style.color} border-current shadow-sm` : 'bg-slate-50 border-transparent text-slate-400'}`}
                                      >
                                          {style.icon}
                                          <span className="text-xs font-bold">{style.label}</span>
                                      </button>
                                  )
                              })}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1">Belge Adı</label>
                          <input 
                            type="text" 
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                            placeholder="Örn: 6. Ay Kan Tahlili"
                          />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1">Tarih</label>
                          <input 
                            type="date" 
                            value={docDate}
                            onChange={(e) => setDocDate(e.target.value)}
                            className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                          />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1">Dosya (Fotoğraf)</label>
                          <div 
                              onClick={() => fileInputRef.current?.click()}
                              className={`w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors ${docFile ? 'bg-slate-50' : ''}`}
                          >
                              {docFile ? (
                                  <img src={docFile} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                              ) : (
                                  <>
                                      <Upload size={24} className="text-slate-300 mb-2" />
                                      <span className="text-xs text-slate-400">Fotoğraf Seç</span>
                                  </>
                              )}
                          </div>
                          <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileChange}
                          />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 ml-1">Notlar</label>
                          <textarea 
                            rows={2}
                            value={docNotes}
                            onChange={(e) => setDocNotes(e.target.value)}
                            className={`w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-${themeColor}-200 text-sm resize-none`}
                            placeholder="Değerler normal mi?"
                          />
                      </div>

                      <div className="flex gap-2">
                          <button 
                            onClick={() => setShowDocForm(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs"
                          >
                            İptal
                          </button>
                          <button 
                            onClick={handleAddDocument}
                            disabled={!docTitle || !docFile}
                            className={`flex-1 py-3 bg-${themeColor}-500 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-lg shadow-${themeColor}-200`}
                          >
                            Yükle
                          </button>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  {documents.length === 0 ? (
                      <div className="col-span-2 text-center py-10 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                          <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                          <p className="text-slate-400 text-sm">Henüz yüklenen belge yok.</p>
                      </div>
                  ) : (
                      documents.map(doc => {
                          const style = getDocTypeStyle(doc.type);
                          return (
                              <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-all group">
                                  <div 
                                      className="h-32 bg-slate-100 relative cursor-pointer overflow-hidden"
                                      onClick={() => setPreviewDoc(doc)}
                                  >
                                      <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                      <div className={`absolute top-2 left-2 p-1.5 rounded-lg ${style.bg} ${style.color} shadow-sm backdrop-blur-sm bg-opacity-90`}>
                                          {style.icon}
                                      </div>
                                  </div>
                                  <div className="p-3 flex-1 flex flex-col">
                                      <h4 className="text-sm font-bold text-slate-700 line-clamp-1">{doc.title}</h4>
                                      <p className="text-xs text-slate-400 mt-1">
                                          {new Date(doc.date).toLocaleDateString('tr-TR')}
                                      </p>
                                      <div className="mt-auto pt-3 flex justify-between items-center">
                                          <button 
                                              onClick={() => setPreviewDoc(doc)}
                                              className={`text-xs font-bold text-${themeColor}-500 hover:underline`}
                                          >
                                              Görüntüle
                                          </button>
                                          {onDeleteDocument && (
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                                                  className="text-slate-300 hover:text-red-400"
                                              >
                                                  <Trash2 size={16} />
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )
                      })
                  )}
              </div>
          </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="relative w-full max-w-lg bg-transparent flex flex-col items-center">
                  <button 
                      onClick={() => setPreviewDoc(null)}
                      className="absolute -top-12 right-0 text-white/70 hover:text-white bg-white/10 p-2 rounded-full"
                  >
                      <X size={24} />
                  </button>
                  
                  <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-h-[70vh] w-auto rounded-lg shadow-2xl mb-4" />
                  
                  <div className="bg-white w-full rounded-2xl p-5 shadow-xl">
                      <div className="flex items-center gap-3 mb-2">
                          {getDocTypeStyle(previewDoc.type).icon}
                          <h3 className="text-lg font-bold text-slate-800">{previewDoc.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                          <span className="font-bold">Tarih:</span> {new Date(previewDoc.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {previewDoc.notes && (
                          <div className="bg-slate-50 p-3 rounded-xl mt-3 text-sm text-slate-600">
                              {previewDoc.notes}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HealthView;
