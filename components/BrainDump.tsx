import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Brain } from './ui/Icons';
import { processBrainDump } from '../services/geminiService';
import { RamItem, Language } from '../types';
import { UI_TEXT } from '../translations';

interface BrainDumpProps {
  language: Language;
  onItemProcessed: (item: Omit<RamItem, 'id' | 'createdAt' | 'isDiscarded'>) => void;
  onCancel: () => void;
}

const BrainDump: React.FC<BrainDumpProps> = ({ language, onItemProcessed, onCancel }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = UI_TEXT[language].brainDump;

  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Set language based on user preference
      const langMap: Record<Language, string> = {
        'en': 'en-US',
        'es': 'es-ES',
        'pt': 'pt-BR',
        'ru': 'ru-RU'
      };
      recognitionRef.current.lang = langMap[language];

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error", event);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setProcessing(true);
    try {
      const result = await processBrainDump(input, language);
      onItemProcessed({
        originalText: input,
        processedText: result.processedText,
        type: result.type,
        energy: result.energy,
        urgency: result.urgency,
        tags: result.tags,
        temporalCue: result.temporalCue,
        estimatedDate: result.estimatedDate
      });
      setInput('');
    } catch (e) {
      alert("System overload. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6">
      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
        <h2 className="text-neon-purple font-mono text-sm mb-4 uppercase tracking-widest">
          {t.inputStream}
        </h2>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="w-full h-96 bg-transparent text-3xl font-light text-white placeholder-zinc-700 outline-none resize-none leading-relaxed"
        />
        
        {processing && (
           <div className="flex items-center gap-3 text-neon-purple animate-pulse mt-4">
             <Brain className="animate-spin" size={20} />
             <span className="font-mono">{t.processing}</span>
           </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto max-w-3xl mx-auto w-full">
        <button 
          onClick={onCancel}
          className="text-zinc-500 hover:text-zinc-300 font-mono text-sm px-4 py-2"
        >
          {t.cancel}
        </button>

        <div className="flex gap-4">
          <button
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <Mic size={24} />
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || processing}
            className="p-4 rounded-full bg-neon-purple text-white disabled:opacity-50 hover:bg-purple-600 hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrainDump;