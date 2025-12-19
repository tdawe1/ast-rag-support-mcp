
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
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
  const [hybridSearch, setHybridSearch] = useState(true);
  const [useReranker, setUseReranker] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [viewingChunk, setViewingChunk] = useState<CodeChunk | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setExpansion(null);
    setResults([]);

    const expanded = await geminiService.expandQuery(query);
    setExpansion(expanded);

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
          id: 'v2',
          content: `class AuthProvider {\n  constructor(config: AuthConfig) {\n    this.strategy = new OAuth2Strategy(config);\n  }\n\n  async authenticate(req: Request) {\n    return this.strategy.authenticate(req);\n  }\n}`,
          file_path: 'services/auth-service/provider.ts',
          start_line: 12,
          end_line: 22,
          node_type: NodeType.CLASS,
          repo_id: 'auth-microservice',
          score: 0.912,
          originalScore: 0.912,
          access_group: 'public',
          match_type: 'dense'
        },
        {
          id: 'k1',
          content: `// Keywords match: "auth", "token", "jwt"\nexport const AUTH_HEADER = 'Authorization';\nexport const TOKEN_PREFIX = 'Bearer ';`,
          file_path: 'constants/security.ts',
          start_line: 5,
          end_line: 8,
          node_type: NodeType.MODULE,
          repo_id: 'main-app',
          score: 0.740,
          originalScore: 0.740,
          access_group: 'public',
          match_type: 'bm25'
        }
      ];

      setIsSearching(false);
      
      if (useReranker) {
        setIsReranking(true);
        setTimeout(() => {
          const reranked = initialResults.map(res => {
            let newScore = res.score || 0;
            if (res.id === 'v1') newScore = 0.985;
            if (res.id === 'v2') newScore = 0.824;
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
          <h2 className="text-2xl font-bold">Semantic Search <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase ml-2 tracking-widest font-bold">Phase 5</span></h2>
          <p className="text-slate-400 text-sm">Cross-encoder re-ranking & query expansion enabled.</p>
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
          placeholder="Query code logic, e.g. 'How is user identity verified?'"
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

      {isReranking && (
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 flex items-center justify-between animate-pulse">
           <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Cross-Encoder Processing Top 50 hits...</span>
           </div>
           <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
           </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((res) => (
            <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors shadow-sm relative group">
              <div className="bg-slate-800/50 px-4 py-2 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-widest ${
                    res.match_type === 'reranked' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {res.match_type}
                  </span>
                  <span className="mono font-medium text-slate-300 truncate max-w-[200px]">{res.file_path}</span>
                </div>
                <div className="flex items-center space-x-4">
                  {res.match_type === 'reranked' && (
                    <span className="text-[9px] text-slate-500 italic">
                      Boost: +{(((res.score || 0) - (res.originalScore || 0)) * 100).toFixed(1)}%
                    </span>
                  )}
                  <span className={`font-mono font-bold ${res.score && res.score > 0.9 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {(res.score! * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-slate-950/30">
                <pre className="mono text-xs leading-relaxed text-slate-300 overflow-x-auto whitespace-pre scrollbar-hide">
                  {res.content}
                </pre>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setViewingChunk(res)}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                >
                  Inspect Node
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
