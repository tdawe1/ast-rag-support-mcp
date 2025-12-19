
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
  const [newRepo, setNewRepo] = useState({ name: '', path: '', id: '' });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepo.name || !newRepo.path) return;
    
    const id = newRepo.name.toLowerCase().replace(/\s+/g, '-');
    onAdd({
      id,
      name: newRepo.name,
      path: newRepo.path,
      lastIndexed: 'Just now',
      fileCount: 0,
      chunkCount: 0,
      status: 'indexing'
    });
    
    // Auto-complete indexing after simulation
    setTimeout(() => {
        onReindex(id);
    }, 2000);

    setNewRepo({ name: '', path: '', id: '' });
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
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
        >
           + Add Local Target
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {repos.map((repo) => (
          <div key={repo.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:bg-slate-800/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
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
                  <span className="text-[10px] text-yellow-500 font-bold uppercase animate-pulse">
                    Indexing...
                  </span>
                )}
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={() => onReindex(repo.id)}
                  disabled={repo.status === 'indexing'}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
                 >
                    🔄 Reindex
                 </button>
                 <button 
                  onClick={() => onDelete(repo.id)}
                  className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg hover:bg-red-500/10 transition-all"
                 >
                    🗑️
                 </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Path</p>
                <p className="text-sm text-slate-300 mono mt-1 truncate" title={repo.path}>{repo.path}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Last Sync</p>
                <p className="text-sm text-slate-300 mt-1">{repo.lastIndexed}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Stats</p>
                <p className="text-sm text-slate-300 mt-1">{repo.fileCount} Files / {repo.chunkCount.toLocaleString()} Chunks</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Engine</p>
                <p className="text-sm text-slate-300 mt-1 flex items-center">
                   <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                   LanceDB + Tree-Sitter
                </p>
              </div>
            </div>

            {repo.status === 'error' && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-xs text-red-400">
                <span className="mr-2">⚠️</span>
                <span>Indexer failed: Permission denied while accessing '{repo.path}/.git'</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <form onSubmit={handleAddSubmit}>
                 <div className="px-6 py-4 border-b border-slate-800">
                    <h3 className="text-lg font-bold">Add Local Target</h3>
                 </div>
                 <div className="p-6 space-y-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 block mb-2">Display Name</label>
                       <input 
                         type="text" 
                         value={newRepo.name}
                         onChange={(e) => setNewRepo({...newRepo, name: e.target.value})}
                         placeholder="e.g. API Backend"
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                         required
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 block mb-2">Local File Path</label>
                       <input 
                         type="text" 
                         value={newRepo.path}
                         onChange={(e) => setNewRepo({...newRepo, path: e.target.value})}
                         placeholder="/absolute/path/to/project"
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                         required
                       />
                       <p className="text-[10px] text-slate-500 mt-2">The MCP server will immediately begin functional node parsing via Tree-Sitter.</p>
                    </div>
                 </div>
                 <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >Cancel</button>
                    <button 
                      type="submit"
                      className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold"
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
