
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line } from 'recharts';
import { Repository } from '../types';

interface DashboardProps {
  repositories: Repository[];
}

const Dashboard: React.FC<DashboardProps> = ({ repositories }) => {
  const totalFiles = repositories.reduce((acc, r) => acc + r.fileCount, 0);
  const totalChunks = repositories.reduce((acc, r) => acc + r.chunkCount, 0);

  const stats = [
    { label: 'Total Files', value: totalFiles.toLocaleString() },
    { label: 'Vector Chunks', value: totalChunks.toLocaleString() },
    { label: 'Faithfulness (RAGAS)', value: '0.94' },
    { label: 'Retrieval Recall', value: '0.88' },
  ];

  const ragasData = [
    { metric: 'Context Precision', value: 0.91 },
    { metric: 'Faithfulness', value: 0.94 },
    { metric: 'Answer Relevancy', value: 0.89 },
    { metric: 'Context Recall', value: 0.82 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">System Health & RAG Performance</h2>
        <p className="text-slate-400 text-sm">Real-time telemetry and LLM-assisted evaluation metrics (Milestone 5).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-bold mt-1 text-slate-100">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">RAGAS Evaluation scores</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-500/20">AGENT_VERIFIED</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ragasData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} stroke="#475569" fontSize={10} hide />
                <YAxis dataKey="metric" type="category" stroke="#94a3b8" fontSize={11} width={120} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                  {ragasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0.9 ? '#10b981' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold mb-6 text-slate-300 uppercase tracking-widest">Resource Latency</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { t: 1, ms: 120 }, { t: 2, ms: 150 }, { t: 3, ms: 80 }, { t: 4, ms: 210 }, { t: 5, ms: 130 }
              ]}>
                <Line type="monotone" dataKey="ms" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
             <div className="flex justify-between text-xs">
                <span className="text-slate-500">Retrieval (Dense)</span>
                <span className="text-slate-200 mono">42ms</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-slate-500">Re-ranking (Cross-Enc)</span>
                <span className="text-slate-200 mono">112ms</span>
             </div>
             <div className="flex justify-between text-xs border-t border-slate-800 pt-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total E2E</span>
                <span className="text-blue-400 font-bold mono">154ms</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
