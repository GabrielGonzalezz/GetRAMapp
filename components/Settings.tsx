import React from 'react';
import { Language } from '../types';
import { ArrowRight, Trash2, Settings as SettingsIcon } from './ui/Icons';
import { UI_TEXT } from '../translations';

interface SettingsProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
  onBack: () => void;
}

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' }
];

const Settings: React.FC<SettingsProps> = ({ currentLanguage, onLanguageChange, onReset, onBack }) => {
  const t = UI_TEXT[currentLanguage].settings;

  const handleResetClick = () => {
    if (window.confirm(t.confirmReset)) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 animate-fade-in">
      <div className="w-full max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 rounded-full text-zinc-400">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t.title}</h1>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowRight className="rotate-180" size={24} />
          </button>
        </div>

        {/* Language Section */}
        <div className="mb-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{t.language}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LANGUAGES.map(lang => (
                    <button
                        key={lang.id}
                        onClick={() => onLanguageChange(lang.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                            currentLanguage === lang.id 
                            ? 'bg-neon-purple/10 border-neon-purple text-white' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                        }`}
                    >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-bold">{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Danger Zone */}
        <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                {t.dangerZone}
            </h3>
            
            <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-900/20 rounded-full text-red-500">
                        <Trash2 size={24} />
                    </div>
                    <div>
                        <h4 className="text-red-400 font-bold mb-1">{t.reset}</h4>
                        <p className="text-red-300/60 text-xs mb-4 leading-relaxed">
                            {t.resetDesc}
                        </p>
                        <button 
                            onClick={handleResetClick}
                            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm transition-colors w-full sm:w-auto"
                        >
                            {t.reset}
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;