import React, { useState, useEffect } from 'react';
import { RamItem, ItemType, UserState, EnergyLevel, MentalLoop, Urgency } from '../types';
import { Brain, Zap, Play, BatteryLow, Share2, RefreshCw, Trash2, ArrowRight, Bell, Calendar, Sprout, Settings } from './ui/Icons';
import { getMentalReplayInsight, analyzeMentalLoops } from '../services/geminiService';
import * as Notifications from '../services/notificationService';
import MentalReplay from './MentalReplay';
import { UI_TEXT } from '../translations';

interface DashboardProps {
  items: RamItem[];
  user: UserState;
  onOpenDump: () => void;
  onOpenTunnel: () => void;
  onOpenSurvival: () => void;
  onOpenShare: () => void;
  onOpenCalendar: () => void;
  onOpenEcosystem: () => void;
  onOpenSettings: () => void;
  onDeleteItem: (id: string) => void;
  onItemClick: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  items, user, onOpenDump, onOpenTunnel, onOpenSurvival, onOpenShare, onOpenCalendar, onOpenEcosystem, onOpenSettings, onDeleteItem, onItemClick
}) => {
  const [insight, setInsight] = useState<string>('');
  const [activeLoop, setActiveLoop] = useState<MentalLoop | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const [analyzingLoop, setAnalyzingLoop] = useState(false);
  
  const lang = user.language || 'en';
  const t = UI_TEXT[lang].dashboard;

  const tasks = items.filter(i => i.type === ItemType.TASK && !i.completedAt && !i.isDiscarded);
  const thoughts = items.filter(i => (i.type === ItemType.THOUGHT || i.type === ItemType.IDEA) && !i.isDiscarded);
  const ideas = items.filter(i => i.type === ItemType.IDEA && !i.isDiscarded);

  // Filter for Agenda
  const agendaItems = items
    .filter(i => i.estimatedDate && !i.completedAt && !i.isDiscarded)
    .sort((a, b) => (a.estimatedDate! > b.estimatedDate! ? 1 : -1));

  // Sort items by date desc for display
  const displayItems = items
    .filter(i => !i.isDiscarded)
    .sort((a, b) => b.createdAt - a.createdAt);

  const visibleItems = showAllItems ? displayItems : displayItems.slice(0, 5);

  useEffect(() => {
    // Check initial permission state
    setNotifsEnabled(Notifications.hasPermission());
  }, []);

  // Effect to detect loops on mount if enough thoughts exist
  useEffect(() => {
    const detectPatterns = async () => {
       if (thoughts.length >= 3 && !activeLoop && !analyzingLoop) {
          // Simple throttle check using session storage to avoid spamming API on every refresh
          const lastCheck = sessionStorage.getItem('ram_last_loop_check');
          if (lastCheck && Date.now() - parseInt(lastCheck) < 1000 * 60 * 10) return; // 10 min throttle

          setAnalyzingLoop(true);
          sessionStorage.setItem('ram_last_loop_check', Date.now().toString());
          
          const loop = await analyzeMentalLoops(items, lang);
          if (loop) {
              setActiveLoop(loop);
          }
          setAnalyzingLoop(false);
       }
    };
    detectPatterns();
  }, [items.length]); 

  const handleNotificationToggle = async () => {
    if (notifsEnabled) {
       alert("Notifications are active. Your brain is in good hands.");
    } else {
       const granted = await Notifications.requestPermission();
       setNotifsEnabled(granted);
    }
  };

  // --- Loop Actions ---
  const handleConvertLoopToTask = (loop: MentalLoop) => {
    alert(`Converted "${loop.theme}" to a focused task.`);
    setActiveLoop(null);
  };

  const handleArchiveLoop = (loop: MentalLoop) => {
    alert(`Archived ${loop.frequency} thoughts about "${loop.theme}".`);
    setActiveLoop(null);
  };

  const handleDiscardLoop = (loop: MentalLoop) => {
    alert(`Letting go of "${loop.theme}". Poof.`);
    setActiveLoop(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === date.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return date.toLocaleDateString(lang, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-6xl mx-auto flex flex-col min-h-full pb-24">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-xl font-bold text-white">{t.hello}, {user.name}</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{user.persona?.type}</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleNotificationToggle} 
                    className={`p-2 rounded-full transition-colors ${notifsEnabled ? 'bg-neon-purple/20 text-neon-purple' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                >
                    <Bell size={20} fill={notifsEnabled ? "currentColor" : "none"} />
                </button>
                <button onClick={onOpenShare} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
                    <Share2 size={20} />
                </button>
                <button onClick={onOpenSettings} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
                    <Settings size={20} />
                </button>
            </div>
        </div>

        {/* Main Stats / CTA Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Load Card */}
            <div className="col-span-1 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 relative overflow-hidden border border-zinc-800">
            <div className="relative z-10">
                <div className="text-zinc-400 text-xs font-mono uppercase mb-2">{t.load}</div>
                <div className="text-3xl font-mono text-white mb-1">{tasks.length}</div>
                <div className="text-zinc-500 text-[10px]">{t.activeTasks}</div>
            </div>
            <Zap className="absolute right-2 bottom-2 text-zinc-800 w-16 h-16 rotate-12" />
            </div>

            {/* Idea Garden Card */}
            <button 
                onClick={onOpenEcosystem}
                className="col-span-1 bg-gradient-to-br from-emerald-900/40 to-emerald-950 rounded-2xl p-6 relative overflow-hidden border border-emerald-900/30 group hover:border-emerald-700 transition-colors text-left"
            >
                <div className="relative z-10">
                    <div className="text-emerald-400 text-xs font-mono uppercase mb-2">{t.ideas}</div>
                    <div className="text-3xl font-mono text-white mb-1">{ideas.length}</div>
                    <div className="text-emerald-600 text-[10px] group-hover:text-emerald-400 transition-colors">{t.enterEcosystem} &rarr;</div>
                </div>
                <Sprout className="absolute right-2 bottom-2 text-emerald-900/60 w-16 h-16 -rotate-6 group-hover:text-emerald-800/60 transition-colors" />
            </button>
            
            {/* Tunnel Mode CTA - Merged into grid on desktop, full width on mobile via styling below */}
            <button 
            onClick={onOpenTunnel}
            disabled={tasks.length === 0}
            className="col-span-2 md:col-span-2 bg-white text-black rounded-2xl p-6 flex items-center justify-between group hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
            <div className="text-left">
                <h3 className="text-xl font-black uppercase italic">{t.tunnelMode}</h3>
                <p className="text-sm text-zinc-600 font-medium">{t.doOneThing}</p>
            </div>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:bg-neon-purple transition-colors">
                <Play fill="currentColor" size={20} className="ml-1" />
            </div>
            </button>
        </div>

        {/* Invisible Agenda (Conditional) */}
        {agendaItems.length > 0 && (
            <div className="mb-8 animate-fade-in">
            <div 
                className="flex items-center justify-between mb-4 text-zinc-500 cursor-pointer group"
                onClick={onOpenCalendar}
            >
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="group-hover:text-neon-purple transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest group-hover:text-zinc-300 transition-colors">{t.invisibleAgenda}</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {agendaItems.map(item => (
                    <div key={item.id} className="min-w-[140px] bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => onItemClick(item.id)}>
                        {/* Timeline Line */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-neon-purple transition-colors"></div>
                        
                        <div>
                            <span className="text-[10px] font-mono text-neon-purple uppercase mb-1 block">
                                {formatDate(item.estimatedDate!)}
                            </span>
                            <p className="text-sm font-bold text-white leading-tight line-clamp-3">
                                {item.processedText}
                            </p>
                        </div>
                        {item.temporalCue && (
                            <div className="text-[10px] text-zinc-500 italic truncate">
                                "{item.temporalCue}"
                            </div>
                        )}
                    </div>
                ))}
            </div>
            </div>
        )}

        {/* Mental Replay (Loop Detected) */}
        {activeLoop && (
            <MentalReplay 
                loop={activeLoop} 
                onConvertToTask={handleConvertLoopToTask}
                onArchive={handleArchiveLoop}
                onDiscard={handleDiscardLoop}
            />
        )}

        {/* Recent Items List */}
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{t.memoryBank}</h3>
                {displayItems.length > 5 && (
                    <button 
                        onClick={() => setShowAllItems(!showAllItems)} 
                        className="text-xs text-neon-purple hover:underline"
                    >
                        {showAllItems ? t.showLess : t.viewAll}
                    </button>
                )}
            </div>
            
            {displayItems.length === 0 ? (
            <p className="text-zinc-700 text-center py-8">{t.ramEmpty}</p>
            ) : (
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                {visibleItems.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => onItemClick(item.id)}
                    className="group flex justify-between items-start p-4 bg-zinc-900 rounded-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer h-full"
                >
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.type === ItemType.TASK ? 'bg-blue-900/30 text-blue-400' :
                                item.type === ItemType.IDEA ? 'bg-yellow-900/30 text-yellow-400' :
                                'bg-zinc-800 text-zinc-500'
                            }`}>
                                {item.type}
                            </span>
                            {item.estimatedDate && (
                                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {formatDate(item.estimatedDate)}
                                </span>
                            )}
                            {item.completedAt && <span className="text-[10px] text-green-500 font-bold">DONE</span>}
                        </div>
                        <p className={`text-zinc-300 text-sm mt-1 line-clamp-2 ${item.completedAt ? 'line-through opacity-50' : ''}`}>
                            {item.processedText}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }} 
                            className="text-zinc-700 hover:text-red-500 p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                        <ArrowRight size={14} className="text-zinc-700" />
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
      </div>

      {/* Sticky Bottom Nav - Centered on Desktop */}
      <div className="fixed bottom-6 left-6 right-6 flex gap-4 md:max-w-md md:mx-auto md:left-0 md:right-0 z-50">
        <button 
          onClick={onOpenSurvival}
          className="flex-1 bg-zinc-800/80 backdrop-blur text-zinc-400 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:text-white transition-colors border border-zinc-700/50"
        >
          <BatteryLow size={20} />
          <span className="text-[10px] uppercase">{t.survival}</span>
        </button>
        <button 
          onClick={onOpenDump}
          className="flex-[2] bg-neon-purple text-white py-4 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-shadow flex items-center justify-center gap-2"
        >
          <Brain size={24} />
          {t.brainDump}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;