
# rag-support (MCP RAG Server)

rag-support is a local-first Model Context Protocol (MCP) server providing semantic retrieval over codebases. It implements AST-based parsing to maintain logic boundaries and utilizes a reactive filesystem watcher for real-time index synchronization.

## System Architecture

- **Runtime**: Python 3.11+
- **Transport Layer**: Supports stdio and SSE/HTTP interfaces (Phase 4).
- **Vector Engine**: LanceDB (Parquet-based, embedded storage).
- **Embedding Model**: `jina-embeddings-v2-base-code` (8192 token context window).
- **Parsing Engine**: Tree-sitter for language-agnostic AST functional node generation.

## Functional Specifications

### Ingestion & Indexing
- **AST Chunking**: Source files are parsed into functional nodes (e.g., class definitions, function definitions) rather than fixed line-count chunks.
- **Reactive Sync**: Filesystem watcher integration (e.g., `watchdog`) detects `CREATE`, `MODIFY`, or `DELETE` events and triggers incremental re-indexing.

### Retrieval Logic
- **Hybrid Retrieval**: Combines dense vector search with BM25 keyword matching.
- **Cross-Encoder Re-ranking**: High-precision semantic verification of initial top hits.

## Implementation Roadmap

- [x] **Milestone 1: Core Logic**: Tree-sitter integration and LanceDB storage.
- [x] **Milestone 2: MCP Binding**: Stdio server and retrieval tools.
- [x] **Milestone 3: Synchronization**: Filesystem observer and query expansion.
- [x] **Milestone 4: Security & Networked Transport**: Access_group filtering, SSE transport, and audit logging.
- [x] **Milestone 5: Intelligence & Templates**: MCP Prompts, Resource Templates, Cross-Encoder Re-ranking, and RAGAS telemetry.

## Environment Requirements

The application requires an active environment variable `process.env.API_KEY` for the Query Expansion module to interface with Google Generative AI models.
