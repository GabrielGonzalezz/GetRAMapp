import React from 'react';
import { MentalLoop } from '../types';
import { Repeat, CheckSquare, Archive, XCircle, Brain } from './ui/Icons';

interface MentalReplayProps {
  loop: MentalLoop;
  onConvertToTask: (loop: MentalLoop) => void;
  onArchive: (loop: MentalLoop) => void;
  onDiscard: (loop: MentalLoop) => void;
}

const MentalReplay: React.FC<MentalReplayProps> = ({ loop, onConvertToTask, onArchive, onDiscard }) => {
  return (
    <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8 relative overflow-hidden animate-fade-in backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Background ambient effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 blur-[50px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 text-neon-purple">
          <Repeat size={18} className="animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-widest">Mental Replay</span>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">
          {loop.theme}
        </h3>
        <p className="text-zinc-400 text-sm italic mb-4 leading-relaxed">
          "{loop.insight}"
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-6">
           <span className="bg-zinc-800 px-2 py-1 rounded">Freq: {loop.frequency}x</span>
           <span className="bg-zinc-800 px-2 py-1 rounded">Span: {loop.timeSpan}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => onConvertToTask(loop)}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-400 transition-all active:scale-95 group"
          >
            <CheckSquare size={20} className="group-hover:text-neon-green transition-colors" />
            <span className="text-[10px] font-bold">Turn to Task</span>
          </button>

          <button 
            onClick={() => onArchive(loop)}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-400 transition-all active:scale-95 group"
          >
            <Archive size={20} className="group-hover:text-blue-400 transition-colors" />
            <span className="text-[10px] font-bold">Acknowledge</span>
          </button>

          <button 
            onClick={() => onDiscard(loop)}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-400 transition-all active:scale-95 group"
          >
            <XCircle size={20} className="group-hover:text-red-400 transition-colors" />
            <span className="text-[10px] font-bold">Let it Go</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalReplay;