import React from 'react';
import { RamItem, ItemType } from '../types';
import { ArrowRight, CalendarDays, Clock, CheckCircle, Zap } from './ui/Icons';

interface CalendarViewProps {
  items: RamItem[];
  onBack: () => void;
  onItemClick: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ items, onBack, onItemClick }) => {
  const agendaItems = items
    .filter(i => i.estimatedDate && !i.completedAt && !i.isDiscarded)
    .sort((a, b) => (a.estimatedDate! > b.estimatedDate! ? 1 : -1));

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const groups = {
    today: agendaItems.filter(i => i.estimatedDate === todayStr),
    tomorrow: agendaItems.filter(i => i.estimatedDate === tomorrowStr),
    upcoming: agendaItems.filter(i => i.estimatedDate! > tomorrowStr),
    overdue: agendaItems.filter(i => i.estimatedDate! < todayStr)
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderSection = (title: string, groupItems: RamItem[], colorClass: string) => {
    if (groupItems.length === 0) return null;
    return (
      <div className="mb-8 animate-fade-in">
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${colorClass} flex items-center gap-2`}>
          {title} <span className="px-2 py-0.5 bg-zinc-900 rounded-full text-[10px] text-zinc-500">{groupItems.length}</span>
        </h3>
        <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
          {groupItems.map(item => (
            <div 
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-start gap-3 hover:bg-zinc-800 transition-colors cursor-pointer h-full"
            >
              <div className={`mt-1 p-1 rounded-full ${item.type === ItemType.TASK ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-700/10 text-zinc-500'}`}>
                {item.type === ItemType.TASK ? <CheckCircle size={14} /> : <Zap size={14} />}
              </div>
              <div className="flex-1">
                <p className="text-zinc-200 text-sm font-medium leading-relaxed mb-1">{item.processedText}</p>
                <div className="flex items-center gap-3">
                    {item.temporalCue && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                            <Clock size={10} />
                            "{item.temporalCue}"
                        </div>
                    )}
                    {item.estimatedDate && title === 'Upcoming' && (
                         <div className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">
                            {formatDate(item.estimatedDate)}
                         </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-900 rounded-full text-neon-purple">
                    <CalendarDays size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Time Travel</h1>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Future Trajectory</p>
                </div>
            </div>
            <button 
            onClick={onBack}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
            <ArrowRight className="rotate-180" size={24} />
            </button>
        </div>

        <div className="flex-1">
            {agendaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-zinc-600 mb-2">The horizon is clear.</p>
                    <p className="text-xs text-zinc-700">No dates detected in your RAM.</p>
                </div>
            ) : (
                <>
                    {renderSection("Overdue / Past", groups.overdue, "text-red-400")}
                    {renderSection("Today", groups.today, "text-neon-green")}
                    {renderSection("Tomorrow", groups.tomorrow, "text-yellow-400")}
                    {renderSection("Upcoming", groups.upcoming, "text-blue-400")}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;