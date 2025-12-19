
import React, { useState, useEffect, useRef } from 'react';
import { IndexingEvent } from '../types';

const IndexingLog: React.FC = () => {
  const [logs, setLogs] = useState<IndexingEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate live watcher events (FR-02)
    const files = [
      'auth_middleware.py', 'user_model.go', 'app_controller.ts', 
      'database_config.yaml', 'utils.rs', 'index.tsx'
    ];
    
    const interval = setInterval(() => {
      const type = Math.random() > 0.3 ? 'MODIFY' : 'CREATE';
      const file = files[Math.floor(Math.random() * files.length)];
      
      const newLog: IndexingEvent = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString(),
        type,
        file,
        message: type === 'MODIFY' 
          ? `Detected change in ${file}. Updating vector index...`
          : `New file ${file} discovered. Parsing functional nodes via Tree-sitter...`
      };

      setLogs(prev => [...prev.slice(-49), newLog]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Reactive Sync Active</span>
        </div>
        <button 
          onClick={() => setLogs([])}
          className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-tighter"
        >
          Clear Logs
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 font-mono text-xs"
      >
        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-600 italic">
            Waiting for filesystem events...
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="group flex space-x-4 py-0.5 border-b border-slate-900/50 hover:bg-slate-900/30">
            <span className="text-slate-600 shrink-0">{log.timestamp}</span>
            <span className={`shrink-0 font-bold ${
              log.type === 'CREATE' ? 'text-emerald-500' : 
              log.type === 'MODIFY' ? 'text-blue-500' : 'text-slate-500'
            }`}>
              [{log.type}]
            </span>
            <span className="text-slate-300 flex-1 truncate">{log.message}</span>
            <span className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
              &lt;2ms
            </span>
          </div>
        ))}
      </div>
      <div className="bg-slate-900/50 px-4 py-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
         <span>LanceDB Status: Committing Parquet...</span>
         <span>Hash: 0x82f...a1d</span>
      </div>
    </div>
  );
};

export default IndexingLog;
