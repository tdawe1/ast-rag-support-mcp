import React, { useState, useEffect, useRef } from 'react';
import { TransportType, AccessLogEntry, UserRole } from '../types';

interface SecurityPanelProps {
  userRole: UserRole;
}

interface SSEEvent {
  id: string;
  timestamp: string;
  event: string;
  data: string;
  type: 'incoming' | 'system' | 'error';
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ userRole }) => {
  const [transport, setTransport] = useState<TransportType>('STDIO');
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [token, setToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQWRtaW4iLCJzY29wZXMiOlsic2VhcmNoX2NvZGViYXNlIiwicmVhZF9yZXNvdXJjZSIsInJlaW5kZXhfdGFyZ2V0Il19.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [sseEvents, setSseEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const sseScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulated audit logs generator
    const logInterval = setInterval(() => {
      const actions = ['SEARCH', 'READ_RESOURCE', 'REINDEX'];
      const resources = ['code://main-app/auth.ts', 'tool://search_codebase', 'code://auth-service/secrets.env'];
      const principals = ['claude-3-5-sonnet', 'local-user', 'external-worker'];
      
      const newLog: AccessLogEntry = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        principal: principals[Math.floor(Math.random() * principals.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        resource: resources[Math.floor(Math.random() * resources.length)],
        status: Math.random() > 0.1 ? 'GRANTED' : 'DENIED',
        reason: Math.random() > 0.9 ? 'Insufficient scope for restricted access' : undefined
      };

      setLogs(prev => [newLog, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(logInterval);
  }, []);

  // SSE Stream Simulation
  useEffect(() => {
    if (transport !== 'SSE' || !isConnected) {
      if (transport !== 'SSE') setIsConnected(false);
      setSseEvents([]);
      return;
    }

    const addEvent = (event: string, data: any, type: 'incoming' | 'system' | 'error' = 'incoming') => {
      const newEvent: SSEEvent = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        event,
        data: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
        type
      };
      setSseEvents(prev => [...prev.slice(-24), newEvent]);
    };

    // Initial handshake according to MCP SSE spec
    const timer1 = setTimeout(() => {
      addEvent('endpoint', { uri: "http://localhost:8080/mcp/messages" }, 'system');
    }, 500);

    const timer2 = setTimeout(() => {
      addEvent('notification', { jsonrpc: "2.0", method: "notifications/initialized" }, 'system');
    }, 1200);

    const sseInterval = setInterval(() => {
      const eventTypes = [
        { name: 'notification', method: 'notifications/resources/list_changed', params: {} },
        { name: 'notification', method: 'notifications/tools/list_changed', params: {} },
        { name: 'notification', method: 'notifications/resources/updated', params: { uri: "code://main-app/src/index.ts" } },
        { name: 'heartbeat', method: null, params: { server_time: new Date().toISOString() } }
      ];
      
      const choice = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      if (choice.name === 'heartbeat') {
        addEvent('heartbeat', choice.params, 'system');
      } else {
        addEvent(choice.name, { jsonrpc: "2.0", method: choice.method, params: choice.params });
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(sseInterval);
    };
  }, [transport, isConnected]);

  // Auto-scroll SSE monitor
  useEffect(() => {
    if (sseScrollRef.current) {
      sseScrollRef.current.scrollTop = sseScrollRef.current.scrollHeight;
    }
  }, [sseEvents]);

  const toggleConnection = () => {
    if (transport !== 'SSE') {
      setTransport('SSE');
      setIsConnected(true);
    } else {
      setIsConnected(!isConnected);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Security & Networked Transport</h2>
          <p className="text-slate-400 text-sm">Configure RBAC policies and MCP transport protocols.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
           <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
             {transport} {isConnected ? 'Link Active' : 'Disconnected'}
           </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transport Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Transport Layer Control</h3>
            {transport === 'SSE' && (
              <button 
                onClick={toggleConnection}
                className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-1 rounded transition-colors ${
                  isConnected ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                {isConnected ? 'Terminate SSE' : 'Initialize SSE'}
              </button>
            )}
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-3 uppercase">Protocol Selection</label>
              <div className="grid grid-cols-3 gap-2">
                {(['STDIO', 'SSE', 'HTTP'] as TransportType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTransport(t);
                      if (t === 'SSE') setIsConnected(true);
                      else setIsConnected(false);
                    }}
                    className={`py-2 px-4 rounded-lg text-xs font-bold transition-all border ${
                      transport === t 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {transport === 'SSE' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                    <span className="mr-2">📡</span> Live Event Stream
                  </label>
                  <button 
                    onClick={() => setSseEvents([])}
                    className="text-[9px] text-slate-500 hover:text-slate-300 font-bold uppercase"
                  >
                    Clear Stream
                  </button>
                </div>
                <div 
                  ref={sseScrollRef}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 h-64 overflow-y-auto font-mono text-[10px] space-y-3 scroll-smooth scrollbar-hide"
                >
                  {sseEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-2 opacity-50">
                      <div className="text-2xl">💤</div>
                      <p className="italic">{isConnected ? 'Handshaking...' : 'Connection closed. Select Initialize to begin stream.'}</p>
                    </div>
                  )}
                  {sseEvents.map(ev => (
                    <div key={ev.id} className="animate-in slide-in-from-left-2 duration-300 border-l-2 border-slate-800 pl-3 py-1 hover:bg-white/5 transition-colors group relative">
                      <div className="flex justify-between items-center mb-1">
                        <div className={`font-bold uppercase tracking-tighter text-[9px] ${
                          ev.type === 'system' ? 'text-purple-400' : ev.type === 'error' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          event: {ev.event}
                        </div>
                        <div className="text-[8px] text-slate-600 mono group-hover:text-slate-400 transition-colors">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-slate-300 break-all leading-relaxed whitespace-pre-wrap font-medium">
                        {ev.data}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                  <span className="text-slate-500 font-bold text-[10px] uppercase">Connection Status</span>
                  <span className="text-blue-400 font-bold text-[10px] uppercase">Standard Local IO</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-bold">Standard Endpoint</span>
                    <span className="text-slate-300 mono">{transport === 'STDIO' ? 'OS Pipes (stdin/stdout)' : 'http://localhost:8080/mcp'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-bold">Protocol Timeout</span>
                    <span className="text-slate-300 mono">30,000ms</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-bold">Payload Policy</span>
                    <span className="text-emerald-500 font-bold">JSON-RPC 2.0 Only</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              {transport === 'SSE' 
                ? "The Server-Sent Events transport enables full-duplex-like notifications from the server to agents, supporting real-time resource and tool change tracking."
                : "Standard mode for high-throughput, low-latency local interactions between the host and the MCP RAG engine."}
            </p>
          </div>
        </div>

        {/* Current Session Token */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Claims Inspector</h3>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-bold uppercase border border-blue-500/20">Active JWT</span>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide">Bearer Token (Encoded)</label>
              <div className="relative group">
                <textarea 
                  readOnly
                  value={token}
                  className="w-full h-28 bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] mono text-blue-400/80 focus:outline-none resize-none scrollbar-hide"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(token)}
                  className="absolute bottom-2 right-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide">Decoded Authorization Scopes</label>
              <div className="flex flex-wrap gap-2">
                 <div className="flex items-center px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-bold uppercase">
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                   role:{userRole.toLowerCase()}
                 </div>
                 <div className="flex items-center px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold uppercase">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                   scope:search_codebase
                 </div>
                 <div className="flex items-center px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold uppercase">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                   scope:read_resource
                 </div>
                 {userRole === 'Admin' && (
                   <div className="flex items-center px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-400 font-bold uppercase">
                     <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                     scope:reindex_target
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Security Audit Trail (RBAC Check)</h3>
          <div className="flex items-center space-x-2">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Global Audit Hook: Enabled</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/50 text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter">Timestamp</th>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter">Principal</th>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter">Action</th>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter">Resource</th>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 mono whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-300 flex items-center">
                    <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center mr-2 text-[8px]">👤</div>
                    {log.principal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md font-mono text-[9px] border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 mono text-[10px] truncate max-w-[200px] group-hover:text-slate-200 transition-colors" title={log.resource}>
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`font-bold tracking-widest text-[10px] px-2 py-0.5 rounded-full ${log.status === 'GRANTED' ? 'text-emerald-500 bg-emerald-500/5' : 'text-red-500 bg-red-500/5'}`}>
                        {log.status}
                      </span>
                      {log.reason && <span className="text-[9px] text-slate-600 italic leading-tight mt-1 max-w-[120px]">{log.reason}</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-600 italic">No access attempts recorded in current session.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;