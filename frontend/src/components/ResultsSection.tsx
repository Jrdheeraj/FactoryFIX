import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useMemo } from 'react';
import {
  FactoryAnalysisResponse,
  FactoryHealthData,
  FactoryHealthResponse,
  ManufacturingLineOptimization,
  OptimizationAction,
  OptimizationStep,
} from '@/types/factory';

interface ResultsSectionProps {
  data: FactoryHealthResponse | FactoryAnalysisResponse;
}

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
};

/* ── Unified color palette matching the design system ── */
const COLORS = {
  healthy: 'hsl(73, 100%, 50%)',     /* --primary: vibrant green */
  warning: 'hsl(73, 70%, 35%)',      /* --green-dim: muted green */
  critical: 'hsl(220, 8%, 35%)',     /* --steel-light: charcoal steel */
  accent: 'hsl(73, 70%, 40%)',       /* --accent */
  muted: 'hsl(220, 8%, 25%)',       /* --steel */
  bg: 'hsl(220, 10%, 10%)',         /* --card */
  border: 'hsl(220, 8%, 20%)',      /* --border */
  text: 'hsl(45, 10%, 90%)',        /* --foreground */
  textMuted: 'hsl(220, 8%, 55%)',   /* --muted-foreground */
  grid: 'hsl(220, 8%, 20%)',        /* chart gridlines */
  barOptimized: 'hsl(73, 100%, 50%)',
  barCapacity: 'hsl(73, 70%, 40%)',
};

