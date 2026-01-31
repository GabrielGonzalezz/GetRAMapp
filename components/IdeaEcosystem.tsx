import React, { useState, useEffect } from 'react';
import { RamItem, IdeaCluster, ItemType, Language } from '../types';
import { Sprout, Flower, ArrowRight, Layers, Sparkles, Rocket, GitMerge } from './ui/Icons';
import { clusterIdeas } from '../services/geminiService';

interface IdeaEcosystemProps {
  items: RamItem[];
  language: Language;
  onBack: () => void;
  onItemClick: (id: string) => void;
  onPromoteToTask: (id: string) => void;
}

const IdeaEcosystem: React.FC<IdeaEcosystemProps> = ({ items, language, onBack, onItemClick, onPromoteToTask }) => {
  const [clusters, setClusters] = useState<IdeaCluster[]>([]);
  const [loadingClusters, setLoadingClusters] = useState(false);
  
  // Filter only ideas
  const allIdeas = items.filter(i => i.type === ItemType.IDEA && !i.isDiscarded && !i.completedAt);
  
  // "Fresh Sprouts" - Ideas created in the last 24 hours
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const sprouts = allIdeas.filter(i => i.createdAt > oneDayAgo).sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    const fetchClusters = async () => {
       const lastCheck = sessionStorage.getItem('ram_idea_clusters_ts');
       const cached = sessionStorage.getItem('ram_idea_clusters_data');
       
       // Use cache if fresh enough (1 hour)
       if (lastCheck && cached && (Date.now() - parseInt(lastCheck) < 1000 * 60 * 60)) {
           setClusters(JSON.parse(cached));
           return;
       }

       if (allIdeas.length >= 4) {
           setLoadingClusters(true);
           const results = await clusterIdeas(allIdeas, language);
           setClusters(results);
           sessionStorage.setItem('ram_idea_clusters_ts', Date.now().toString());
           sessionStorage.setItem('ram_idea_clusters_data', JSON.stringify(results));
           setLoadingClusters(false);
       }
    };
    
    fetchClusters();
  }, [allIdeas.length]);

  // Determine "Wildflowers" - ideas not in any cluster
  const clusteredIds = new Set(clusters.flatMap(c => c.itemIds));
  const wildflowers = allIdeas.filter(i => !clusteredIds.has(i.id) && i.createdAt <= oneDayAgo);

  const handlePromote = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onPromoteToTask(id);
      alert("Idea promoted to Task! Project started.");
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-emerald-50 overflow-y-auto no-scrollbar font-sans selection:bg-emerald-500/30">
        
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-900/20 rounded-full text-emerald-400">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-emerald-100">Idea Ecosystem</h1>
                            <p className="text-xs text-emerald-600/70 uppercase tracking-wider">Living Database</p>
                        </div>
                    </div>
                    <button 
                    onClick={onBack}
                    className="p-2 text-emerald-700 hover:text-emerald-400 transition-colors"
                    >
                    <ArrowRight className="rotate-180" size={24} />
                    </button>
                </div>
            </div>

            {/* Fresh Sprouts Section */}
            <div className="mb-8">
                <div className="px-6 flex items-center gap-2 mb-4 text-emerald-500/60">
                    <Sprout size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Fresh Sprouts (24h)</span>
                </div>
                
                {sprouts.length === 0 ? (
                    <p className="px-6 text-emerald-800 text-sm italic">No new seeds planted today.</p>
                ) : (
                    <div className="flex overflow-x-auto no-scrollbar gap-4 px-6 pb-4">
                        {sprouts.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => onItemClick(item.id)}
                                className="min-w-[160px] bg-emerald-900/10 border border-emerald-800/30 p-4 rounded-2xl flex flex-col justify-between h-40 hover:bg-emerald-900/20 hover:border-emerald-700/50 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                                
                                <p className="text-sm font-medium text-emerald-100 line-clamp-4 leading-relaxed">
                                    {item.processedText}
                                </p>
                                
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-[10px] text-emerald-700 font-mono">New</span>
                                    <button 
                                        onClick={(e) => handlePromote(e, item.id)}
                                        className="p-1.5 text-emerald-700 hover:text-emerald-300 hover:bg-emerald-800/50 rounded-lg transition-colors"
                                        title="Promote to Project"
                                    >
                                        <Rocket size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* The Groves (Clusters) */}
            <div className="px-6 mb-8 min-h-[200px]">
                <div className="flex items-center justify-between gap-2 mb-4 text-emerald-500/60">
                    <div className="flex items-center gap-2">
                        <GitMerge size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">The Groves</span>
                    </div>
                    {loadingClusters && <Sparkles size={12} className="animate-spin text-emerald-500" />}
                </div>

                {clusters.length === 0 && !loadingClusters ? (
                    <div className="text-center py-8 border border-dashed border-emerald-900/50 rounded-2xl">
                        <p className="text-emerald-800 text-sm">Not enough density to form groves yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clusters.map(cluster => (
                            <div key={cluster.id} className="bg-[#0a0a0a] border border-emerald-900/30 rounded-2xl overflow-hidden h-full">
                                <div className="p-4 bg-emerald-950/10 border-b border-emerald-900/20">
                                    <h3 className="font-bold text-emerald-200">{cluster.name}</h3>
                                    <p className="text-xs text-emerald-600 mt-1">{cluster.description}</p>
                                </div>
                                <div className="p-2">
                                    {cluster.itemIds.map(id => {
                                        const item = allIdeas.find(i => i.id === id);
                                        if (!item) return null;
                                        return (
                                            <div 
                                                key={id} 
                                                onClick={() => onItemClick(id)}
                                                className="p-3 hover:bg-emerald-900/10 rounded-xl cursor-pointer transition-colors flex justify-between group"
                                            >
                                                <span className="text-sm text-emerald-300/80 line-clamp-1">{item.processedText}</span>
                                                <ArrowRight size={14} className="text-emerald-800 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Wildflowers */}
            <div className="px-6 pb-12">
                <div className="flex items-center gap-2 mb-4 text-emerald-500/60">
                    <Flower size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Wildflowers</span>
                </div>
                
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {wildflowers.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            className="break-inside-avoid bg-[#0a0a0a] border border-emerald-900/20 p-4 rounded-xl hover:border-emerald-700/30 transition-colors cursor-pointer"
                        >
                            <p className="text-xs text-emerald-300/70 leading-relaxed mb-3">
                                {item.processedText}
                            </p>
                            <div className="flex gap-1 flex-wrap">
                                {item.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-emerald-950 text-emerald-700 rounded border border-emerald-900/30">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default IdeaEcosystem;