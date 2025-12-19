
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  SEARCH = 'SEARCH',
  REPOSITORIES = 'REPOSITORIES',
  RESOURCES = 'RESOURCES',
  PROMPTS = 'PROMPTS',
  SECURITY = 'SECURITY',
  LOGS = 'LOGS',
  SETTINGS = 'SETTINGS'
}

export enum NodeType {
  // Code Nodes
  FUNCTION = 'function_definition',
  CLASS = 'class_definition',
  METHOD = 'method_definition',
  MODULE = 'module',
  // Document Nodes
  PARAGRAPH = 'paragraph',
  SECTION = 'section',
  PAGE = 'pdf_page',
  LIST_ITEM = 'list_item'
}

export type AccessGroup = 'public' | 'internal' | 'restricted';
export type MatchType = 'dense' | 'bm25' | 'hybrid' | 'reranked';
export type TransportType = 'STDIO' | 'SSE' | 'HTTP';
export type ModelProvider = 'GEMINI' | 'LOCAL';

export interface ModelConfig {
  provider: ModelProvider;
  localEndpoint: string;
  localModel: string;
}

export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  template: string;
  arguments: PromptArgument[];
}

export interface ResourceTemplate {
  id: string;
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface CodeChunk {
  id: string;
  content: string;
  file_path: string;
  start_line?: number;
  end_line?: number;
  page_number?: number;
  section_title?: string;
  node_type: NodeType;
  repo_id: string;
  score?: number;
  originalScore?: number;
  access_group: AccessGroup;
  match_type?: MatchType;
}

export interface Repository {
  id: string;
  name: string;
  path: string;
  lastIndexed: string;
  fileCount: number;
  chunkCount: number;
  status: 'active' | 'indexing' | 'error';
  progress?: number;
  ignorePatterns?: string[];
}

export interface AccessLogEntry {
  id: string;
  timestamp: string;
  principal: string;
  action: string;
  resource: string;
  status: 'GRANTED' | 'DENIED';
  reason?: string;
}

export interface IndexingEvent {
  id: string;
  timestamp: string;
  type: 'CREATE' | 'MODIFY' | 'DELETE' | 'INFO' | 'AST_PARSE' | 'DOC_EXTRACT' | 'SECURITY' | 'SKIP';
  file: string;
  message: string;
  details?: string;
}

export interface ExpandedQuery {
  original: string;
  expanded: string;
  keywords: string[];
  hypotheticalCode: string;
  intent?: string;
}

export type UserRole = 'Admin' | 'Developer' | 'Viewer';
