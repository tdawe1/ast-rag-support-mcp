
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SearchPanel from './components/SearchPanel';
import RepositoryList from './components/RepositoryList';
import IndexingLog from './components/IndexingLog';
import SecurityPanel from './components/SecurityPanel';
import { ViewType, Repository, UserRole } from './types';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewType>(ViewType.DASHBOARD);
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: 'main-app',
      name: 'Main Monorepo',
      path: '/Users/dev/projects/main-monorepo',
      lastIndexed: '2 mins ago',
      fileCount: 842,
      chunkCount: 32410,
      status: 'active'
    },
    {
      id: 'auth-microservice',
      name: 'Auth Service',
      path: '/Users/dev/projects/auth-service',
      lastIndexed: '12 mins ago',
      fileCount: 156,
      chunkCount: 5200,
      status: 'active'
    }
  ]);

  const addRepository = (newRepo: Repository) => {
    setRepositories([...repositories, newRepo]);
  };

  const deleteRepository = (id: string) => {
    setRepositories(repositories.filter(r => r.id !== id));
  };

  const reindexRepository = (id: string) => {
    setRepositories(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'indexing', progress: 0 } : r
    ));
    
    // Simulate reindexing progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setRepositories(prev => prev.map(r => 
          r.id === id ? { ...r, status: 'active', lastIndexed: 'Just now', progress: undefined } : r
        ));
      } else {
        setRepositories(prev => prev.map(r => 
          r.id === id ? { ...r, progress: currentProgress } : r
        ));
      }
    }, 400);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard repositories={repositories} />;
      case ViewType.SEARCH:
        return <SearchPanel userRole={userRole} repositories={repositories} />;
      case ViewType.REPOSITORIES:
        return (
          <RepositoryList 
            repos={repositories} 
            onAdd={addRepository} 
            onDelete={deleteRepository} 
            onReindex={reindexRepository} 
          />
        );
      case ViewType.SECURITY:
        return <SecurityPanel userRole={userRole} />;
      case ViewType.LOGS:
        return (
          <div className="h-[calc(100vh-120px)] flex flex-col">
            <header className="mb-6">
              <h2 className="text-2xl font-bold">System Logs</h2>
              <p className="text-slate-400 text-sm">Real-time observer events from the filesystem watcher.</p>
            </header>
            <div className="flex-1">
              <IndexingLog />
            </div>
          </div>
        );
      default:
        return <Dashboard repositories={repositories} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        userRole={userRole} 
        setUserRole={setUserRole} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-8 max-w-7xl mx-auto pb-24">
          {renderView()}
        </div>

        {/* Global Action Bar */}
        <div className="fixed bottom-0 right-0 left-64 p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex justify-between items-center z-50">
           <div className="text-xs text-slate-500 flex items-center space-x-4">
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>LanceDB V0.3.1</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>Watcher: Active</span>
              <span className="flex items-center text-slate-400 font-mono">Role: {userRole}</span>
           </div>
           <div className="flex space-x-2">
              <button 
                onClick={() => setView(ViewType.SECURITY)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
              >
                RBAC Settings
              </button>
              <button 
                onClick={() => setView(ViewType.SEARCH)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center shadow-lg shadow-blue-500/20"
              >
                🔍 Search Code
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
