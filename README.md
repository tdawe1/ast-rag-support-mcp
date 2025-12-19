# rag-support (MCP RAG Server)

rag-support is a local-first Model Context Protocol (MCP) server providing semantic retrieval over codebases. It implements AST-based parsing to maintain logic boundaries and utilizes a reactive filesystem watcher for real-time index synchronization.

## System Architecture

- **Runtime**: Python 3.11+
- **Transport Layer**: Supports stdio and SSE/HTTP interfaces.
- **Vector Engine**: LanceDB (Parquet-based, embedded storage).
- **Embedding Model**: `jina-embeddings-v2-base-code` (8192 token context window).
- **Parsing Engine**: Tree-sitter for language-agnostic AST functional node generation.

## Functional Specifications

### Ingestion & Indexing
- **AST Chunking**: Source files are parsed into functional nodes (e.g., class definitions, function definitions) rather than fixed line-count chunks.
- **Reactive Sync**: Filesystem watcher integration (e.g., `watchdog`) detects `CREATE`, `MODIFY`, or `DELETE` events and triggers incremental re-indexing.
- **Deduplication**: Content hashing prevents redundant embedding of unchanged code blocks.

### Retrieval Logic
- **Query Expansion**: Utilizes Gemini 3 Flash to pre-process natural language queries into technical search vectors and hypothetical code signatures.
- **Hybrid Retrieval**: Combines dense vector search with BM25 keyword matching for exact identifier resolution.

## MCP Interface Specification

### Tools (CallTool)
- `search_codebase`: Executes semantic search over indexed repositories.
  - `query` (string): Search parameter.
  - `n_results` (int): Return limit.
  - `repo_id` (string, optional): Scope limit.
- `reindex_target`: Triggers manual full re-indexing of a specific directory.
  - `path` (string): Local directory path.

### Resources (ReadResource)
- `code://{repo_id}/{relative_path}`: Provides direct read access to file contents.
- **MIME Type**: `text/x-{language}`.

## Data Schema

Vector metadata follows a strict schema for forward compatibility with RBAC:

```json
{
  "id": "uuid",
  "vector": "[float32]",
  "payload": {
    "content": "string",
    "file_path": "string",
    "start_line": "int",
    "end_line": "int",
    "node_type": "string",
    "repo_id": "string",
    "access_group": "string"
  }
}
```

## Implementation Roadmap

- **Milestone 1: Core Logic**: Implementation of Tree-sitter integration and LanceDB storage schema.
- **Milestone 2: MCP Binding**: Implementation of stdio server and retrieval tools.
- **Milestone 3: Synchronization**: Filesystem observer integration and query expansion optimization.
- **Milestone 4: Security (Phase 2)**: Implementation of access_group filtering and token-based claims validation.

## Environment Requirements

The application requires an active environment variable `process.env.API_KEY` for the Query Expansion module to interface with Google Generative AI models.