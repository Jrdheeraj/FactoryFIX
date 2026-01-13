import { motion } from 'framer-motion';
import { Cpu, Activity, BarChart3, Brain } from 'lucide-react';

interface ProcessingSectionProps {
  progress: number;
}

const processingSteps = [
  { icon: Cpu, label: 'Data Ingestion', threshold: 25 },
  { icon: Brain, label: 'AI Analysis', threshold: 50 },
  { icon: Activity, label: 'Risk Assessment', threshold: 75 },
  { icon: BarChart3, label: 'Generating Insights', threshold: 100 },
];

export const ProcessingSection = ({ progress }: ProcessingSectionProps) => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, hsl(38 92% 50% / 0.1) 0%, transparent 50%)',
            backgroundSize: '100% 100%',
          }}
        />
      </div>

      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Spinning Loader */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-border border-t-primary"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-4 rounded-full border-4 border-border border-b-primary opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-12 h-12 text-primary animate-pulse-amber" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Analyzing Factory Data with <span className="text-primary">AI Models</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Our machine learning models are processing your data to identify patterns, 
            predict failures, and assess quality risks.
          </p>

          {/* Processing Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {processingSteps.map((step, index) => {
              const isActive = progress >= step.threshold - 24;
              const isComplete = progress >= step.threshold;
              
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-4 rounded-lg border transition-all duration-500
                    ${isComplete 
                      ? 'border-primary bg-primary/10' 
                      : isActive 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'border-border bg-card/50'
                    }
                  `}
                >
                  <step.icon 
                    className={`
                      w-8 h-8 mx-auto mb-2 transition-colors duration-300
                      ${isComplete ? 'text-primary' : isActive ? 'text-primary/70 animate-pulse' : 'text-muted-foreground'}
                    `} 
                  />
                  <p className={`
                    text-sm font-medium transition-colors duration-300
                    ${isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {step.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="progress-industrial h-3">
              <motion.div 
                className="progress-industrial-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-2xl font-bold text-primary mt-4">
              {progress}%
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
