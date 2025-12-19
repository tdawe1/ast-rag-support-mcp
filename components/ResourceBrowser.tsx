
import React, { useState } from 'react';
import { ResourceTemplate } from '../types';

const ResourceBrowser: React.FC = () => {
  const [templates] = useState<ResourceTemplate[]>([
    {
      id: 'rt1',
      name: 'Source File Explorer',
      uriTemplate: 'code://{repository}/{path}',
      description: 'Dynamic access to any indexed file in a managed repository.',
      mimeType: 'text/x-typescript'
    },
    {
      id: 'rt4',
      name: 'PDF Document Assets',
      uriTemplate: 'doc://{repository}/{path}#page={page}',
      description: 'Page-level semantic retrieval for uploaded documentation.',
      mimeType: 'application/pdf'
    },
    {
      id: 'rt2',
      name: 'Functional Node AST',
      uriTemplate: 'ast://{repository}/{path}/{node_id}',
      description: 'Access specific AST sub-trees for granular code analysis.',
      mimeType: 'application/json'
    },
    {
      id: 'rt3',
      name: 'Security Vulnerability Report',
      uriTemplate: 'audit://{repository}/vulnerabilities',
      description: 'Automated scan results for the specified repository.',
      mimeType: 'text/markdown'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'RESOURCES'>('TEMPLATES');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">MCP Resources</h2>
          <p className="text-slate-400 text-sm">Manage dynamic URI patterns and read-only data access for agents.</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'TEMPLATES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Templates
          </button>
          <button 
            onClick={() => setActiveTab('RESOURCES')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'RESOURCES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Direct URIs
          </button>
        </div>
      </header>

      {activeTab === 'TEMPLATES' ? (
        <div className="grid grid-cols-1 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-100">{t.name}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] mono font-bold">
                      {t.uriTemplate}
                    </span>
                    <span className="text-[10px] text-slate-500 mono">{t.mimeType}</span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 text-xs font-bold uppercase">
                  Edit
                </button>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{t.description}</p>
              
              <div className="mt-6 flex items-center space-x-4">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500">
                       V{i}
                     </div>
                   ))}
                </div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Global Provider Hook</span>
              </div>
            </div>
          ))}
          <button className="border-2 border-dashed border-slate-800 hover:border-slate-700 p-8 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-400 transition-all">
             <span className="text-xs font-bold uppercase tracking-widest">Define New URI Template</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
           <div className="p-12 flex flex-col items-center justify-center text-slate-600 space-y-4">
              <p className="text-sm italic">Direct URI indexing for Multimodal chunks is processing file tree...</p>
              <button className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">
                Scan Index Now
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResourceBrowser;
