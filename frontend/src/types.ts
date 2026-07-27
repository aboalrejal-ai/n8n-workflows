export interface WorkflowSummary {
  id?: number;
  filename: string;
  name: string;
  active: boolean;
  description: string;
  trigger_type: string;
  complexity: string;
  node_count: number;
  integrations: string[];
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface StatsResponse {
  total: number;
  active: number;
  inactive: number;
  triggers: Record<string, number>;
  complexity: Record<string, number>;
  total_nodes: number;
  unique_integrations: number;
  last_indexed: string;
  categories?: number;
}

export interface SearchResponse {
  workflows: WorkflowSummary[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  query: string;
  filters: Record<string, any>;
}

export interface WorkflowDetail {
  metadata: {
    filename: string;
    name: string;
    category: string;
    node_count: number;
    nodes: any[];
    connections: Record<string, any>;
    trigger_type: string;
    active: boolean;
    description: string;
  };
  raw_json: any;
}
