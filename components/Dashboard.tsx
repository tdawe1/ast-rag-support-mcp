
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { Repository } from '../types';

interface DashboardProps {
  repositories: Repository[];
}

const Dashboard: React.FC<DashboardProps> = ({ repositories }) => {
  const totalFiles = repositories.reduce((acc, r) => acc + r.fileCount, 0);
  const totalChunks = repositories.reduce((acc, r) => acc + r.chunkCount, 0);

  const stats = [
    { label: 'Total Files', value: totalFiles.toLocaleString(), icon: '📄', color: 'text-blue-400' },
    { label: 'Vector Chunks', value: totalChunks.toLocaleString(), icon: '🧩', color: 'text-emerald-400' },
    { label: 'Avg Ingest Latency', value: '1.2s', icon: '⚡', color: 'text-yellow-400' },
    { label: 'Storage Used', value: (totalChunks * 0.05 / 1024).toFixed(1) + ' GB', icon: '💾', color: 'text-purple-400' },
  ];

  const langData = [
    { name: 'TypeScript', value: 45, color: '#3178c6' },
    { name: 'Python', value: 30, color: '#3776ab' },
    { name: 'Go', value: 15, color: '#00add8' },
    { name: 'Rust', value: 10, color: '#dea584' },
  ];

  const activityData = [
    { time: '09:00', changes: 12 },
    { time: '10:00', changes: 45 },
    { time: '11:00', changes: 30 },
    { time: '12:00', changes: 85 },
    { time: '13:00', changes: 15 },
    { time: '14:00', changes: 60 },
    { time: '15:00', changes: 35 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">System Overview</h2>
        <p className="text-slate-400 text-sm">Real-time vector engine and parsing statistics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <span className={`text-2xl ${s.color}`}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold mb-6 text-slate-300">File System Activity (Last 6 Hours)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                />
                <Bar dataKey="changes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold mb-6 text-slate-300">Language Distribution</h3>
          <div className="h-64 flex flex-col justify-center items-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={langData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {langData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full px-4">
              {langData.map(l => (
                <div key={l.name} className="flex items-center text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: l.color }}></div>
                  {l.name} ({l.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
