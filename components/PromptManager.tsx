
import React, { useState } from 'react';
import { Prompt } from '../types';

const PromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: 'p1',
      name: 'Explain Logic',
      description: 'Asks the LLM to explain a specific chunk of code in plain English.',
      template: 'Please explain the following code logic found in {file_path}:\n\n{code_content}\n\nFocus on how it handles {specific_feature}.',
      arguments: [
        { name: 'file_path', description: 'The path of the source file', required: true },
        { name: 'code_content', description: 'The raw source code', required: true },
        { name: 'specific_feature', description: 'Particular logic to focus on', required: false }
      ]
    },
    {
      id: 'p2',
      name: 'Security Audit',
      description: 'Scans the provided context for common vulnerabilities.',
      template: 'Perform a security audit on the following retrieved context. Look for SQL injection, XSS, or broken authentication.\n\nContext:\n{context}',
      arguments: [
        { name: 'context', description: 'The semantic search results', required: true }
      ]
    }
  ]);

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(prompts[0]);

  const highlightVariables = (text: string) => {
    const parts = text.split(/(\{.*?\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        return <span key={i} className="text-blue-400 font-bold bg-blue-400/10 px-1 rounded">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold">MCP Prompt Templates</h2>
        <p className="text-slate-400 text-sm">Define reusable instruction sets for integrated LLM agents.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Available Prompts</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {prompts.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPrompt(p)}
                className={`w-full text-left p-4 hover:bg-slate-800/50 transition-colors ${selectedPrompt?.id === p.id ? 'bg-blue-600/5 border-l-2 border-blue-500' : ''}`}
              >
                <h4 className="font-bold text-sm text-slate-200">{p.name}</h4>
                <p className="text-xs text-slate-500 truncate mt-1">{p.description}</p>
              </button>
            ))}
          </div>
          <button className="w-full py-4 text-xs font-bold text-blue-400 uppercase tracking-widest hover:bg-slate-800 transition-colors border-t border-slate-800">
            Create Template
          </button>
        </div>

        {/* Editor / Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPrompt ? (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-xl font-bold text-white">{selectedPrompt.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{selectedPrompt.description}</p>
                   </div>
                   <div className="bg-slate-800 px-3 py-1 rounded text-[10px] text-slate-400 mono border border-slate-700">
                     PROMPT_ID: {selectedPrompt.id}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Instructions Template</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[150px]">
                    {highlightVariables(selectedPrompt.template)}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Defined Arguments</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPrompt.arguments.map(arg => (
                      <div key={arg.name} className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-blue-400 font-bold mono text-xs">{"{"}{arg.name}{"}"}</span>
                          {arg.required && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{arg.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center space-x-4">
                 <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">MCP Knowledge</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Prompts are used by clients (like Claude or IDEs) to generate standardized workflows. 
                      Changes made here are instantly reflected across all connected SSE transport links.
                    </p>
                 </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl h-64 flex flex-col items-center justify-center text-slate-600">
              <p>Select a prompt to view or edit its structure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptManager;
