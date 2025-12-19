
import React from 'react';
import { ViewType, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, setUserRole }) => {
  const items = [
    { id: ViewType.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: ViewType.SEARCH, label: 'Semantic Search', icon: '🔍' },
    { id: ViewType.REPOSITORIES, label: 'Repositories', icon: '📁' },
    { id: ViewType.SECURITY, label: 'Security & Auth', icon: '🛡️' },
    { id: ViewType.LOGS, label: 'System Logs', icon: '📜' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          rag-support
        </h1>
        <p className="text-xs text-slate-500 mt-1">MCP RAG Server Admin</p>
      </div>
      <nav className="flex-1 py-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center px-6 py-3 text-sm transition-colors ${
              currentView === item.id
                ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-6 space-y-4 border-t border-slate-800">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block mb-2">Simulated User Role</label>
          <select 
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Admin">Admin (All Access)</option>
            <option value="Developer">Developer (Public + Internal)</option>
            <option value="Viewer">Viewer (Public Only)</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-500 font-medium pt-2 border-t border-slate-800/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Server: Healthy</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
