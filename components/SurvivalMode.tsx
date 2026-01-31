import React from 'react';
import { Shield, BatteryLow } from './ui/Icons';
import { Language } from '../types';
import { UI_TEXT, SURVIVAL_TASKS_TRANSLATED } from '../translations';

interface SurvivalModeProps {
  language: Language;
  onExit: () => void;
}

const SurvivalMode: React.FC<SurvivalModeProps> = ({ language, onExit }) => {
  const t = UI_TEXT[language].survival;
  const tasks = SURVIVAL_TASKS_TRANSLATED[language];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6 transition-colors duration-1000">
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="flex items-center gap-3 text-emerald-400 mb-6">
          <Shield size={32} />
          <span className="text-xl font-bold">{t.engaged}</span>
        </div>
        
        <h2 className="text-3xl font-light text-white mb-6 leading-relaxed">
          {t.title} <br/>
          <span className="text-zinc-500">{t.subtitle}</span>
        </h2>

        <div className="space-y-4 mb-8">
          <p className="text-zinc-400 uppercase text-xs tracking-widest font-mono mb-2">{t.questMenu}</p>
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-zinc-300">{task}</span>
            </div>
          ))}
        </div>

        <button 
            onClick={onExit}
            className="w-full py-4 text-zinc-500 hover:text-white transition-colors text-sm"
        >
            {t.reengage}
        </button>
      </div>
    </div>
  );
};

export default SurvivalMode;