
import React, { useState } from 'react';
import { intelligenceService } from '../services/intelligenceService';
import { ExpandedQuery, CodeChunk, NodeType, UserRole, Repository, MatchType } from '../types';

interface SearchPanelProps {
  userRole: UserRole;
  repositories: Repository[];
}

const SearchPanel: React.FC<SearchPanelProps> = ({ userRole, repositories }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReranking, setIsReranking] = useState(false);
  const [expansion, setExpansion] = useState<ExpandedQuery | null>(null);
  const [results, setResults] = useState<CodeChunk[]>([]);
  const [useReranker, setUseReranker] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [viewingChunk, setViewingChunk] = useState<CodeChunk | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setExpansion(null);
    setResults([]);

    try {
      const expanded = await intelligenceService.expandQuery(query);
      setExpansion(expanded);
    } catch (err) {
      console.error("Expansion failed", err);
    }

    setTimeout(() => {
      const initialResults: CodeChunk[] = [
        {
          id: 'v1',
          content: `async function validateUser(token: string): Promise<User | null> {\n  const decoded = await jwt.verify(token, process.env.SECRET);\n  return db.users.findUnique({ where: { id: decoded.sub } });\n}`,
          file_path: 'src/lib/auth.ts',
          start_line: 142,
          end_line: 146,
          node_type: NodeType.FUNCTION,
          repo_id: 'main-app',
          score: 0.882,
          originalScore: 0.882,
          access_group: 'public',
          match_type: 'dense'
        },
        {
          id: 'doc1',
          content: `## Authentication Flow\nThe system uses JWT tokens for identity verification. Tokens are expected in the 'Authorization' header using the 'Bearer' scheme. After extraction, tokens are validated against the primary auth provider.`,
          file_path: 'docs/architecture.md',
          section_title: 'Authentication Flow',
          node_type: NodeType.SECTION,
          repo_id: 'main-app',
          score: 0.945,
          originalScore: 0.945,
          access_group: 'public',
          match_type: 'dense'
        },
        {
          id: 'pdf1',
          content: `Security Compliance Requirement 4.2: All external API calls must be logged with a unique trace ID. The trace ID must be propagated from the incoming request headers to downstream services.`,
          file_path: 'compliance/security_specs_2024.pdf',
          page_number: 14,
          node_type: NodeType.PAGE,
          repo_id: 'auth-microservice',
          score: 0.812,
          originalScore: 0.812,
          access_group: 'internal',
          match_type: 'dense'
        }
      ];

      setIsSearching(false);
      
      if (useReranker) {
        setIsReranking(true);
        setTimeout(() => {
          const reranked = initialResults.map(res => {
            let newScore = res.score || 0;
            if (res.id === 'doc1') newScore = 0.992;
            if (res.id === 'v1') newScore = 0.965;
            return { ...res, score: newScore, match_type: 'reranked' as MatchType };
          }).sort((a, b) => (b.score || 0) - (a.score || 0));
          
          setResults(reranked);
          setIsReranking(false);
        }, 1200);
      } else {
        setResults(initialResults.sort((a, b) => (b.score || 0) - (a.score || 0)));
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Semantic Search <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase ml-2 tracking-widest font-bold">Multimodal</span></h2>
          <p className="text-slate-400 text-sm">Unified retrieval for Code (AST), PDFs, and Markdown documentation.</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800">
           <button 
             onClick={() => setUseReranker(!useReranker)}
             className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${useReranker ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-500'}`}
           >
             Reranker {useReranker ? 'ON' : 'OFF'}
           </button>
           <select 
             value={selectedRepo}
             onChange={(e) => setSelectedRepo(e.target.value)}
             className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded-md px-2 py-1 focus:outline-none"
           >
             <option value="all">All Repos</option>
             {repositories.map(r => (
               <option key={r.id} value={r.id}>{r.name}</option>
             ))}
           </select>
        </div>
      </header>

      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about logic or documentation, e.g. 'How are JWTs verified?'"
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg text-lg"
        />
        <button
          type="submit"
          disabled={isSearching || isReranking}
          className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-6 rounded-xl font-semibold transition-colors flex items-center"
        >
          {isSearching ? 'Retrieving...' : isReranking ? 'Re-scoring...' : 'Search'}
        </button>
      </form>

      {expansion && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Optimizer</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono uppercase">{expansion.intent}</span>
           </div>
           <p className="text-sm text-slate-300 leading-relaxed italic">"{expansion.expanded}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((res) => (
            <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors shadow-sm relative group">
              <div className="bg-slate-800/50 px-4 py-2 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-widest ${
                    res.file_path.endsWith('.pdf') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    res.file_path.endsWith('.md') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {res.node_type}
                  </span>
                  <span className="mono font-medium text-slate-300 truncate max-w-[200px]">{res.file_path}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-[9px] text-slate-500 font-mono">
                    {res.page_number ? `PAGE ${res.page_number}` : res.start_line ? `L${res.start_line}` : 'DOC'}
                  </span>
                  <span className={`font-mono font-bold ${res.score && res.score > 0.9 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {(res.score! * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-slate-950/30">
                <div className={`text-sm leading-relaxed text-slate-300 ${!res.file_path.endsWith('.ts') ? 'font-sans' : 'mono text-xs'}`}>
                  {res.content}
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setViewingChunk(res)}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                >
                  Inspect Meta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {viewingChunk && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Node Inspector</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-xs font-mono text-slate-300">{viewingChunk.file_path}</span>
                 </div>
                 <button onClick={() => setViewingChunk(null)} className="text-slate-500 hover:text-white transition-colors">Close</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                       <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Source Type</p>
                       <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">
                          {viewingChunk.file_path.split('.').pop()}
                       </p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                       <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Location Info</p>
                       <p className="text-sm font-bold text-slate-300 mono">
                          {viewingChunk.page_number ? `Page ${viewingChunk.page_number}` : `Lines ${viewingChunk.start_line}-${viewingChunk.end_line}`}
                       </p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                       <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Mime Group</p>
                       <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">{viewingChunk.access_group}</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Extracted Content</p>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto">
                       <pre className={`text-slate-300 leading-relaxed whitespace-pre-wrap ${viewingChunk.file_path.endsWith('.ts') ? 'mono text-xs' : 'text-sm'}`}>
                          {viewingChunk.content}
                       </pre>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
