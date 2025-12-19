# rag-support: MCP RAG Admin Dashboard

`rag-support` is a high-performance administrative command center for a local-first Model Context Protocol (MCP) server. It provides deep visibility into semantic retrieval operations, codebase indexing, and real-time synchronization events.

## 🚀 Dashboard Features

### 1. Semantic Intelligence
- **Gemini-Powered Query Expansion**: Automatically transforms simple user queries into dense technical search payloads using `gemini-3-flash-preview`.
- **Cross-Encoder Re-ranking**: Visualizes high-precision semantic verification of initial vector hits, including score boost metrics.
- **Hybrid Search**: Combines Dense Vector retrieval (LanceDB) with BM25 keyword matching.

### 2. MCP Lifecycle Management
- **Prompt Manager**: Define and test reusable instruction templates with variable injection (e.g., `{code_content}`, `{file_path}`).
- **Resource Templates**: Manage dynamic URI patterns (e.g., `code://`, `ast://`) and read-only data extraction hooks.
- **Transport Control**: Real-time monitor for SSE (Server-Sent Events) streams, allowing for live debugging of JSON-RPC 2.0 messages.

### 3. Codebase Observability
- **AST Chunking Visualization**: Monitor functional node extraction via Tree-Sitter (classes, functions, methods).
- **Reactive Sync Logs**: A live-scrolling view of filesystem observer events (`CREATE`, `MODIFY`, `DELETE`).
- **RAGAS Telemetry**: Advanced evaluation metrics including Faithfulness, Context Precision, and Answer Relevancy.

### 4. Enterprise Security
- **RBAC Simulator**: Toggle between Admin, Developer, and Viewer roles to verify access control policies.
- **Claims Inspector**: Real-time JWT decoding and scope validation for secure MCP interactions.
- **Security Audit Trail**: Comprehensive logging of principal actions against protected resources.

## 🛠 Technical Architecture

- **Frontend**: React 19, Tailwind CSS
- **Visualization**: Recharts for performance telemetry
- **Backend (Server Spec)**:
  - **Runtime**: Python 3.11+
  - **Vector Engine**: LanceDB (Parquet-based)
  - **Embedding Model**: `jina-embeddings-v2-base-code`
  - **Parsing**: Tree-sitter AST engine

## 🗺 Implementation Roadmap

- [x] **Milestone 1: Core Logic**: Tree-sitter integration and LanceDB storage schema.
- [x] **Milestone 2: MCP Binding**: Stdio server implementation and retrieval tool suite.
- [x] **Milestone 3: Synchronization**: Filesystem observer integration and query expansion optimization.
- [x] **Milestone 4: Security (Phase 2)**: Access_group filtering and token-based claims validation.
- [x] **Milestone 5: Advanced Intelligence**: MCP Prompts, Resource Templates, and RAGAS telemetry.

## 🔑 Environment Requirements

The dashboard requires `process.env.API_KEY` to be configured for the Query Expansion service. This key enables the integrated Gemini models to perform semantic analysis and hypothetical code generation.
