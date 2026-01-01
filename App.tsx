
import React, { useState, useEffect } from 'react';
import { FeatureGrid } from './components/FeatureGrid';
import { AuditLogView } from './components/AuditLogView';
import { ServiceRegistryView } from './components/ServiceRegistryView';
import { 
  AppFeatureManager, 
  AppNotification, 
  AppServiceRegistry, 
  GlobalIDGenerator 
} from './services/chimeraCore';
import { 
  EnhancedFeature, 
  FeatureStatus, 
  FeatureAccessibility, 
  ServiceCategory, 
  ExternalServiceDefinition, 
  ServiceIntegrationStatus 
} from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'logs' | 'services'>('grid');

  useEffect(() => {
    // 1. Initialize Mock Features (Large Scale)
    const featCats = Object.values(ServiceCategory);
    const icons = ['⚙️', '✨', '🔒', '📊', '🚀', '🔌', '⚡', '🔍', '💬', '💳', '⚛️', '🔭', '🌊', '🧠', '🌌'];
    
    const mockFeatures: EnhancedFeature[] = Array.from({ length: 150 }, (_, i) => {
      const name = `${featCats[i % featCats.length]}Engine_v${(i % 5) + 1}`;
      return {
        id: `feature-${i}`,
        name,
        description: `Advanced orchestration logic for ${featCats[i % featCats.length]} subsystem. Part of Chimera Grid v4.`,
        icon: icons[i % icons.length],
        category: featCats[i % featCats.length],
        status: i % 10 === 0 ? FeatureStatus.Beta : FeatureStatus.Active,
        accessibility: FeatureAccessibility.Public,
        metadata: {
          tags: ['core', 'v1.0', featCats[i % featCats.length].toLowerCase()],
          keywords: [name, 'module'],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.4.2'
        },
        dependencies: [],
        extensions: [],
        config: {
          isEnabled: Math.random() > 0.1,
          percentageRollout: 100
        }
      };
    });
    AppFeatureManager.register(mockFeatures);

    // 2. Initialize Mock External Services
    const mockServices: ExternalServiceDefinition[] = Array.from({ length: 20 }, (_, i) => {
      const cat = featCats[i % featCats.length];
      return {
        id: `service-${i}`,
        name: `${cat}Provider_${i + 1}`,
        description: `External API gateway for ${cat} operations.`,
        category: cat,
        baseUrl: `https://api.${cat.toLowerCase()}.com/v1`,
        authenticationMethod: 'API_KEY',
        currentStatus: i % 5 === 0 ? ServiceIntegrationStatus.Error : ServiceIntegrationStatus.Active,
        lastChecked: new Date(),
        capabilities: ['Data Sync', 'Webhooks', 'Auth'],
        metadata: {
          tags: ['external', 'third-party'],
          keywords: ['api', 'service'],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '2.0.0'
        }
      };
    });
    mockServices.forEach(s => AppServiceRegistry.register(s));

    AppNotification.publish('success', 'Project Chimera Online', 'System initialized with 150 modules and 20 external services.');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120]">
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-900/40">
            C
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">PROJECT CHIMERA</h1>
            <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mt-1">Enterprise AI Orchestrator</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {[
            { id: 'grid', label: 'Feature Grid', icon: '▦' },
            { id: 'services', label: 'Services', icon: '🔌' },
            { id: 'logs', label: 'Audit Logs', icon: '📝' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === tab.id 
                ? 'bg-slate-800 text-cyan-400 shadow-md ring-1 ring-slate-700' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-xs text-slate-300 font-bold">James B. O'Callaghan III</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Admin Session: Active</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden ring-2 ring-cyan-500/20">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=ChimeraAdmin" alt="Profile" />
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col overflow-hidden">
        {activeTab === 'grid' && <FeatureGrid />}
        {activeTab === 'logs' && <AuditLogView />}
        {activeTab === 'services' && <ServiceRegistryView />}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-8 flex flex-col sm:flex-row justify-between items-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">
        <p>&copy; 2024 Citibank Demo Business Inc. | Protected by Chimera Sentinel</p>
        <div className="flex space-x-8 mt-2 sm:mt-0">
          <span className="text-cyan-900">Encrypted AES-256</span>
          <span className="text-cyan-900">Quantum Ready</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
