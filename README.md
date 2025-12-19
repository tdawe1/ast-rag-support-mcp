Key Features

    AST-Aware Chunking: Uses tree-sitter to parse Python, TypeScript, Go, and Rust. It indexes code by functional units (nodes) rather than line counts, preserving logic and scope.

    Reactive "Watch-and-Index": A built-in filesystem watcher detects changes in real-time. The vector index is typically updated in < 2 seconds after a file save.

    Gemini-Powered Query Expansion: Automatically transforms vague natural language queries (e.g., "how do we handle auth?") into technical search vectors and hypothetical code signatures using Gemini 3 Flash.

    Local-First Architecture: Powered by LanceDB, an embedded, serverless vector engine that stores data in high-performance Parquet files directly on your machine.

    MCP Integration: Exposes retrieval capabilities via standard MCP Tools (search_codebase) and provides direct file access via a custom code:// URI scheme.

    Admin Dashboard: A beautiful, React-based management interface for monitoring indexing health, exploring vector stats, and testing semantic search.

🛠️Technical Stack

    Runtime: Python 3.11+

    Vector Engine: LanceDB

    Embeddings: jina-embeddings-v2-base-code (8192 token context)

    Parsing: Tree-sitter

    AI: Google Gemini API (@google/genai)

    Frontend: React + Tailwind CSS + Recharts

📋 Roadmap

Phase 1: Core logic, AST parsing, and local LanceDB storage.

Phase 2: MCP Stdio interface and Gemini expansion.

Phase 3: Hybrid Search (Dense Vector + BM25 Keyword matching).

Phase 4: Networked SSE transport and Role-Based Access Control (RBAC).
