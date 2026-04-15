export interface Project {
  id: string;
  name: string;
  base_url_mobile: string;
  base_url_web: string;
  created_at: string;
}

export interface Credentials {
  mobile?: {
    callsign: string;
    password: string;
  };
  web?: {
    email: string;
    password: string;
  };
}

export interface MetricSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
}

export interface TrendDataPoint {
  date: string;
  total: number;
  passed: number;
  failed: number;
}

export interface Execution {
  id: number;
  collection: string;
  environment: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  total: number;
  passed: number;
  failed: number;
  duration_ms: number;
  project_id: string | null;
}

export interface ExecutionResult {
  id: number;
  execution_id: number;
  request_name: string;
  url: string;
  method: string;
  status_code: number | null;
  duration_ms: number;
  passed: boolean;
  assertions: Assertion[];
  error: string | null;
  response_body: string | null;
}

export interface Assertion {
  name: string;
  passed: boolean;
  error?: string;
}

export type CollectionType = "mobile" | "web";
