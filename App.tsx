
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import DashboardView from './views/DashboardView';
import DiaryView from './views/DiaryView';
import HealthView from './views/HealthView';
import GrowthView from './views/GrowthView';
import AiAssistantView from './views/AiAssistantView';
import PinLock from './components/PinLock';
import Onboarding from './components/Onboarding'; 
import ConfirmationModal from './components/ConfirmationModal';
import { ViewState, DiaryEntry, GrowthRecord, Vaccine, BabyProfile, Milestone, CalendarEvent, MedicalHistoryItem, MedicalDocument } from './types';
import { INITIAL_PROFILE, INITIAL_GROWTH, INITIAL_ENTRIES, INITIAL_VACCINES, INITIAL_MILESTONES, INITIAL_EVENTS, INITIAL_MEDICAL_HISTORY, INITIAL_DOCUMENTS } from './constants';
import { storageService, AppData } from './services/storageService';

const App: React.FC = () => {
  // App State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Security & Loading State
  const [showOnboarding, setShowOnboarding] = useState(false); 
  const [isLocked, setIsLocked] = useState(true); 
  const [hasPin, setHasPin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Data State
  const [profile, setProfile] = useState<BabyProfile>(INITIAL_PROFILE);
  const [entries, setEntries] = useState<DiaryEntry[]>(INITIAL_ENTRIES);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(INITIAL_GROWTH);
  const [vaccines, setVaccines] = useState<Vaccine[]>(INITIAL_VACCINES);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>(INITIAL_MEDICAL_HISTORY);
  const [documents, setDocuments] = useState<MedicalDocument[]>(INITIAL_DOCUMENTS);

  // Derived Theme Color: Use user preference first, otherwise fallback to gender logic
  const themeColor = profile.themeColor || (profile.gender === 'boy' ? 'sky' : 'rose');

  // 1. Initial Load Effect (Async)
  useEffect(() => {
    const initApp = async () => {
      // Check First Launch
      const firstLaunch = storageService.isFirstLaunch();
      if (firstLaunch) {
        setShowOnboarding(true);
        setIsLocked(false); 
      } else {
        // Normal Flow: Check PIN
        const pinExists = storageService.hasPin();
        setHasPin(pinExists);
        if (!pinExists) {
          setIsLocked(false);
        }
      }

      try {
        const savedData = await storageService.loadData();
        if (savedData && savedData.profile) {
          setProfile(savedData.profile);
          setEntries(savedData.entries || []);
          setGrowthRecords(savedData.growthRecords || []);
          setVaccines(savedData.vaccines || []);
          setMilestones(savedData.milestones || []);
          setCustomEvents(savedData.customEvents || []);
          setMedicalHistory(savedData.medicalHistory || []);
          setDocuments(savedData.documents || []);
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoaded(true);
      }
    };

    initApp();
  }, []);

  // 2. Auto-Save Effect
  useEffect(() => {
    if (isLoaded && !isLocked && !showOnboarding) { 
      const dataToSave: AppData = {
        profile,
        entries,
        growthRecords,
        vaccines,
        milestones,
        customEvents,
        medicalHistory,
        documents
      };
      
      const timer = setTimeout(() => {
         storageService.saveData(dataToSave).catch(e => console.error("Auto-save failed", e));
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [profile, entries, growthRecords, vaccines, milestones, customEvents, medicalHistory, documents, isLoaded, isLocked, showOnboarding]);

  // Security Handlers
  const handlePinSuccess = (pin: string) => {
    if (!hasPin) {
      storageService.setPin(pin);
      setHasPin(true);
      setIsLocked(false);
    } else {
      if (storageService.verifyPin(pin)) {
        setIsLocked(false);
      }
    }
  };

  const openResetModal = () => setIsResetModalOpen(true);
  const closeResetModal = () => setIsResetModalOpen(false);
  
  const handleResetApp = async () => {
      await storageService.clearData();
      window.location.reload();
  };

  const handleOnboardingComplete = () => {
    storageService.setLaunched();
    setShowOnboarding(false);
    setIsLocked(false); 
    setHasPin(false);
  };

  // --- Handlers ---
  const handleUpdateProfile = (updatedProfile: BabyProfile) => setProfile(updatedProfile);
  const handleAddEntry = (entry: DiaryEntry) => setEntries([entry, ...entries]);
  const handleDeleteEntry = (id: string) => setEntries(entries.filter(e => e.id !== id));
  const handleAddGrowthRecord = (record: GrowthRecord) => setGrowthRecords([...growthRecords, record]);
  const handleAddMilestone = (milestone: Milestone) => setMilestones([...milestones, milestone]);
  
  const handleToggleVaccine = (id: string) => {
    setVaccines(vaccines.map(v => {
      if (v.id === id) {
        return {
          ...v,
          completed: !v.completed,
          dateCompleted: !v.completed ? new Date().toISOString() : undefined
        };
      }
      return v;
    }));
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(milestones.map(m => {
      if (m.id === id) {
        return {
          ...m,
          isCompleted: !m.isCompleted,
          dateCompleted: !m.isCompleted ? new Date().toISOString() : undefined
        };
      }
      return m;
    }));
  };

  const handleAddEvent = (event: CalendarEvent) => {
    setCustomEvents([...customEvents, event]);
  };

  const handleDeleteEvent = (id: string) => {
    setCustomEvents(customEvents.filter(e => e.id !== id));
  };

  const handleAddHistory = (item: MedicalHistoryItem) => {
    setMedicalHistory([...medicalHistory, item]);
  };

  const handleDeleteHistory = (id: string) => {
    setMedicalHistory(medicalHistory.filter(i => i.id !== id));
  };

  const handleAddDocument = (doc: MedicalDocument) => {
    setDocuments([...documents, doc]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  // Computed Values
  const latestGrowth = growthRecords.length > 0 
    ? [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : undefined;

  // --- Render Logic ---
  if (!isLoaded) {
    return (
      <div className={`min-h-screen bg-${themeColor}-50 flex items-center justify-center text-${themeColor}-400 font-bold animate-pulse`}>
        Yükleniyor...
      </div>
    );
  }

  // Priority 1: Onboarding
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Priority 2: PIN Lock
  if (isLocked || (!hasPin && !showOnboarding)) { 
    return (
      <PinLock 
        mode={hasPin ? 'unlock' : 'setup'} 
        onSuccess={handlePinSuccess}
        onReset={hasPin ? openResetModal : undefined}
        themeColor={themeColor}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            profile={profile}
            latestGrowth={latestGrowth}
            vaccines={vaccines}
            recentEntries={entries}
            customEvents={customEvents}
            onChangeView={setCurrentView}
            onUpdateProfile={handleUpdateProfile}
            themeColor={themeColor}
          />
        );
      case 'diary':
        return <DiaryView entries={entries} onAddEntry={handleAddEntry} onDeleteEntry={handleDeleteEntry} themeColor={themeColor} />;
      case 'health':
        return (
          <HealthView 
            vaccines={vaccines} 
            customEvents={customEvents}
            medicalHistory={medicalHistory}
            documents={documents}
            onToggleVaccine={handleToggleVaccine} 
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddHistory={handleAddHistory}
            onDeleteHistory={handleDeleteHistory}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            themeColor={themeColor}
          />
        );
      case 'growth':
        return (
          <GrowthView 
            profile={profile}
            records={growthRecords}
            milestones={milestones}
            onAddRecord={handleAddGrowthRecord}
            onToggleMilestone={handleToggleMilestone}
            onAddMilestone={handleAddMilestone}
            themeColor={themeColor}
          />
        );
      case 'ai-chat':
        return <AiAssistantView profile={profile} themeColor={themeColor} />;
      default:
        return <div>Sayfa bulunamadı</div>;
    }
  };

  return (
    <div className={`min-h-screen bg-${themeColor}-50 text-slate-800 font-sans selection:bg-${themeColor}-200`}>
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white/50 border-x border-white/50">
        <header className={`p-4 pt-8 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-${themeColor}-50 flex items-center justify-between px-6`}>
          <div className="w-6"></div> 
          <h1 className={`text-center font-bold text-${themeColor}-500 tracking-wider text-sm uppercase bg-${themeColor}-50 px-4 py-1 rounded-full`}>BabySteps</h1>
          <button
            onClick={() => setIsLocked(true)}
            className={`text-${themeColor}-300 hover:text-${themeColor}-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-${themeColor}-400 rounded-md`}
            aria-label="Uygulamayı Kilitle"
            title="Uygulamayı Kilitle"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </button>
        </header>
        
        <main className="p-4">
          {renderView()}
        </main>

        <Navigation currentView={currentView} setView={setCurrentView} themeColor={themeColor} />

        <ConfirmationModal
          isOpen={isResetModalOpen}
          onClose={closeResetModal}
          onConfirm={handleResetApp}
          title="Uygulamayı Sıfırla"
          message="Dikkat! Tüm verileriniz kalıcı olarak silinecek ve uygulama başlangıç durumuna dönecektir. Bu işlemi onaylıyor musunuz?"
          themeColor={themeColor}
        />
      </div>
    </div>
  );
};

export default App;
