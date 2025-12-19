
import React, { useState, useEffect, useRef } from 'react';
import { IndexingEvent } from '../types';

const IndexingLog: React.FC = () => {
  const [logs, setLogs] = useState<IndexingEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const files = [
      'auth_middleware.py', 'user_model.go', 'app_controller.ts', 
      'architecture_overview.pdf', 'api_spec.md', 'security_compliance.pdf',
      'node_modules/lodash/index.js', '.env.local', 'README.md'
    ];
    
    const interval = setInterval(() => {
      const file = files[Math.floor(Math.random() * files.length)];
      
      let type: IndexingEvent['type'];
      let message = '';
      let details = '';

      const isNoise = file.includes('node_modules') || file.includes('.env');
      
      if (isNoise && Math.random() > 0.3) {
        type = 'SKIP';
        message = `WATCHER: Skipping noise file ${file}`;
        details = 'Matched exclude pattern.';
      } else {
        const ext = file.split('.').pop();
        
        if (ext === 'pdf') {
          type = 'DOC_EXTRACT';
          message = `OCR_ENGINE: Extracting text from ${file}`;
          details = `Page ${Math.floor(Math.random() * 20) + 1} processed via PDF.js`;
        } else if (ext === 'md') {
          type = 'DOC_EXTRACT';
          message = `MARKDOWN: Sectioning ${file}`;
          details = `Detected header: ${['## Auth', '### Setup', '## Scaling'][Math.floor(Math.random() * 3)]}`;
        } else {
          type = Math.random() > 0.4 ? 'MODIFY' : (Math.random() > 0.5 ? 'AST_PARSE' : 'CREATE');
          
          switch (type) {
            case 'MODIFY':
              message = `FS_EVENT: Change in ${file}`;
              details = 'Recalculating hash...';
              break;
            case 'CREATE':
              message = `FS_EVENT: New source ${file}`;
              details = 'Queuing for vectorization...';
              break;
            case 'AST_PARSE':
              message = `AST_SYNC: Extracted node from ${file}`;
              details = `Tree-Sitter depth: ${Math.floor(Math.random() * 5)}`;
              break;
          }
        }
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
    }, 2000);

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
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Multimodal Sync Engine</span>
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
        {logs.map((log) => (
          <div key={log.id} className="group flex items-start space-x-4 py-1 border-b border-slate-900/50 hover:bg-slate-800/20 transition-colors">
            <span className="text-slate-600 shrink-0">{log.timestamp}</span>
            <span className={`shrink-0 font-bold px-1.5 rounded-[2px] ${
              log.type === 'DOC_EXTRACT' ? 'bg-emerald-500/10 text-emerald-400' : 
              log.type === 'AST_PARSE' ? 'bg-purple-500/10 text-purple-400' : 
              log.type === 'SKIP' ? 'bg-slate-800 text-slate-500' : 'text-slate-400'
            }`}>
              {(log.type as string).padEnd(11)}
            </span>
            <div className="flex-1 min-w-0">
               <div className={`truncate font-medium ${log.type === 'SKIP' ? 'text-slate-600' : 'text-slate-300'}`}>{log.message}</div>
               {log.details && <div className="text-slate-600 text-[10px]">{log.details}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-slate-900/50 px-4 py-2 border-t border-slate-800 text-[9px] text-slate-500 flex justify-between uppercase">
         <span className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>LanceDB Table: multimodal_chunks</span>
         <span className="font-mono">Total Shards: 8</span>
      </div>
    </div>
  );
};

export default IndexingLog;
