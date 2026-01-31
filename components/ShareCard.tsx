import React from 'react';
import { UserPersona, RamItem } from '../types';
import { Brain } from './ui/Icons';

interface ShareCardProps {
  user: { name: string, persona: UserPersona | null };
  itemCount: number;
  onClose: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({ user, itemCount, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Viral Card Content */}
        <div className="p-8 relative min-h-[400px] flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple blur-[60px] opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-green blur-[60px] opacity-30"></div>

          <div className="flex justify-between items-start mb-8">
            <Brain className="text-white" size={32} />
            <div className="text-right">
              <p className="text-xs font-mono text-zinc-500 uppercase">System Status</p>
              <p className="text-neon-green font-mono font-bold">OPTIMIZED</p>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">
              {user.persona?.type || "The Unlabeled Brain"}
            </h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              "{user.persona?.description || "Running on pure chaos and caffeine."}"
            </p>

            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-zinc-500 uppercase">Power Trait</span>
                <span className="text-xs text-white font-bold">{user.persona?.powerTrait}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500 uppercase">Kryptonite</span>
                <span className="text-xs text-neon-pink font-bold">{user.persona?.kryptonite}</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-5xl font-black text-white">{itemCount}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Items Offloaded to RAM</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center">
            <span className="font-black text-lg tracking-tighter">RAM</span>
            <span className="text-xs text-zinc-600">getram.app</span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-4 flex gap-2">
            <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm" onClick={() => alert("Screenshot this card to share!")}>
                Save Image
            </button>
            <button className="px-4 py-3 text-black font-bold text-sm" onClick={onClose}>
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;