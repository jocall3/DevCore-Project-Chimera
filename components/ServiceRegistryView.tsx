
import React, { useState, useEffect } from 'react';
import { AppServiceRegistry } from '../services/chimeraCore';
import { ExternalServiceDefinition, ServiceIntegrationStatus } from '../types';

export const ServiceRegistryView: React.FC = () => {
  const [services, setServices] = useState<ExternalServiceDefinition[]>([]);

  useEffect(() => {
    return AppServiceRegistry.subscribe(setServices);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full overflow-y-auto scrollbar">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">External Subsystems</h2>
        <p className="text-slate-500">Third-party service bridge management and connectivity health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-900/50 transition-all group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="bg-slate-800 p-3 rounded-2xl text-xl">🔌</div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                    s.currentStatus === ServiceIntegrationStatus.Active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {s.currentStatus}
                  </span>
                  <span className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">{s.category}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{s.name}</h3>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 italic">"{s.description}"</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.capabilities.map(cap => (
                  <span key={cap} className="px-2 py-1 bg-slate-950 rounded text-[9px] font-bold text-slate-600 border border-slate-800 uppercase tracking-tighter">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-600 uppercase font-bold">Checked: {s.lastChecked.toLocaleTimeString()}</span>
              <button className="text-xs font-black text-cyan-600 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                Ping Service
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
