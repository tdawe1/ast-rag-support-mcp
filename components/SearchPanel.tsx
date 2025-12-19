
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { ExpandedQuery, CodeChunk, NodeType, UserRole, Repository, AccessGroup } from '../types';

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

    // Step 1: Query Expansion via Gemini (FR-04)
    const expanded = await geminiService.expandQuery(query);
    setExpansion(expanded);

    // Step 2: Simulated Vector Retrieval from LanceDB with Permission Filtering (FR-05)
    setTimeout(() => {
      const allPossibleResults: CodeChunk[] = [
        {
          id: '1',
          content: `async function validateUser(token: string): Promise<User | null> {\n  const decoded = await jwt.verify(token, process.env.SECRET);\n  return db.users.findUnique({ where: { id: decoded.sub } });\n}`,
          file_path: 'src/lib/auth.ts',
          start_line: 142,
          end_line: 146,
          node_type: NodeType.FUNCTION,
          repo_id: 'main-app',
          score: 0.942,
          access_group: 'public'
        },
        {
          id: '2',
          content: `class AuthProvider {\n  constructor(config: AuthConfig) {\n    this.strategy = new OAuth2Strategy(config);\n  }\n\n  async authenticate(req: Request) {\n    return this.strategy.authenticate(req);\n  }\n}`,
          file_path: 'services/auth-service/provider.ts',
          start_line: 12,
          end_line: 22,
          node_type: NodeType.CLASS,
          repo_id: 'auth-microservice',
          score: 0.887,
          access_group: 'public'
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
          access_group: 'restricted'
        },
        {
          id: 'internal-tool',
          content: `function cleanupLogs() {\n  fs.rmSync('./logs', { recursive: true, force: true });\n}`,
          file_path: 'scripts/cleanup.js',
          start_line: 5,
          end_line: 7,
          node_type: NodeType.FUNCTION,
          repo_id: 'main-app',
          score: 0.725,
          access_group: 'internal'
        }
      ];

      // Filtering logic based on User Role (FR-05 simulation)
      const filtered = allPossibleResults.filter(chunk => {
        if (selectedRepo !== 'all' && chunk.repo_id !== selectedRepo) return false;
        
        if (userRole === 'Admin') return true;
        if (userRole === 'Developer') return chunk.access_group !== 'restricted';
        if (userRole === 'Viewer') return chunk.access_group === 'public';
        return false;
      });

      setResults(filtered);
      setIsSearching(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Semantic Code Search</h2>
          <p className="text-slate-400 text-sm">Find logic, not just strings, using vector embeddings and AST parsing.</p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
           <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={hybridSearch} 
                onChange={() => setHybridSearch(!hybridSearch)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-400">Hybrid BM25 (FR-05)</span>
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
          placeholder="e.g., How is the authentication flow handled in the backend?"
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg text-lg"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-6 rounded-xl font-semibold transition-colors flex items-center"
        >
          {isSearching ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
          ) : 'Search'}
        </button>
      </form>

      {isSearching && (
        <div className="flex items-center justify-center p-12 text-slate-400">
           <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="animate-pulse">Gemini is expanding your query for semantic accuracy...</p>
           </div>
        </div>
      )}

      {!isSearching && expansion && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-start">
            <div className="bg-blue-500/10 p-2 rounded-lg mr-4">
              <span className="text-xl">🤖</span>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Query Expansion (FR-04)</h4>
                  <p className="text-sm text-slate-300 italic">"{expansion.expanded}"</p>
                </div>
                <div className="bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-700">
                  GEMINI-3-FLASH
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {expansion.keywords.map((k, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded mono border border-slate-700">
                    {k}
                  </span>
                ))}
              </div>
              {expansion.hypotheticalCode && (
                <div className="mt-2">
                   <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Hypothetical Match</h4>
                   <pre className="text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto mono text-emerald-400/80">
                     {expansion.hypotheticalCode}
                   </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 ml-1">Top Matches ({results.length})</h3>
          {results.map((res) => (
            <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors shadow-sm relative">
              {res.access_group !== 'public' && (
                <div className="absolute top-10 right-0 bg-slate-800 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-yellow-500 border-l border-b border-slate-700 rounded-bl-md z-10">
                  {res.access_group} access
                </div>
              )}
              <div className="bg-slate-800/50 px-4 py-2 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-3">
                  <span className="mono font-medium text-slate-300">{res.file_path}</span>
                  <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-[10px] uppercase font-bold tracking-tighter">
                    {res.node_type.split('_')[0]}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500">Lines {res.start_line}-{res.end_line}</span>
                  <span className={`font-mono ${res.score && res.score > 0.9 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {(res.score! * 100).toFixed(1)}% match
                  </span>
                </div>
              </div>
              <div className="p-4">
                <pre className="mono text-xs leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
                  {res.content}
                </pre>
              </div>
              <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-800/50 flex justify-end space-x-2">
                <button 
                  onClick={() => setViewingChunk(res)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-md"
                >
                  View Full File
                </button>
                <button className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-md">
                   Copy Reference
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Viewer Modal (FR-07 Simulation) */}
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
                   {/* Simulated Full File Content */}
                   {`import { ${viewingChunk.node_type === 'function_definition' ? 'func' : 'class'} } from 'base-lib';\n\n// Standard headers and imports...\n\n/**\n * Main implementation of the module logic.\n */\n\n${viewingChunk.content}\n\n// End of file...\n`.repeat(5)}
                 </pre>
              </div>
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-end items-center space-x-3">
                 <span className="text-[10px] text-slate-500 font-mono italic mr-auto">MIME: text/x-typescript</span>
                 <button className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">Download</button>
                 <button 
                  onClick={() => setViewingChunk(null)}
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold"
                 >Close</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
