import React, { useState } from 'react';
import { RamItem, ItemType } from '../types';
import { ArrowRight, CheckCircle, Trash2, Zap, Brain } from './ui/Icons';

interface IdeaDetailProps {
  item: RamItem;
  onSave: (updatedItem: RamItem) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}

const IdeaDetail: React.FC<IdeaDetailProps> = ({ item, onSave, onBack, onDelete }) => {
  const [text, setText] = useState(item.processedText);
  const [tags, setTags] = useState(item.tags.join(', '));
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = () => {
    const updatedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      ...item,
      processedText: text,
      tags: updatedTags
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsDirty(true);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
    setIsDirty(true);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 animate-fade-in">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <button 
            onClick={onBack}
            className="p-2 -ml-2 text-zinc-400 hover:text-white flex items-center gap-2"
            >
            <ArrowRight className="rotate-180" size={20} />
            <span className="text-sm font-mono uppercase tracking-widest">Back</span>
            </button>

            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.type === ItemType.IDEA ? 'bg-yellow-500/20 text-yellow-500' :
                    item.type === ItemType.TASK ? 'bg-blue-500/20 text-blue-500' :
                    'bg-zinc-800 text-zinc-500'
                }`}>
                    {item.type}
                </span>
                <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex flex-col">
            <label className="block text-zinc-600 text-xs font-mono uppercase tracking-widest mb-4">
                Core Thought
            </label>
            <textarea
                value={text}
                onChange={handleChange}
                className="w-full flex-1 bg-transparent text-2xl md:text-3xl font-light text-white placeholder-zinc-700 outline-none resize-none leading-relaxed mb-8"
                placeholder="Empty thought..."
            />

            {/* Metadata Editor */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50">
                <div className="mb-4">
                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={handleTagsChange}
                        className="w-full bg-zinc-900 border-b border-zinc-700 text-zinc-300 py-2 outline-none focus:border-neon-purple transition-colors"
                    />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                    <div className="flex items-center gap-2">
                        <Zap size={14} />
                        {item.energy} Energy
                    </div>
                    <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                    <div>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
            <button 
                onClick={handleSave}
                disabled={!isDirty}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isDirty 
                    ? 'bg-neon-purple text-white hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}
            >
                <CheckCircle size={20} />
                {isDirty ? 'Save Changes' : 'No Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;