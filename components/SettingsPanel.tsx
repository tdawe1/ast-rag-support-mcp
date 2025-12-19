
import React from 'react';
import { ModelConfig, ModelProvider } from '../types';

interface SettingsPanelProps {
  config: ModelConfig;
  onChange: (config: ModelConfig) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onChange }) => {
  const updateProvider = (provider: ModelProvider) => {
    onChange({ ...config, provider });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold">Model Configuration</h2>
        <p className="text-slate-400 text-sm">Switch between Cloud (Gemini) and Local inference for RAG intelligence.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Provider Selection</h3>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={() => updateProvider('GEMINI')}
              className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center ${
                config.provider === 'GEMINI' 
                ? 'bg-blue-600/10 border-blue-500 text-blue-100' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <p className="font-bold text-sm">Google Gemini (Cloud)</p>
                <p className="text-xs opacity-60">High performance, zero setup, requires API key.</p>
              </div>
              {config.provider === 'GEMINI' && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
            </button>

            <button 
              onClick={() => updateProvider('LOCAL')}
              className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center ${
                config.provider === 'LOCAL' 
                ? 'bg-purple-600/10 border-purple-500 text-purple-100' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <p className="font-bold text-sm">Local Model (OpenAI/Ollama API)</p>
                <p className="text-xs opacity-60">Private, local-only, requires inference server.</p>
              </div>
              {config.provider === 'LOCAL' && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Local Connection Details</h3>
          </div>
          <div className={`p-6 space-y-6 transition-opacity duration-300 ${config.provider === 'GEMINI' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">API Endpoint Base</label>
              <input 
                type="text" 
                value={config.localEndpoint}
                onChange={(e) => onChange({...config, localEndpoint: e.target.value})}
                placeholder="http://localhost:11434/v1"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm font-mono text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-600">Usually /v1 endpoint for OpenAI-compatible providers.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Model Name</label>
              <input 
                type="text" 
                value={config.localModel}
                onChange={(e) => onChange({...config, localModel: e.target.value})}
                placeholder="llama3"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm font-mono text-purple-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-600">Ensure this model is downloaded/served on your local server.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-widest">Why Local?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-200">Data Sovereignty</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">No proprietary source code ever leaves your local environment during query expansion.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-200">Zero Latency</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Network jitter is eliminated for a faster, snappy search experience on powerful local hardware.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-200">Unlimited Context</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Leverage massive local context windows without paying per-token cloud costs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
