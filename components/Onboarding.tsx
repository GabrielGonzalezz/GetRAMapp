import React, { useState } from 'react';
import { generatePersona } from '../services/geminiService';
import { UserPersona, Language } from '../types';
import { Brain, ArrowRight } from './ui/Icons';
import { ONBOARDING_QUESTIONS, UI_TEXT } from '../translations';

interface OnboardingProps {
  onComplete: (name: string, persona: UserPersona, language: Language) => void;
}

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(-1); // -1 is Language Selection
  const [language, setLanguage] = useState<Language>('en');
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const t = UI_TEXT[language].onboarding;
  const questions = ONBOARDING_QUESTIONS[language];

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setStep(0);
  };

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      // Finish
      setLoading(true);
      const persona = await generatePersona(newAnswers, language);
      onComplete(name || "Space Cadet", persona, language);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-pulse">
        <Brain className="w-16 h-16 text-neon-purple mb-6 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">{t.analyzing}</h2>
        <p className="text-zinc-400">{t.calibrating}</p>
      </div>
    );
  }

  // Language Selection Step
  if (step === -1) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-neon-purple blur-xl opacity-20 rounded-full"></div>
          <Brain className="w-20 h-20 text-neon-purple relative z-10" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter">RAM</h1>
        <p className="text-xl text-zinc-300 mb-8">External Brain for ADHD</p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageSelect(lang.id)}
              className="flex flex-col items-center justify-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-neon-purple hover:bg-zinc-800 transition-all"
            >
              <span className="text-2xl mb-2">{lang.flag}</span>
              <span className="font-bold text-sm">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Name Input Step
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-neon-purple blur-xl opacity-20 rounded-full"></div>
          <Brain className="w-20 h-20 text-neon-purple relative z-10" />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter">RAM</h1>
        <input 
          type="text"
          placeholder={t.namePlaceholder}
          className="bg-zinc-800 border-none rounded-xl p-4 w-full max-w-xs text-center text-lg focus:ring-2 focus:ring-neon-purple outline-none mb-6"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button 
          onClick={() => setStep(1)}
          disabled={!name.trim()}
          className="bg-white text-black font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
        >
          {t.init} <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  const currentQ = questions[step - 1];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-md mx-auto">
      <div className="w-full bg-zinc-800 h-2 rounded-full mb-8">
        <div 
          className="bg-neon-purple h-2 rounded-full transition-all duration-500" 
          style={{ width: `${((step) / questions.length) * 100}%` }}
        ></div>
      </div>
      
      <h2 className="text-2xl font-bold mb-8 text-left w-full leading-tight">
        {currentQ.q}
      </h2>

      <div className="w-full flex flex-col gap-4">
        {currentQ.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="text-left bg-zinc-900 border border-zinc-800 hover:border-neon-purple p-5 rounded-xl transition-all hover:bg-zinc-800 active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Onboarding;