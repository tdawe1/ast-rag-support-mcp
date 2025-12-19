
import React, { useState, useEffect, useRef } from 'react';
import { IndexingEvent } from '../types';

const IndexingLog: React.FC = () => {
  const [logs, setLogs] = useState<IndexingEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const files = [
      'auth_middleware.py', 'user_model.go', 'app_controller.ts', 
      'database_config.yaml', 'utils.rs', 'index.tsx', 'api_client.js'
    ];
    
    const interval = setInterval(() => {
      const type = Math.random() > 0.4 ? 'MODIFY' : (Math.random() > 0.5 ? 'AST_PARSE' : 'CREATE');
      const file = files[Math.floor(Math.random() * files.length)];
      
      let message = '';
      let details = '';

      switch (type) {
        case 'MODIFY':
          message = `FS_EVENT: Content change in ${file}`;
          details = 'Recalculating hash...';
          break;
        case 'CREATE':
          message = `FS_EVENT: New file ${file} discovered`;
          details = 'Queuing for ingestion...';
          break;
        case 'AST_PARSE':
          const nodes = ['Function', 'Class', 'Import', 'Method'];
          const node = nodes[Math.floor(Math.random() * nodes.length)];
          message = `AST_SYNC: Extracted ${node} from ${file}`;
          details = `Tree-Sitter offset: ${Math.floor(Math.random() * 1000)}`;
          break;
      }

      const newLog: IndexingEvent = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
        file,
        message,
        details
      };

      setLogs(prev => [...prev.slice(-49), newLog]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reactive Synchronizer v3</span>
        </div>
        <button 
          onClick={() => setLogs([])}
          className="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-bold tracking-widest"
        >
          Clear
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 font-mono text-[11px]"
      >
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-2">
            <div className="w-12 h-1 border-t border-slate-800"></div>
            <p className="italic">Watching filesystem for Phase 3 events...</p>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="group flex items-start space-x-4 py-1 border-b border-slate-900/50 hover:bg-slate-900/30 transition-colors">
            <span className="text-slate-600 shrink-0 font-light">{log.timestamp}</span>
            <span className={`shrink-0 font-bold px-1.5 rounded-[2px] ${
              log.type === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' : 
              log.type === 'MODIFY' ? 'bg-blue-500/10 text-blue-500' : 
              log.type === 'AST_PARSE' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-500'
            }`}>
              {log.type.padEnd(9)}
            </span>
            <div className="flex-1 min-w-0">
               <div className="text-slate-300 truncate font-medium">{log.message}</div>
               {log.details && <div className="text-slate-600 text-[10px]">{log.details}</div>}
            </div>
            <span className="text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              SYNC_OK
            </span>
          </div>
        ))}
      </div>
      <div className="bg-slate-900/50 px-4 py-2 border-t border-slate-800 text-[9px] text-slate-500 flex justify-between uppercase tracking-tighter">
         <span className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>LanceDB WAL Commit: Active</span>
         <span className="font-mono">Shards: 4 | Parquet Ver: 2.1</span>
      </div>
    </div>
  );
};

export default IndexingLog;