export const ResultsSection = ({ data }: ResultsSectionProps) => {
  const fh: FactoryHealthData =
    'factory_health' in data && data.factory_health ? data.factory_health : data;

  const lineOpt: ManufacturingLineOptimization | undefined =
    'manufacturing_line_optimization' in data
      ? data.manufacturing_line_optimization
      : undefined;

  const pieData = useMemo(
    () => [
      { name: 'Healthy', value: fh.healthy_count ?? 0, fill: COLORS.healthy },
      { name: 'Warning', value: fh.warning_count ?? 0, fill: COLORS.warning },
      { name: 'Critical', value: fh.critical_count ?? 0, fill: COLORS.critical },
    ],
    [fh]
  );

  const riskDistribution = useMemo(
    () => [
      { range: '0-20', count: fh.machines.filter((m) => m.risk_score <= 20).length, fill: COLORS.healthy },
      {
        range: '21-40',
        count: fh.machines.filter((m) => m.risk_score > 20 && m.risk_score <= 40).length,
        fill: COLORS.healthy,
      },
      {
        range: '41-60',
        count: fh.machines.filter((m) => m.risk_score > 40 && m.risk_score <= 60).length,
        fill: COLORS.warning,
      },
      {
        range: '61-80',
        count: fh.machines.filter((m) => m.risk_score > 60 && m.risk_score <= 80).length,
        fill: COLORS.warning,
      },
      { range: '81-100', count: fh.machines.filter((m) => m.risk_score > 80).length, fill: COLORS.critical },
    ],
    [fh]
  );

  const stats = [
    { icon: Activity, label: 'Total Records Analyzed', value: fh.total_records ?? 0, color: 'text-primary' },
    { icon: CheckCircle, label: 'Healthy Machines', value: fh.healthy_count ?? 0, color: 'text-primary' },
    { icon: AlertTriangle, label: 'Warning Machines', value: fh.warning_count ?? 0, color: 'text-accent' },
    { icon: XCircle, label: 'Critical Machines', value: fh.critical_count ?? 0, color: 'text-steel-light' },
  ];

  const comparisonData = useMemo(() => {
    if (!lineOpt) return [];
    return [
      { name: 'Current Output', output: lineOpt.current_output },
      { name: 'Optimized Output', output: lineOpt.optimized_output },
    ];
  }, [lineOpt]);

  const stepCapacityData = useMemo(() => {
    const steps: OptimizationStep[] = lineOpt?.after_optimization?.steps ?? [];
    return steps.map((s) => ({
      step: `Step ${s.process_step}`,
      capacity: s.capacity,
    }));
  }, [lineOpt]);

  /* ── Dark-themed tooltip matching the card style ── */
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg p-3 shadow-xl border"
          style={{
            background: COLORS.bg,
            borderColor: COLORS.border,
          }}
        >
          <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
            {label || payload[0].name}
          </p>
          <p className="text-lg font-bold" style={{ color: COLORS.healthy }}>
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="results" className="py-24 bg-background relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 texture-industrial" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest block mb-3">
            Analysis Results
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Factory Health <span className="text-primary">Insights</span>
          </h2>
          <p className="text-muted-foreground">
            AI-powered assessment completed on{' '}
            {new Date(data.analysis_timestamp).toLocaleString()}
          </p>
        </motion.div>

        {/* Overall Health Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="card-highlight p-8 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-6xl font-bold text-primary mb-2 text-glow">
              {(fh.overall_health_score ?? 0).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Overall Health Score
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="
                rounded-2xl p-6
                bg-gradient-to-br from-[#141414] to-[#0e0e0e]
                border border-white/10
                shadow-[0_20px_50px_rgba(0,0,0,0.6)]
                hover:border-primary/40
                transition-all
              "
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
              rounded-2xl p-6
              bg-gradient-to-br from-[#141414] to-[#0e0e0e]
              border border-white/10
              shadow-[0_25px_60px_rgba(0,0,0,0.6)]
            "
          >
            <h3 className="text-xl font-semibold mb-4 text-center text-foreground">
              Machine Status Distribution
            </h3>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ color: COLORS.textMuted, fontSize: '0.875rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
              rounded-2xl p-6
              bg-gradient-to-br from-[#141414] to-[#0e0e0e]
              border border-white/10
              shadow-[0_25px_60px_rgba(0,0,0,0.6)]
            "
          >
            <h3 className="text-xl font-semibold mb-4 text-center text-foreground">
              Risk Score Distribution
            </h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="range" stroke={COLORS.textMuted} tick={{ fill: COLORS.textMuted }} />
                  <YAxis stroke={COLORS.textMuted} tick={{ fill: COLORS.textMuted }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {riskDistribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Manufacturing Line Optimization */}
        {lineOpt && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
              rounded-2xl p-8
              bg-gradient-to-br from-[#141414] to-[#0e0e0e]
              border border-white/10
              shadow-[0_25px_60px_rgba(0,0,0,0.6)]
            "
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Manufacturing Line Optimization
              </h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Current vs Optimized */}
              <div className="h-64">
                <h4 className="text-center font-semibold mb-3 text-foreground/80">
                  Current vs Optimized Output
                </h4>
                <ResponsiveContainer>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis dataKey="name" stroke={COLORS.textMuted} tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                    <YAxis stroke={COLORS.textMuted} tick={{ fill: COLORS.textMuted }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="output" fill={COLORS.barOptimized} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Step Capacities */}
              <div className="h-64">
                <h4 className="text-center font-semibold mb-3 text-foreground/80">
                  Post-Optimization Step Capacities
                </h4>
                <ResponsiveContainer>
                  <BarChart data={stepCapacityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis dataKey="step" stroke={COLORS.textMuted} tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                    <YAxis stroke={COLORS.textMuted} tick={{ fill: COLORS.textMuted }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="capacity" fill={COLORS.barCapacity} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Optimization Actions */}
            <div className="mt-8 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Optimization Actions
              </h4>
              <ul className="space-y-2">
                {lineOpt.optimization_actions.map((a: OptimizationAction, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {a.action} <span className="text-primary/70">(Step {a.process_step})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Result */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={`mt-6 flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm ${
                lineOpt.improvement_percent > 0
                  ? 'bg-primary/10 border border-primary/30 text-primary'
                  : 'bg-white/[0.03] border border-white/10 text-muted-foreground'
              }`}
            >
              {lineOpt.improvement_percent > 0 ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0" />
              )}
              {lineOpt.improvement_percent > 0
                ? `Throughput improved by ${lineOpt.improvement_percent}%`
                : 'No significant throughput improvement possible under constraints'}
            </motion.div>
          </motion.div>
        )}

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Production optimization is evaluated using bottleneck-driven analysis
          under strict spatial and operational constraints.
        </p>
      </div>
    </section>
  );
};

