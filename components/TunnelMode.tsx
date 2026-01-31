import React, { useState, useEffect, useMemo } from 'react';
import { RamItem, ItemType, Urgency, EnergyLevel, Interaction, Language } from '../types';
import { CheckCircle, Zap, Wind, ArrowRight, BatteryLow, BatteryMedium, BatteryFull, Activity, Signal } from './ui/Icons';
import { UI_TEXT } from '../translations';

interface TunnelModeProps {
  language: Language;
  items: RamItem[];
  userHistory: Interaction[];
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onExit: () => void;
}

const TunnelMode: React.FC<TunnelModeProps> = ({ language, items, userHistory, onComplete, onSkip, onExit }) => {
  const [userEnergy, setUserEnergy] = useState<EnergyLevel | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState<'idle' | 'exiting-left' | 'exiting-right' | 'entering'>('idle');

  const t = UI_TEXT[language].tunnel;

  // ---- SMART SEQUENCING LOGIC ----
  const activeTasks = useMemo(() => {
    if (!userEnergy) return [];

    const tasks = items.filter(i => i.type === ItemType.TASK && !i.completedAt && !i.isDiscarded);

    // 1. Analyze History
    // Calculate Skip Rate for High Energy tasks in the last 50 interactions
    const recentHistory = userHistory.sort((a,b) => b.timestamp - a.timestamp).slice(0, 50);
    const highEnergyStats = recentHistory.filter(h => h.taskEnergy === EnergyLevel.HIGH);
    const highEnergySkipRate = highEnergyStats.length > 0 
      ? highEnergyStats.filter(h => h.action === 'SKIPPED').length / highEnergyStats.length
      : 0;

    // 2. Sorting Algorithm
    return tasks.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Base Urgency Score (Foundation)
      const urgencyScore = { [Urgency.HIGH]: 30, [Urgency.MEDIUM]: 20, [Urgency.LOW]: 10 };
      scoreA += urgencyScore[a.urgency];
      scoreB += urgencyScore[b.urgency];

      // Energy Match Score (Context Awareness)
      const getEnergyScore = (taskLevel: EnergyLevel, userLevel: EnergyLevel) => {
          if (userLevel === EnergyLevel.LOW) {
              // User is tired: Prioritize easy wins, heavily penalize high energy
              if (taskLevel === EnergyLevel.LOW) return 50; 
              if (taskLevel === EnergyLevel.MEDIUM) return 10;
              if (taskLevel === EnergyLevel.HIGH) return -50; 
          }
          if (userLevel === EnergyLevel.MEDIUM) {
               // User is okay: Mix of medium/low, slight penalty for high
               if (taskLevel === EnergyLevel.MEDIUM) return 30;
               if (taskLevel === EnergyLevel.LOW) return 20; 
               if (taskLevel === EnergyLevel.HIGH) return 0; 
          }
          if (userLevel === EnergyLevel.HIGH) {
              // User is energetic: "Eat the frog" strategy
              if (taskLevel === EnergyLevel.HIGH) return 40; 
              if (taskLevel === EnergyLevel.MEDIUM) return 20;
              if (taskLevel === EnergyLevel.LOW) return 0;
          }
          return 0;
      };

      scoreA += getEnergyScore(a.energy, userEnergy);
      scoreB += getEnergyScore(b.energy, userEnergy);

      // Adaptive Penalty (Behavioral Analysis)
      // If user frequently skips High Energy tasks (>50% of the time), penalize them
      // UNLESS they specifically said they have High Energy right now.
      if (userEnergy !== EnergyLevel.HIGH && highEnergySkipRate > 0.5) {
          if (a.energy === EnergyLevel.HIGH) scoreA -= 25;
          if (b.energy === EnergyLevel.HIGH) scoreB -= 25;
      }
      
      // Secondary Sort: Date (Oldest first)
      if (scoreA !== scoreB) return scoreB - scoreA; // Descending Score
      return a.createdAt - b.createdAt;
    });
  }, [items, userEnergy, userHistory]);

  // ---- RENDER: Energy Check-in ----
  if (!userEnergy) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 p-6 animate-fade-in justify-center">
         <div className="w-full max-w-lg mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex p-4 bg-zinc-900 rounded-full mb-6 relative">
                <Activity className="text-neon-purple w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.systemCheck}</h2>
                <p className="text-zinc-400">{t.calibrating}</p>
            </div>

            <div className="space-y-4">
                <button onClick={() => setUserEnergy(EnergyLevel.HIGH)} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between hover:bg-zinc-800 hover:border-neon-green transition-all group">
                    <div className="flex items-center gap-4">
                        <BatteryFull className="text-neon-green" size={24} />
                        <div className="text-left">
                            <div className="font-bold text-white group-hover:text-neon-green transition-colors">{t.fullCharge}</div>
                            <div className="text-xs text-zinc-500">{t.fullChargeDesc}</div>
                        </div>
                    </div>
                    <ArrowRight className="text-zinc-700 group-hover:text-neon-green" />
                </button>

                <button onClick={() => setUserEnergy(EnergyLevel.MEDIUM)} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between hover:bg-zinc-800 hover:border-yellow-400 transition-all group">
                    <div className="flex items-center gap-4">
                        <BatteryMedium className="text-yellow-400" size={24} />
                        <div className="text-left">
                            <div className="font-bold text-white group-hover:text-yellow-400 transition-colors">{t.cruising}</div>
                            <div className="text-xs text-zinc-500">{t.cruisingDesc}</div>
                        </div>
                    </div>
                    <ArrowRight className="text-zinc-700 group-hover:text-yellow-400" />
                </button>

                <button onClick={() => setUserEnergy(EnergyLevel.LOW)} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between hover:bg-zinc-800 hover:border-red-400 transition-all group">
                    <div className="flex items-center gap-4">
                        <BatteryLow className="text-red-400" size={24} />
                        <div className="text-left">
                            <div className="font-bold text-white group-hover:text-red-400 transition-colors">{t.lowBattery}</div>
                            <div className="text-xs text-zinc-500">{t.lowBatteryDesc}</div>
                        </div>
                    </div>
                    <ArrowRight className="text-zinc-700 group-hover:text-red-400" />
                </button>
            </div>

            <button onClick={onExit} className="mt-8 text-zinc-600 text-sm hover:text-white transition-colors w-full text-center">
                {t.exit}
            </button>
         </div>
      </div>
    );
  }

  // ---- RENDER: Empty State ----
  if (activeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-950 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
            <Wind className="w-24 h-24 text-zinc-600 mb-6 animate-pulse-slow" />
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{t.emptyTitle}</h2>
            <p className="text-zinc-400 mb-8 max-w-xs mx-auto leading-relaxed">
                {t.emptyDesc}
            </p>
            <button 
                onClick={onExit} 
                className="bg-white text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
            {t.returnDashboard}
            </button>
        </div>
      </div>
    );
  }

  // Ensure index is within bounds
  const safeIndex = Math.min(currentIndex, activeTasks.length - 1);
  const currentTask = activeTasks[safeIndex];

  // Helper to trigger done animation and logic
  const handleDone = () => {
    setAnimationState('exiting-right');
    setTimeout(() => {
        onComplete(currentTask.id);
        setAnimationState('entering');
        setTimeout(() => {
            setAnimationState('idle');
        }, 50);
    }, 300);
  };

  // Helper to trigger skip animation and logic
  const handleSkip = () => {
    setAnimationState('exiting-left');
    // Log the skip
    onSkip(currentTask.id);
    
    setTimeout(() => {
        if (safeIndex < activeTasks.length - 1) {
            setCurrentIndex(safeIndex + 1);
        } else {
            setCurrentIndex(0);
        }
        setAnimationState('entering');
        setTimeout(() => {
            setAnimationState('idle');
        }, 50);
    }, 300);
  };

  const getEnergyColor = (e: EnergyLevel) => {
    switch (e) {
      case EnergyLevel.LOW: return 'text-neon-green border-neon-green/30 bg-neon-green/10';
      case EnergyLevel.MEDIUM: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case EnergyLevel.HIGH: return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-zinc-400 border-zinc-700 bg-zinc-800';
    }
  };

  const getAnimationClasses = () => {
      switch (animationState) {
          case 'exiting-right': return 'translate-x-[120%] opacity-0 rotate-6';
          case 'exiting-left': return 'translate-x-[-120%] opacity-0 -rotate-6';
          case 'entering': return 'translate-y-8 opacity-0 scale-95';
          case 'idle': return 'translate-x-0 translate-y-0 opacity-100 scale-100 rotate-0';
      }
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden font-sans">
      {/* Dynamic Tunnel Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] rounded-full border-[1px] border-zinc-900 opacity-20 animate-[pulse_4s_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full border-[1px] border-zinc-800 opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full border-[1px] border-zinc-700 opacity-10"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full p-6 max-w-4xl mx-auto w-full">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></span>
              <span className="text-neon-purple font-mono text-xs tracking-[0.3em] uppercase">{t.title}</span>
          </div>
          <div className="flex items-center gap-4">
             {/* Optimization Badge */}
             <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
                <Signal size={10} className="text-neon-purple" />
                <span>{t.optimized}</span>
             </div>
             <button 
                onClick={onExit} 
                className="text-zinc-600 text-xs font-mono hover:text-white uppercase tracking-widest px-3 py-1 rounded-full hover:bg-zinc-900 transition-colors"
            >
                {t.exit}
            </button>
          </div>
        </div>

        {/* Main Task Display */}
        <div className="flex-1 flex flex-col justify-center items-center relative perspective-[1000px]">
            <div 
                className={`w-full flex flex-col items-center text-center transition-all duration-300 ease-out transform ${getAnimationClasses()}`}
            >
                {/* Energy Badge */}
                <div className={`mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-xs uppercase tracking-wider ${getEnergyColor(currentTask.energy)}`}>
                    <Zap size={14} fill="currentColor" />
                    {currentTask.energy}
                </div>
                
                {/* Task Text */}
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight mb-8 text-white tracking-tight break-words max-w-full">
                    {currentTask.processedText}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {currentTask.tags.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-500 uppercase tracking-widest">
                        #{t}
                    </span>
                    ))}
                </div>

                {/* Counter */}
                <div className="text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
                    {t.focusTarget} {safeIndex + 1} / {activeTasks.length}
                </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-4 pt-6 pb-4 max-w-lg mx-auto w-full">
          <button 
            onClick={handleSkip}
            className="group py-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 font-bold hover:bg-zinc-800 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
                <ArrowRight className="rotate-180" size={20} />
            </span> 
            {t.skip}
          </button>
          <button 
            onClick={handleDone}
            className="group py-6 rounded-3xl bg-white text-black font-black hover:bg-neon-green hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2"
          >
            {t.done}
            <CheckCircle size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TunnelMode;