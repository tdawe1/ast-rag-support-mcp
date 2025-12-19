
import React, { useState } from 'react';
import { Repository } from '../types';

interface RepositoryListProps {
  repos: Repository[];
  onAdd: (repo: Repository) => void;
  onDelete: (id: string) => void;
  onReindex: (id: string) => void;
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repos, onAdd, onDelete, onReindex }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRepo, setNewRepo] = useState({ 
    name: '', 
    path: '', 
    id: '', 
    ignorePatterns: 'node_modules, .git, dist, build, .env, *.log' 
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepo.name || !newRepo.path) return;
    
    const id = newRepo.name.toLowerCase().replace(/\s+/g, '-');
    const patterns = newRepo.ignorePatterns.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    onAdd({
      id,
      name: newRepo.name,
      path: newRepo.path,
      lastIndexed: 'Just now',
      fileCount: 0,
      chunkCount: 0,
      status: 'indexing',
      progress: 0,
      ignorePatterns: patterns
    });
    
    onReindex(id);

    setNewRepo({ name: '', path: '', id: '', ignorePatterns: 'node_modules, .git, dist, build, .env, *.log' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
       <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Project Repositories</h2>
          <p className="text-slate-400 text-sm">Managed codebases currently watched and indexed.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/10"
        >
           Add Local Target
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {repos.map((repo) => (
          <div key={repo.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:bg-slate-800/50 transition-colors group relative overflow-hidden shadow-sm">
            {repo.status === 'indexing' && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300 ease-out z-10" 
                style={{ width: `${repo.progress || 0}%` }}
              ></div>
            )}

            <div className="flex justify-between items-start mb-4 relative z-0">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  repo.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                  repo.status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                }`}></div>
                <h3 className="text-lg font-bold">{repo.name}</h3>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-500 rounded text-[10px] mono">
                  ID: {repo.id}
                </span>
                {repo.status === 'indexing' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-yellow-500 font-bold uppercase animate-pulse">
                      Indexing ({repo.progress}%)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={() => onReindex(repo.id)}
                  disabled={repo.status === 'indexing'}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
                 >
                    Reindex
                 </button>
                 <button 
                  onClick={() => onDelete(repo.id)}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg hover:bg-red-500/10 transition-all"
                 >
                    Remove
                 </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-0">
              <div className="col-span-1 md:col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Path & Exclusions</p>
                <p className="text-sm text-slate-300 mono mt-1 truncate" title={repo.path}>{repo.path}</p>
                {repo.ignorePatterns && repo.ignorePatterns.length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-1">
                      {repo.ignorePatterns.map(p => (
                        <span key={p} className="text-[9px] bg-red-500/5 text-red-400/70 border border-red-500/10 px-1.5 py-0.5 rounded font-mono">-{p}</span>
                      ))}
                   </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Last Sync</p>
                <p className="text-sm text-slate-300 mt-1">{repo.lastIndexed}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Stats</p>
                <p className="text-sm text-slate-300 mt-1">{repo.fileCount} Files / {repo.chunkCount.toLocaleString()} Chunks</p>
              </div>
            </div>

            {repo.status === 'indexing' && (
               <div className="mt-6 flex flex-col space-y-2 relative z-0">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                     <span>AST Extraction Progress</span>
                     <span>{repo.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      style={{ width: `${repo.progress}%` }}
                    ></div>
                  </div>
               </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <form onSubmit={handleAddSubmit}>
                 <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-bold">Add Local Target</h3>
                 </div>
                 <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1">
                         <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-widest">Display Name</label>
                         <input 
                           type="text" 
                           value={newRepo.name}
                           onChange={(e) => setNewRepo({...newRepo, name: e.target.value})}
                           placeholder="e.g. API Backend"
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                           required
                         />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                         <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-widest">Path</label>
                         <input 
                           type="text" 
                           value={newRepo.path}
                           onChange={(e) => setNewRepo({...newRepo, path: e.target.value})}
                           placeholder="/absolute/path/to/project"
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                           required
                         />
                      </div>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-widest">Exclude Patterns (CSV)</label>
                       <textarea 
                         value={newRepo.ignorePatterns}
                         onChange={(e) => setNewRepo({...newRepo, ignorePatterns: e.target.value})}
                         placeholder="node_modules, .git, dist, build, .env, *.log"
                         className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono"
                       />
                       <p className="text-[10px] text-slate-500 mt-2 italic">Protects your privacy and prevents "noise" from polluting the vector index.</p>
                    </div>
                 </div>
                 <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white font-medium uppercase tracking-widest"
                    >Cancel</button>
                    <button 
                      type="submit"
                      className="px-6 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20"
                    >Add & Index</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryList;
