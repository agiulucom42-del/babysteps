
import React, { useState, useMemo } from 'react';
import { GrowthRecord, Milestone, BabyProfile, ThemeProps } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Ruler, CheckCircle2, Circle, Trophy, Activity } from 'lucide-react';
import { WHO_STANDARDS } from '../constants';

// ⚡ Performance Optimization:
// Pre-calculate WHO standard month keys once outside the component.
// This avoids redundant Object.keys() and sorting on every render and within loops.
const AVAILABLE_WHO_MONTHS = Object.keys(WHO_STANDARDS).map(Number).sort((a, b) => a - b);

interface GrowthViewProps extends ThemeProps {
  profile: BabyProfile;
  records: GrowthRecord[];
  milestones: Milestone[];
  onAddRecord: (record: GrowthRecord) => void;
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (milestone: Milestone) => void;
}

// ⚡ Performance Optimization:
// Wrapped GrowthView with React.memo to prevent unnecessary re-renders.
// This is effective because parent (App.tsx) passes memoized callbacks.
const GrowthView: React.FC<GrowthViewProps> = React.memo(({ profile, records, milestones, onAddRecord, onToggleMilestone, onAddMilestone, themeColor }) => {
  const [activeTab, setActiveTab] = useState<'charts' | 'milestones'>('charts');
  
  // Chart Logic State
  const [showWhoStandards, setShowWhoStandards] = useState(true);

  // Chart Form State
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Milestone Form State
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mMonth, setMMonth] = useState('');
  const [mCategory, setMCategory] = useState<Milestone['category']>('motor');

  // ⚡ Performance Optimization:
  // Memoize chartData calculation. It only needs to re-run when records or profile changes.
  // The logic also uses the pre-calculated AVAILABLE_WHO_MONTHS for efficiency.
  const chartData = useMemo(() => {
    // Prepare data with WHO references
    const getMonthsBetween = (d1: Date, d2: Date) => {
        let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
        // Adjust for partial months (simple approximation)
        if (d2.getDate() < d1.getDate()) months--;
        return Math.max(0, months);
    };

    return [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => {
         const date = new Date(r.date);
         const birthDate = new Date(profile.birthDate);
         const ageInMonths = getMonthsBetween(birthDate, date);

         // Find closest WHO standard
         // If exact month missing, fallback to closest lower or 0
         let lookupMonth = ageInMonths;

         if (!WHO_STANDARDS[lookupMonth]) {
            // Find closest available month key that is less than or equal to current age
            const closest = AVAILABLE_WHO_MONTHS.filter(m => m <= ageInMonths).pop();
            lookupMonth = closest !== undefined ? closest : 0;
         }

         const standards = WHO_STANDARDS[lookupMonth]?.[profile.gender] || WHO_STANDARDS[0][profile.gender];

         return {
            ...r,
            formattedDate: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
            // Weight Percentiles (P3, P50, P97)
            w3: standards.w[0],
            w50: standards.w[1],
            w97: standards.w[2],
            // Height Percentiles
            h3: standards.h[0],
            h50: standards.h[1],
            h97: standards.h[2],
         };
      });
  }, [records, profile.birthDate, profile.gender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height) return;

    onAddRecord({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight: parseFloat(weight),
      height: parseFloat(height)
    });

    setWeight('');
    setHeight('');
    setShowForm(false);
  };

  const handleMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle || !mMonth) return;

    onAddMilestone({
      id: Date.now().toString(),
      title: mTitle,
      expectedMonth: parseInt(mMonth),
      category: mCategory,
      isCompleted: false
    });

    setMTitle('');
    setMMonth('');
    setMCategory('motor');
    setShowMilestoneForm(false);
  };

  // ⚡ Performance Optimization:
  // Memoize milestones grouping and sorting to avoid redundant filtering on every render.
  const { completedCount, progressPercentage, sortedMilestones } = useMemo(() => {
    const completed = milestones.filter(m => m.isCompleted).length;
    const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
    const sorted = [...milestones].sort((a, b) => a.expectedMonth - b.expectedMonth);

    return {
      completedCount: completed,
      progressPercentage: progress,
      sortedMilestones: sorted
    };
  }, [milestones]);

  return (
    <div className="pb-24 space-y-6">
      
      {/* Header & Tabs */}
      <div>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Gelişim Takibi</h2>
        <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'charts' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Grafikler
          </button>
          <button 
            onClick={() => setActiveTab('milestones')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'milestones' ? `bg-white text-${themeColor}-500 shadow-sm` : 'text-slate-400'}`}
          >
            Dönüm Noktaları
          </button>
        </div>
      </div>

      {activeTab === 'charts' ? (
        <div className="space-y-8 animate-fade-in">
          
          <div className="flex justify-between items-center">
             {/* WHO Standards Toggle */}
             <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <button 
                   onClick={() => setShowWhoStandards(!showWhoStandards)}
                   className={`relative w-8 h-4 rounded-full transition-colors ${showWhoStandards ? `bg-${themeColor}-500` : 'bg-slate-300'}`}
                >
                   <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${showWhoStandards ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
                <span className="text-[10px] font-bold text-slate-500">WHO Standartları</span>
             </div>

             <button 
               onClick={() => setShowForm(!showForm)}
               className={`flex items-center gap-2 bg-${themeColor}-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-${themeColor}-200`}
             >
               <Plus size={16} />
               <span>Veri Ekle</span>
             </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className={`bg-white p-5 rounded-2xl shadow-lg border border-${themeColor}-100 space-y-4 animate-fade-in`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Kilo (kg)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={weight} 
                    onChange={e => setWeight(e.target.value)}
                    className={`w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-${themeColor}-200`}
                    placeholder="Örn: 5.4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Boy (cm)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={height} 
                    onChange={e => setHeight(e.target.value)}
                    className={`w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-${themeColor}-200`}
                    placeholder="Örn: 60"
                    required
                  />
                </div>
              </div>
              <button type="submit" className={`w-full bg-${themeColor}-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-${themeColor}-600 transition-colors`}>
                Kaydet
              </button>
            </form>
          )}

          {/* Weight Chart */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <Ruler size={18} />
              </div>
              <h3 className="font-bold text-slate-700">Kilo Grafiği (kg)</h3>
            </div>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number, name: string) => {
                      let label = name;
                      if (name === '3%') label = '3. Persentil (Alt Sınır)';
                      if (name === '50%') label = '50. Persentil (Ortalama)';
                      if (name === '97%') label = '97. Persentil (Üst Sınır)';
                      return [`${value} kg`, label];
                    }}
                  />
                  <Legend iconType="plainline" />
                  
                  {/* User Data */}
                  <Line name="Bebek" type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{fill: '#3b82f6', r: 4, stroke: '#fff'}} activeDot={{r: 6}} />
                  
                  {/* WHO Standards */}
                  {showWhoStandards && (
                    <>
                      <Line name="97%" type="monotone" dataKey="w97" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                      <Line name="50%" type="monotone" dataKey="w50" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                      <Line name="3%" type="monotone" dataKey="w3" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Height Chart */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                <Ruler size={18} />
              </div>
              <h3 className="font-bold text-slate-700">Boy Grafiği (cm)</h3>
            </div>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                     contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                     formatter={(value: number, name: string) => {
                      let label = name;
                      if (name === '3%') label = '3. Persentil (Alt Sınır)';
                      if (name === '50%') label = '50. Persentil (Ortalama)';
                      if (name === '97%') label = '97. Persentil (Üst Sınır)';
                      return [`${value} cm`, label];
                    }}
                  />
                  <Legend iconType="plainline" />
                  
                  {/* User Data */}
                  <Line name="Bebek" type="monotone" dataKey="height" stroke="#22c55e" strokeWidth={3} dot={{fill: '#22c55e', r: 4, stroke: '#fff'}} activeDot={{r: 6}} />

                  {/* WHO Standards */}
                  {showWhoStandards && (
                    <>
                      <Line name="97%" type="monotone" dataKey="h97" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                      <Line name="50%" type="monotone" dataKey="h50" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                      <Line name="3%" type="monotone" dataKey="h3" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-end">
            <button 
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className={`flex items-center gap-2 bg-${themeColor}-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-${themeColor}-200`}
            >
              <Plus size={16} />
              <span>Dönüm Noktası Ekle</span>
            </button>
          </div>

          {showMilestoneForm && (
            <form onSubmit={handleMilestoneSubmit} className={`bg-white p-5 rounded-2xl shadow-lg border border-${themeColor}-100 space-y-4 animate-fade-in`}>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Başlık</label>
                <input 
                  type="text" 
                  value={mTitle} 
                  onChange={e => setMTitle(e.target.value)}
                  className={`w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                  placeholder="Örn: İlk Diş"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Beklenen Ay</label>
                  <input 
                    type="number" 
                    value={mMonth} 
                    onChange={e => setMMonth(e.target.value)}
                    className={`w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                    placeholder="Örn: 6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Kategori</label>
                  <select 
                    value={mCategory} 
                    onChange={e => setMCategory(e.target.value as any)}
                    className={`w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-${themeColor}-200 text-sm`}
                  >
                    <option value="motor">Motor Gelişim</option>
                    <option value="social">Sosyal</option>
                    <option value="language">Dil</option>
                    <option value="cognitive">Bilişsel</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={`w-full bg-${themeColor}-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-${themeColor}-600 transition-colors`}>
                Kaydet
              </button>
            </form>
          )}

          {/* Progress Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-lg">Gelişim Yolculuğu</h3>
                   <p className="text-indigo-100 text-xs opacity-90">Harika gidiyorsunuz!</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                   <Trophy size={20} className="text-yellow-300" />
                </div>
             </div>
             <div className="w-full bg-black/20 rounded-full h-3 mb-2">
                <div className="bg-white h-3 rounded-full transition-all duration-1000" style={{width: `${progressPercentage}%`}}></div>
             </div>
             <p className="text-right text-xs font-bold">{completedCount} / {milestones.length} Tamamlandı</p>
          </div>

          {/* Timeline List */}
          <div className="space-y-4">
             {sortedMilestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  onClick={() => onToggleMilestone(milestone.id)}
                  className={`relative bg-white p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-start gap-4 ${milestone.isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-100'}`}
                >
                   {/* Connection Line */}
                   <div className="absolute left-[27px] -top-6 bottom-0 w-0.5 bg-slate-100 -z-10 last:hidden"></div>

                   <button className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${milestone.isCompleted ? 'text-green-500' : 'text-slate-300'}`}>
                      {milestone.isCompleted ? <CheckCircle2 size={24} className="fill-green-100" /> : <Circle size={24} />}
                   </button>
                   
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h4 className={`font-bold text-sm ${milestone.isCompleted ? 'text-slate-800' : 'text-slate-600'}`}>
                           {milestone.title}
                         </h4>
                         <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                           {milestone.expectedMonth}. Ay
                         </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-medium">{milestone.category}</p>
                      
                      {milestone.isCompleted && milestone.dateCompleted && (
                         <p className="text-xs text-green-600 mt-2 font-medium">
                           Tamamlandı: {new Date(milestone.dateCompleted).toLocaleDateString('tr-TR')}
                         </p>
                      )}
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      <div className={`bg-${themeColor}-50 p-4 rounded-2xl border border-${themeColor}-100`}>
        <p className={`text-sm text-${themeColor}-700 leading-relaxed text-center`}>
          <span className="font-bold">Not:</span> Kesikli çizgiler WHO (Dünya Sağlık Örgütü) standartlarına göre persentil değerlerini (3%, 50%, 97%) gösterir.
        </p>
      </div>
    </div>
  );
});

export default GrowthView;