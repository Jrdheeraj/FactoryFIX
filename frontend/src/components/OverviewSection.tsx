import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Gauge,
  Settings,
  TrendingUp,
  Wrench,
} from 'lucide-react';

const capabilities = [
  {
    icon: AlertTriangle,
    title: 'Machine Failure Prediction',
    description:
      'AI models analyze sensor data to predict equipment failures before they occur, reducing unplanned downtime and improving reliability.',
  },
  {
    icon: CheckCircle,
    title: 'Product Defect Detection',
    description:
      'Machine learning models detect quality deviations and defect risks, helping manufacturers maintain consistent product quality.',
  },
  {
    icon: Gauge,
    title: 'Factory Health Monitoring',
    description:
      'A unified view of machine conditions, operational risk, and production stability across the entire manufacturing line.',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    description:
      'Forecasting models estimate future risks, maintenance needs, and performance trends using historical and live data.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Optimization',
    description:
      'AI-driven recommendations help schedule maintenance actions with minimal impact on production throughput.',
  },
  {
    icon: Settings,
    title: 'Line & Process Optimization',
    description:
      'Bottleneck-based analysis identifies capacity constraints and suggests optimization actions using normalized throughput metrics.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export const OverviewSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="overview"
      className="pt-28 pb-20 bg-background relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px separator-industrial" />

      <div className="container relative z-10 px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Platform Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Industrial AI That{' '}
            <span className="text-primary">Delivers Results</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform applies AI and machine learning to analyze machine health,
            detect defects, and optimize manufacturing performance across any type
            of production line.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Line performance is evaluated using normalized bottleneck throughput,
            allowing fair comparison across different factory sizes, shift patterns,
            and product mixes.
          </p>
        </motion.div>

        {/* Capability Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {capabilities.map((capability) => (
            <motion.div
              key={capability.title}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.35 }}
              className="
                rounded-2xl
                p-8
                bg-gradient-to-br from-[#141414] to-[#0e0e0e]
                border border-white/10
                shadow-[0_25px_60px_rgba(0,0,0,0.6)]
                hover:border-primary/40
                hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_30px_80px_rgba(0,0,0,0.8)]
                transition-all
              "
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-6">
                <capability.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {capability.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {capability.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '4+', label: 'ML Models Trained' },
            { value: '3', label: 'Core AI Modules' },
            { value: '9K+', label: 'Records Analyzed' },
            { value: 'Real-Time', label: 'Data Processing' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="
                rounded-2xl
                p-8
                text-center
                bg-gradient-to-br from-[#141414] to-[#0e0e0e]
                border border-white/10
                shadow-[0_20px_50px_rgba(0,0,0,0.6)]
                hover:border-primary/40
                transition-all
              "
            >
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
