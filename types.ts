
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  SEARCH = 'SEARCH',
  REPOSITORIES = 'REPOSITORIES',
  LOGS = 'LOGS'
}

export enum NodeType {
  FUNCTION = 'function_definition',
  CLASS = 'class_definition',
  METHOD = 'method_definition',
  MODULE = 'module'
}

export type AccessGroup = 'public' | 'internal' | 'restricted';

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
}

export interface Repository {
  id: string;
  name: string;
  path: string;
  lastIndexed: string;
  fileCount: number;
  chunkCount: number;
  status: 'active' | 'indexing' | 'error';
}

export interface IndexingEvent {
  id: string;
  timestamp: string;
  type: 'CREATE' | 'MODIFY' | 'DELETE' | 'INFO';
  file: string;
  message: string;
}

export interface ExpandedQuery {
  original: string;
  expanded: string;
  keywords: string[];
  hypotheticalCode: string;
}

export type UserRole = 'Admin' | 'Developer' | 'Viewer';
