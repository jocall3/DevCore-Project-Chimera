
import React, { useState, useEffect } from 'react';
import { AppAudit } from '../services/chimeraCore';
import { AuditRecord } from '../types';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    return AppAudit.subscribe(setLogs);
  }, []);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(filter.toLowerCase()) ||
    l.targetId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Audit Trail</h2>
          <p className="text-sm text-slate-500">Immutable record of all feature & service manipulations.</p>
        </div>
        <input 
          type="text" 
          placeholder="Filter logs..."
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-cyan-500"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex-grow flex flex-col">
        <div className="grid grid-cols-5 bg-slate-950 p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
          <div className="col-span-1">Timestamp</div>
          <div className="col-span-1">Actor</div>
          <div className="col-span-1">Action</div>
          <div className="col-span-1">Target</div>
          <div className="col-span-1 text-right">Payload</div>
        </div>
        <div className="flex-grow overflow-y-auto divide-y divide-slate-800/50 scrollbar">
          {filteredLogs.map(log => (
            <div key={log.id} className="grid grid-cols-5 p-4 items-center hover:bg-slate-800/30 transition-colors">
              <div className="col-span-1 text-[10px] font-mono text-slate-400">
                {log.timestamp.toLocaleTimeString()}
              </div>
              <div className="col-span-1 text-xs font-bold text-cyan-500">
                {log.actorId}
              </div>
              <div className="col-span-1">
                <span className="text-xs font-black text-slate-200 uppercase tracking-tighter">{log.action}</span>
              </div>
              <div className="col-span-1 text-xs text-slate-400 italic">
                {log.targetType}: {log.targetId}
              </div>
              <div className="col-span-1 text-right">
                <button 
                  className="text-[9px] font-bold text-slate-600 hover:text-cyan-400 transition-colors uppercase"
                  onClick={() => console.log(log.newValue)}
                >
                  View JSON
                </button>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-slate-600 uppercase font-black text-sm tracking-widest">
              No audit records matching query
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
