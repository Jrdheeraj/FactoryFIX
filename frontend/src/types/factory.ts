export interface MachineData {
  id?: string;
  machine_id: string;
  machine_name: string;
  status: 'healthy' | 'warning' | 'critical';
  risk_score: number;
  temperature: number;
  vibration: number;
  pressure?: number;
  runtime_hours: number;
  last_maintenance?: string;
  predicted_failure?: string | null;
  defect_probability: number;
}

export interface OptimizationAction {
  process_step: number;
  action: string;
}

export interface OptimizationStep {
  process_step: number;
  machines: number;
  capacity: number;
}

export interface ManufacturingLineOptimization {
  current_output: number;
  optimized_output: number;
  improvement_percent: number;
  before_optimization: {
    bottleneck_step: number;
    steps: OptimizationStep[];
  };
  after_optimization: {
    bottleneck_step: number;
    steps: OptimizationStep[];
  };
  optimization_actions: OptimizationAction[];
  machine_limit_respected: boolean;
}

export interface FactoryHealthData {
  total_records: number;
  healthy_count: number;
  warning_count: number;
  critical_count: number;
  overall_health_score: number;
  machines: MachineData[];
}

export interface FactoryHealthResponse extends FactoryHealthData {
  success?: boolean;
  analysis_timestamp: string;
  manufacturing_line_optimization?: ManufacturingLineOptimization;
  factory_health?: FactoryHealthData;
}

export interface FactoryAnalysisResponse {
  success: boolean;
  factory_health: FactoryHealthData;
  manufacturing_line_optimization: ManufacturingLineOptimization;
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
