
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppFeatureManager, AppNotification, AppAudit, AppTelemetry } from '../services/chimeraCore';
import { aiService } from '../services/geminiService';
import { EnhancedFeature, NotificationMessage, AIChatMessage } from '../types';
import { FeatureCard } from './FeatureCard';

export const FeatureGrid: React.FC = () => {
  const [features, setFeatures] = useState<EnhancedFeature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const unsubFeatures = AppFeatureManager.subscribe(setFeatures);
    const unsubNotifs = AppNotification.subscribe(setNotifications);
    return () => {
      unsubFeatures();
      unsubNotifs();
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(features.map(f => f.category));
    return ['All', ...Array.from(cats).sort()];
  }, [features]);

  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            f.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [features, searchTerm, selectedCategory]);

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    AppFeatureManager.toggleFeature(id, enabled);
  }, []);

  const handleGenerateAISuggestions = async () => {
    setIsSuggesting(true);
    AppTelemetry.track('ai_discovery_start', { activeFeatures: features.length });
    const context = `System has ${features.length} modules active. Top categories: ${categories.slice(1, 4).join(', ')}.`;
    const suggestions = await aiService.generateFeatureSuggestions(context);
    setAiSuggestions(suggestions);
    setIsSuggesting(false);
    AppNotification.publish('info', 'AI Invention Drafted', `Generated ${suggestions.length} new module concepts.`);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const newMsg: AIChatMessage = { role: 'user', content: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    const reply = await aiService.chat(chatMessages, chatInput);
    setChatMessages(prev => [...prev, { role: 'model', content: reply, timestamp: new Date() }]);
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      {/* Control Panel */}
      <section className="bg-slate-900/50 p-6 border-b border-slate-800 shadow-2xl z-10">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:max-w-xl">
            <input
              type="text"
              placeholder="Query Module Subspace..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center bg-slate-950 rounded-2xl border border-slate-800 p-1">
               {['All', ...categories.slice(1, 4)].map(c => (
                 <button 
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === c ? 'bg-slate-800 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
                 >
                   {c}
                 </button>
               ))}
               <select
                  value={categories.includes(selectedCategory) ? selectedCategory : 'All'}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none px-2 cursor-pointer"
               >
                 <option value="All">More...</option>
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>

            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-colors group shadow-lg"
            >
              <svg className="w-6 h-6 text-slate-600 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-600 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse text-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-2xl transition-all shadow-xl shadow-cyan-950/20 active:scale-95 flex items-center space-x-3"
            >
              <span className="text-lg">✨</span>
              <span>AI CHIMERA CORE</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="flex-grow overflow-y-auto p-8 bg-[#0b1120] scrollbar">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredFeatures.map(f => (
              <FeatureCard key={f.id} feature={f} onToggle={handleToggle} />
            ))}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-40 border-4 border-dashed border-slate-900 rounded-[4rem]">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Zero Resonance Detected</h3>
              <p className="text-slate-800 uppercase text-[10px] font-bold tracking-[0.2em] mt-2">Adjust search parameters or system frequency</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Modal (Full Overlay) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl">
          <div className="bg-slate-900 w-full max-w-5xl h-full max-h-[85vh] rounded-[3rem] border border-slate-800 shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col">
            <div className="p-8 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-cyan-900/40">✨</div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Chimera AI Central</h2>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Neural Orchestration Active</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)} 
                className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-10 space-y-12 scrollbar">
              {/* Chat View */}
              <div className="space-y-6">
                 {chatMessages.length === 0 && (
                   <div className="text-center py-10 opacity-30">
                     <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">Awaiting Neural Input</p>
                   </div>
                 )}
                 {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-6 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-cyan-700 text-white rounded-tr-none shadow-xl shadow-cyan-950/20' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-xl'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Suggestions */}
              <div className="space-y-6 bg-slate-950/50 p-8 rounded-[3rem] border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Innovation Lab</h3>
                    <p className="text-[10px] text-slate-600 uppercase font-bold mt-1">AI-Proposed Module Architecture</p>
                  </div>
                  <button 
                    onClick={handleGenerateAISuggestions}
                    disabled={isSuggesting}
                    className="bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isSuggesting ? 'SIMULATING...' : 'GENERATE PROPOSALS'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiSuggestions.map((s, i) => (
                    <div key={i} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 space-y-4 hover:border-cyan-900/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-cyan-400 bg-cyan-900/30 px-3 py-1 rounded-full uppercase tracking-widest">{s.category}</span>
                        <span className="text-[9px] text-slate-600 uppercase font-black">{s.impact}</span>
                      </div>
                      <h4 className="font-black text-slate-200 uppercase tracking-tighter leading-tight">{s.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed italic">"{s.rationale}"</p>
                    </div>
                  ))}
                  {aiSuggestions.length === 0 && !isSuggesting && (
                    <div className="col-span-3 text-center py-10 text-slate-700 uppercase font-black text-xs tracking-[0.2em]">
                      Lab is currently idle. Click generate to begin simulation.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-950 border-t border-slate-800">
              <div className="max-w-4xl mx-auto flex space-x-4">
                <input
                  type="text"
                  placeholder="Transmit neural query to core..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                  className="flex-grow bg-slate-900 border border-slate-800 rounded-[2rem] px-8 py-5 text-sm font-bold placeholder-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none shadow-inner"
                />
                <button
                  onClick={handleChatSend}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white w-20 h-20 rounded-[2rem] transition-all flex items-center justify-center shadow-lg shadow-cyan-900/40 active:scale-90"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer (Simplified overlay) */}
      {showNotifications && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-l border-slate-800 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Comms</h2>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Encrypted Alert Feed</p>
            </div>
            <button onClick={() => setShowNotifications(false)} className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-grow space-y-4 overflow-y-auto scrollbar">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => AppNotification.markAsRead(n.id)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${n.read ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-800/50 border-cyan-900/50 ring-1 ring-cyan-500/10'}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                    n.type === 'error' || n.type === 'urgent' ? 'text-red-500' : 
                    n.type === 'success' ? 'text-green-500' : 'text-cyan-500'
                  }`}>
                    {n.type}
                  </span>
                  {!n.read && <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
                </div>
                <h4 className="font-black text-slate-200 mt-2 uppercase tracking-tighter leading-tight group-hover:text-cyan-400 transition-colors">{n.title}</h4>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">{n.message}</p>
                <p className="text-[9px] text-slate-700 mt-4 uppercase font-bold tracking-widest">{n.timestamp.toLocaleTimeString()}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-20 opacity-20">
                <p className="text-xs font-black uppercase tracking-widest">Feed Zero</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
