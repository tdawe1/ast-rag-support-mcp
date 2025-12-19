
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  SEARCH = 'SEARCH',
  REPOSITORIES = 'REPOSITORIES',
  SECURITY = 'SECURITY',
  LOGS = 'LOGS'
}

export enum NodeType {
  FUNCTION = 'function_definition',
  CLASS = 'class_definition',
  METHOD = 'method_definition',
  MODULE = 'module'
}

export type AccessGroup = 'public' | 'internal' | 'restricted';
export type MatchType = 'dense' | 'bm25' | 'hybrid';
export type TransportType = 'STDIO' | 'SSE' | 'HTTP';

export interface CodeChunk {
  id: string;
  content: string;
  file_path: string;
  start_line: number;
  end_line: number;
  node_type: NodeType;
  repo_id: string;
  score?: number;
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
  type: 'CREATE' | 'MODIFY' | 'DELETE' | 'INFO' | 'AST_PARSE' | 'SECURITY';
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
