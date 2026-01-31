import React, { useState, useEffect } from 'react';
import { AppMode, RamItem, UserState, UserPersona, ItemType, Interaction, Language } from './types';
import * as Storage from './services/storageService';
import * as Notifications from './services/notificationService';
import Onboarding from './components/Onboarding';
import BrainDump from './components/BrainDump';
import Dashboard from './components/Dashboard';
import TunnelMode from './components/TunnelMode';
import SurvivalMode from './components/SurvivalMode';
import ShareCard from './components/ShareCard';
import IdeaDetail from './components/IdeaDetail';
import CalendarView from './components/CalendarView';
import IdeaEcosystem from './components/IdeaEcosystem';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [items, setItems] = useState<RamItem[]>([]);
  const [user, setUser] = useState<UserState | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedItems = Storage.getItems();
    const loadedUser = Storage.getUser();

    setItems(loadedItems);
    if (loadedUser) {
      // Ensure history exists for legacy users
      if (!loadedUser.history) {
        loadedUser.history = [];
      }
      // Ensure language exists for legacy users
      if (!loadedUser.language) {
        loadedUser.language = 'en';
      }
      setUser(loadedUser);
    } else {
      setMode(AppMode.ONBOARDING);
    }

    // Check for notifications
    Notifications.checkAndSendDailyReminder();
  }, []);

  // Save on change
  useEffect(() => {
    Storage.saveItems(items);
  }, [items]);

  useEffect(() => {
    if (user) Storage.saveUser(user);
  }, [user]);

  const handleOnboardingComplete = (name: string, persona: UserPersona, language: Language) => {
    const newUser: UserState = {
      name,
      persona,
      language,
      hasOnboarded: true,
      chaosLevel: Math.floor(Math.random() * 100),
      history: []
    };
    setUser(newUser);
    setMode(AppMode.DASHBOARD);
    setShowShare(true); // Auto show share card after onboarding
  };

  const handleNewItem = (processedItem: any) => {
    const newItem: RamItem = {
      ...processedItem,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isDiscarded: processedItem.type === ItemType.NOISE
      // Note: temporalCue and estimatedDate are automatically included if present in processedItem
    };
    
    // Add to beginning of list
    setItems(prev => [newItem, ...prev]);
    setMode(AppMode.DASHBOARD);
  };

  const logInteraction = (task: RamItem, action: 'COMPLETED' | 'SKIPPED') => {
    if (!user) return;
    const newInteraction: Interaction = {
        taskId: task.id,
        action,
        taskEnergy: task.energy,
        timestamp: Date.now()
    };
    // Keep last 100 interactions to prevent bloat
    const updatedHistory = [newInteraction, ...(user.history || [])].slice(0, 100);
    setUser({ ...user, history: updatedHistory });
  };

  const handleCompleteTask = (id: string) => {
    const task = items.find(i => i.id === id);
    if (task) logInteraction(task, 'COMPLETED');

    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completedAt: Date.now() } : item
    ));
    // Tunnel mode handles navigation visual flow
  };

  const handleSkipTask = (id: string) => {
    const task = items.find(i => i.id === id);
    if (task) logInteraction(task, 'SKIPPED');
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (mode === AppMode.IDEA_DETAIL) {
      setMode(AppMode.DASHBOARD);
      setSelectedItemId(null);
    }
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
    setMode(AppMode.IDEA_DETAIL);
  };

  const handleUpdateItem = (updatedItem: RamItem) => {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setMode(AppMode.DASHBOARD);
    setSelectedItemId(null);
  };

  const handlePromoteIdea = (id: string) => {
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, type: ItemType.TASK, urgency: 'HIGH' as any } : i
    ));
  };

  const handleLanguageChange = (lang: Language) => {
    if (user) {
        setUser({ ...user, language: lang });
    }
  };

  const handleHardReset = () => {
    Storage.clearData();
    setItems([]);
    setUser(null);
    setMode(AppMode.ONBOARDING);
  };

  const selectedItem = items.find(i => i.id === selectedItemId);
  const currentLanguage = user?.language || 'en';

  return (
    <div className="h-screen w-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Universal container - removed max-w-lg to allow responsive desktop layouts */}
      <div className="h-full w-full relative">
        
        {mode === AppMode.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {mode === AppMode.DASHBOARD && user && (
          <Dashboard 
            items={items} 
            user={user}
            onOpenDump={() => setMode(AppMode.BRAIN_DUMP)}
            onOpenTunnel={() => setMode(AppMode.TUNNEL)}
            onOpenSurvival={() => setMode(AppMode.SURVIVAL)}
            onOpenShare={() => setShowShare(true)}
            onOpenCalendar={() => setMode(AppMode.CALENDAR)}
            onOpenEcosystem={() => setMode(AppMode.IDEA_ECOSYSTEM)}
            onOpenSettings={() => setMode(AppMode.SETTINGS)}
            onDeleteItem={handleDeleteItem}
            onItemClick={handleItemClick}
          />
        )}

        {mode === AppMode.BRAIN_DUMP && (
          <BrainDump 
            language={currentLanguage}
            onItemProcessed={handleNewItem} 
            onCancel={() => setMode(AppMode.DASHBOARD)} 
          />
        )}

        {mode === AppMode.TUNNEL && (
          <TunnelMode 
            language={currentLanguage}
            items={items}
            userHistory={user?.history || []}
            onComplete={handleCompleteTask}
            onSkip={handleSkipTask} 
            onExit={() => setMode(AppMode.DASHBOARD)}
          />
        )}

        {mode === AppMode.SURVIVAL && (
          <SurvivalMode 
            language={currentLanguage}
            onExit={() => setMode(AppMode.DASHBOARD)} 
          />
        )}

        {mode === AppMode.CALENDAR && (
          <CalendarView 
            items={items}
            onBack={() => setMode(AppMode.DASHBOARD)}
            onItemClick={handleItemClick}
          />
        )}

        {mode === AppMode.IDEA_ECOSYSTEM && (
          <IdeaEcosystem 
            items={items}
            language={currentLanguage}
            onBack={() => setMode(AppMode.DASHBOARD)}
            onItemClick={handleItemClick}
            onPromoteToTask={handlePromoteIdea}
          />
        )}

        {mode === AppMode.SETTINGS && (
          <Settings 
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            onReset={handleHardReset}
            onBack={() => setMode(AppMode.DASHBOARD)}
          />
        )}

        {mode === AppMode.IDEA_DETAIL && selectedItem && (
          <IdeaDetail 
            item={selectedItem}
            onSave={handleUpdateItem}
            onBack={() => setMode(AppMode.DASHBOARD)}
            onDelete={handleDeleteItem}
          />
        )}

        {/* Fallback if item not found in detail mode */}
        {mode === AppMode.IDEA_DETAIL && !selectedItem && (
             <div className="flex h-full items-center justify-center">Item not found.</div>
        )}

        {/* Overlay Share Card */}
        {showShare && user && (
          <ShareCard 
            user={user} 
            itemCount={items.length} 
            onClose={() => setShowShare(false)} 
          />
        )}

      </div>
    </div>
  );
};

export default App;