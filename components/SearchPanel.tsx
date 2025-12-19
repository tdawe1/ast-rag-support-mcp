
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
  const [expansion, setExpansion] = useState<ExpandedQuery | null>(null);
  const [results, setResults] = useState<CodeChunk[]>([]);
  const [hybridSearch, setHybridSearch] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [viewingChunk, setViewingChunk] = useState<CodeChunk | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setExpansion(null);

    // Optimized Query Expansion (Phase 3)
    const expanded = await geminiService.expandQuery(query);
    setExpansion(expanded);

    // Hybrid Search Simulation Logic
    setTimeout(() => {
      const allPossibleResults: CodeChunk[] = [
        {
          id: 'v1',
          content: `async function validateUser(token: string): Promise<User | null> {\n  const decoded = await jwt.verify(token, process.env.SECRET);\n  return db.users.findUnique({ where: { id: decoded.sub } });\n}`,
          file_path: 'src/lib/auth.ts',
          start_line: 142,
          end_line: 146,
          node_type: NodeType.FUNCTION,
          repo_id: 'main-app',
          score: 0.942,
          access_group: 'public',
          match_type: 'hybrid'
        },
        {
          id: 'k1',
          content: `// Keywords match: "auth", "token", "jwt"\nexport const AUTH_HEADER = 'Authorization';\nexport const TOKEN_PREFIX = 'Bearer ';`,
          file_path: 'constants/security.ts',
          start_line: 5,
          end_line: 8,
          node_type: NodeType.MODULE,
          repo_id: 'main-app',
          score: 0.910,
          access_group: 'public',
          match_type: 'bm25'
        },
        {
          id: 'v2',
          content: `class AuthProvider {\n  constructor(config: AuthConfig) {\n    this.strategy = new OAuth2Strategy(config);\n  }\n\n  async authenticate(req: Request) {\n    return this.strategy.authenticate(req);\n  }\n}`,
          file_path: 'services/auth-service/provider.ts',
          start_line: 12,
          end_line: 22,
          node_type: NodeType.CLASS,
          repo_id: 'auth-microservice',
          score: 0.887,
          access_group: 'public',
          match_type: 'dense'
        },
        {
          id: 'secret-key',
          content: `// Restricted internal security logic\nconst INTERNAL_SECURITY_SALT = '0x9a2b4c6d8e';\nexport function generateLegacyHash(p: string) {\n  return crypto.pbkdf2Sync(p, INTERNAL_SECURITY_SALT, 1000, 64, 'sha512');\n}`,
          file_path: 'internal/crypto/legacy.go',
          start_line: 1,
          end_line: 5,
          node_type: NodeType.FUNCTION,
          repo_id: 'main-app',
          score: 0.812,
          access_group: 'restricted',
          match_type: 'dense'
        }
      ];

      // Filtering and Sorting
      let filtered = allPossibleResults.filter(chunk => {
        if (selectedRepo !== 'all' && chunk.repo_id !== selectedRepo) return false;
        if (userRole === 'Admin') return true;
        if (userRole === 'Developer') return chunk.access_group !== 'restricted';
        if (userRole === 'Viewer') return chunk.access_group === 'public';
        return false;
      });

      // Simulation: If Hybrid is OFF, remove BM25-only matches
      if (!hybridSearch) {
        filtered = filtered.filter(f => f.match_type !== 'bm25');
      }

      setResults(filtered.sort((a, b) => (b.score || 0) - (a.score || 0)));
      setIsSearching(false);
    }, 1500);
  };

  const getMatchTypeStyles = (type?: MatchType) => {
    switch (type) {
      case 'hybrid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'bm25': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'dense': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Semantic Search <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase ml-2 tracking-widest font-bold">Phase 3</span></h2>
          <p className="text-slate-400 text-sm">Hybrid retrieval combining vector embeddings and full-text indexing.</p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
           <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={hybridSearch} 
                onChange={() => setHybridSearch(!hybridSearch)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-400">Hybrid BM25</span>
           </label>
           <select 
             value={selectedRepo}
             onChange={(e) => setSelectedRepo(e.target.value)}
             className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded-md px-2 py-1 focus:outline-none"
           >
             <option value="all">All Repositories</option>
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
          placeholder="Query code logic, e.g. 'JWT validation sequence'"
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg text-lg"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-6 rounded-xl font-semibold transition-colors flex items-center"
        >
          {isSearching ? 'Processing...' : 'Search'}
        </button>
      </form>

      {!isSearching && expansion && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-start">
            <div className="bg-blue-500/10 p-2 rounded-lg mr-4 shrink-0">
              <span className="text-xl">🤖</span>
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Optimized Intent Analysis</h4>
                  <p className="text-sm font-medium text-blue-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                    Targeting: {expansion.intent}
                  </p>
                </div>
                <div className="bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-700">
                  GEMINI-3-FLASH
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">Semantic Expansion</h4>
                <p className="text-sm text-slate-300 italic">"{expansion.expanded}"</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {expansion.keywords.map((k, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded mono border border-slate-700">
                    {k}
                  </span>
                ))}
              </div>
              <div className="mt-2">
                 <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Hypothetical Match (Dense Anchor)</h4>
                 <pre className="text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto mono text-emerald-400/80">
                   {expansion.hypotheticalCode}
                 </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-sm font-semibold text-slate-400">Search Results</h3>
             <div className="flex space-x-2">
                <span className="text-[10px] text-slate-600 flex items-center"><span className="w-2 h-2 rounded bg-blue-500/20 mr-1 border border-blue-500/30"></span>Dense</span>
                <span className="text-[10px] text-slate-600 flex items-center"><span className="w-2 h-2 rounded bg-yellow-500/20 mr-1 border border-yellow-500/30"></span>BM25</span>
                <span className="text-[10px] text-slate-600 flex items-center"><span className="w-2 h-2 rounded bg-emerald-500/20 mr-1 border border-emerald-500/30"></span>Hybrid</span>
             </div>
          </div>
          {results.map((res) => (
            <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors shadow-sm relative group">
              <div className="bg-slate-800/50 px-4 py-2 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-widest ${getMatchTypeStyles(res.match_type)}`}>
                    {res.match_type}
                  </span>
                  <span className="mono font-medium text-slate-300 truncate max-w-[200px]">{res.file_path}</span>
                  <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-[10px] uppercase font-bold tracking-tighter">
                    {res.node_type.split('_')[0]}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500 hidden sm:inline">L{res.start_line}-{res.end_line}</span>
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
              <div className="px-4 py-2.5 bg-slate-900/50 border-t border-slate-800/50 flex justify-end space-x-2">
                <button 
                  onClick={() => setViewingChunk(res)}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-md"
                >
                  View Full File
                </button>
                <button className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-md">
                   Reference
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Viewer Modal */}
      {viewingChunk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <div className="flex flex-col">
                    <h3 className="font-bold text-slate-200">{viewingChunk.file_path}</h3>
                    <span className="text-[10px] text-slate-500 mono">code://{viewingChunk.repo_id}/{viewingChunk.file_path}</span>
                 </div>
                 <button 
                   onClick={() => setViewingChunk(null)}
                   className="text-slate-400 hover:text-white text-xl"
                 >✕</button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-slate-950">
                 <pre className="mono text-xs leading-6 text-slate-400">
                   {`// Phase 3 AST Context Exploration\n// Full source context for ${viewingChunk.node_type}\n\n` + 
                    `import { ${viewingChunk.node_type === 'function_definition' ? 'func' : 'class'} } from 'base-lib';\n\n` +
                    `${viewingChunk.content}\n\n`.repeat(5)}
                 </pre>
              </div>
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-end items-center space-x-3">
                 <button 
                  onClick={() => setViewingChunk(null)}
                  className="px-6 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-bold uppercase tracking-widest"
                 >Close Context</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
