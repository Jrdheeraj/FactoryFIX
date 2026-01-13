export interface MachineData {
  id: string;
  machine_id: string;
  machine_name: string;
  status: 'healthy' | 'warning' | 'critical';
  risk_score: number;
  temperature: number;
  vibration: number;
  pressure: number;
  runtime_hours: number;
  last_maintenance: string;
  predicted_failure: string | null;
  defect_probability: number;
}

export interface FactoryHealthResponse {
  success: boolean;
  total_records: number;
  healthy_count: number;
  warning_count: number;
  critical_count: number;
  overall_health_score: number;
  machines: MachineData[];
  analysis_timestamp: string;
}

export interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  data?: FactoryHealthResponse;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}
