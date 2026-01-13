import { motion } from 'framer-motion';
import { Cpu, Shield, Zap } from 'lucide-react';
import { Button } from './ui/button';
import heroImage from '@/assets/hero-factory.jpg';

const features = [
  { icon: Cpu, label: 'Machine Data Intelligence' },
  { icon: Shield, label: 'Early Failure Detection' },
  { icon: Zap, label: 'Live Production Visibility' },
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Industrial Factory"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      <div className="absolute inset-0 bg-grid-pattern opacity-15" />

      {/* Content */}
      <div className="container relative z-10 px-6 pt-14 md:pt-18">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Industrial AI for Manufacturing
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-10"
          >
            <span className="text-foreground">Turn Factory Data Into</span>
            <br />
            <span className="text-primary text-glow">
              Clear Production Decisions
            </span>
          </motion.h1>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button variant="hero" size="xl" asChild>
              <a href="#upload">Upload Factory Data</a>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href="#overview">See How It Works</a>
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {feature.label}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};
