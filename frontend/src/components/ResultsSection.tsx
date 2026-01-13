import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
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
import { FactoryHealthResponse } from '@/types/factory';

interface ResultsSectionProps {
  data: FactoryHealthResponse & {
    manufacturing_line_optimization?: any;
  };
}

const COLORS = {
  healthy: 'hsl(38, 92%, 50%)',
  warning: 'hsl(38, 70%, 35%)',
  critical: 'hsl(220, 8%, 35%)',
};

export const ResultsSection = ({ data }: ResultsSectionProps) => {
  const machines = data.machines ?? [];
  const lineOpt = data.manufacturing_line_optimization;

  /* -------------------- PIE DATA -------------------- */
  const pieData = useMemo(
    () => [
      { name: 'Healthy', value: data.healthy_count ?? 0, fill: COLORS.healthy },
      { name: 'Warning', value: data.warning_count ?? 0, fill: COLORS.warning },
      { name: 'Critical', value: data.critical_count ?? 0, fill: COLORS.critical },
    ],
    [data]
  );

  /* ---------------- RISK DISTRIBUTION ---------------- */
  const riskDistribution = useMemo(
    () => [
      { range: '0-20', count: machines.filter(m => m.risk_score <= 20).length, fill: COLORS.healthy },
      { range: '21-40', count: machines.filter(m => m.risk_score > 20 && m.risk_score <= 40).length, fill: COLORS.healthy },
      { range: '41-60', count: machines.filter(m => m.risk_score > 40 && m.risk_score <= 60).length, fill: COLORS.warning },
      { range: '61-80', count: machines.filter(m => m.risk_score > 60 && m.risk_score <= 80).length, fill: COLORS.warning },
      { range: '81-100', count: machines.filter(m => m.risk_score > 80).length, fill: COLORS.critical },
    ],
    [machines]
  );

  /* -------------------- STATS -------------------- */
  const stats = [
    { icon: Activity, label: 'Total Records Analyzed', value: data.total_records ?? 0, color: 'text-foreground', bg: 'bg-muted' },
    { icon: CheckCircle, label: 'Healthy Machines', value: data.healthy_count ?? 0, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: AlertTriangle, label: 'Warning Machines', value: data.warning_count ?? 0, color: 'text-amber-dim', bg: 'bg-amber-dim/10' },
    { icon: XCircle, label: 'Critical Machines', value: data.critical_count ?? 0, color: 'text-steel-light', bg: 'bg-steel/10' },
  ];

  /* ---------------- OPTIMIZATION CHART DATA ---------------- */
  const comparisonData = useMemo(() => {
    if (!lineOpt) return [];
    return [
      { name: 'Before Optimization', output: lineOpt.before_optimization.line_output },
      { name: 'After Optimization', output: lineOpt.after_optimization.line_output },
    ];
  }, [lineOpt]);

  const stepCapacityData = useMemo(() => {
    if (!lineOpt) return [];
    return lineOpt.after_optimization.steps.map((s: any) => ({
      step: `Step ${s.process_step}`,
      capacity: s.capacity,
    }));
  }, [lineOpt]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label || payload[0].name}</p>
          <p className="text-lg font-bold text-primary">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="results" className="py-24 bg-background relative overflow-hidden">
      <div className="container relative z-10 px-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary text-sm uppercase tracking-widest block mb-3">
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

        {/* OVERALL HEALTH */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="card-highlight p-8 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-6xl font-bold text-primary mb-2">
              {(data.overall_health_score ?? 0).toFixed(1)}%
            </div>
            <div className="progress-industrial h-3 mt-4">
              <div
                className="progress-industrial-fill"
                style={{ width: `${data.overall_health_score ?? 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-industrial p-6"
            >
              <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* HEALTH CHARTS */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="card-industrial p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Machine Status Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-industrial p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Risk Score Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count">
                    {riskDistribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* MANUFACTURING OPTIMIZATION */}
        {lineOpt && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-industrial p-8"
          >
            <h3 className="text-2xl font-bold mb-6">
              Manufacturing Line Optimization
            </h3>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-64">
                <h4 className="text-center font-semibold mb-3">Before vs After Output</h4>
                <ResponsiveContainer>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="output" fill={COLORS.healthy} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-64">
                <h4 className="text-center font-semibold mb-3">Post-Optimization Step Capacities</h4>
                <ResponsiveContainer>
                  <BarChart data={stepCapacityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="capacity" fill={COLORS.critical} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-semibold mb-2">Optimization Actions</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {lineOpt.optimization_actions.map((a: any, i: number) => (
                  <li key={i}>{a.action} (Step {a.process_step})</li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mt-6 flex items-center gap-2 font-medium ${
                lineOpt.target_achieved ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {lineOpt.target_achieved ? <CheckCircle /> : <XCircle />}
              {lineOpt.target_achieved
                ? 'Target Achieved'
                : 'Target not achieved due to remaining bottlenecks'}
            </motion.div>
          </motion.div>
        )}

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Production optimization is evaluated using bottleneck-driven line analysis
          under strict spatial and operational constraints.
        </p>
      </div>
    </section>
  );
};