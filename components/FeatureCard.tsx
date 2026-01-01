
import React from 'react';
import { EnhancedFeature, FeatureStatus } from '../types';

interface FeatureCardProps {
  feature: EnhancedFeature;
  onToggle: (id: string, enabled: boolean) => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onToggle }) => {
  const isEnabled = feature.config.isEnabled;

  return (
    <div className={`group relative bg-slate-900/40 border-2 rounded-[2.5rem] p-6 flex flex-col justify-between h-[320px] transition-all duration-500 hover:bg-slate-900/80 ${
      isEnabled 
        ? 'border-slate-800/80 hover:border-cyan-600/40 shadow-[0_10px_30px_rgba(0,0,0,0.3)]' 
        : 'border-slate-900 opacity-40 grayscale blur-[0.5px]'
    }`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-3xl transition-all duration-500 transform group-hover:rotate-12 ${
            isEnabled ? 'bg-slate-950 text-white shadow-2xl group-hover:bg-cyan-600 group-hover:shadow-cyan-900/50' : 'bg-slate-800 text-slate-600'
          }`}>
            {feature.icon}
          </div>
          <div className="flex flex-col items-end space-y-1">
             <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.1em] ${
               feature.status === FeatureStatus.Active ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
             }`}>
               {feature.status}
             </span>
             <span className="text-[9px] text-slate-700 uppercase font-black tracking-widest">Chimera_v{feature.metadata.version}</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-black text-slate-100 uppercase tracking-tighter group-hover:text-cyan-400 transition-colors line-clamp-1">
            {feature.name}
          </h3>
          <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed font-medium">
            {feature.description}
          </p>
        </div>
      </div>

      <div className="mt-auto relative z-10 flex items-center justify-between pt-6 border-t border-slate-800/50">
        <div className="flex -space-x-1">
          {feature.metadata.tags.slice(0, 2).map(t => (
            <div key={t} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[8px] font-black text-slate-600 uppercase tracking-widest group-hover:border-cyan-900/30 transition-all">
              {t}
            </div>
          ))}
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={e => onToggle(feature.id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600 peer-checked:after:bg-white shadow-inner"></div>
        </label>
      </div>

      {/* Dynamic Background Effect */}
      <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </div>
  );
};
