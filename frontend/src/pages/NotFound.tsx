import { motion } from 'framer-motion';
import { Factory, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute inset-0 texture-industrial" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6 relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-glow">
            <Factory className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold text-foreground">
            Factory<span className="text-primary">AI</span>
          </span>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-bold text-primary text-glow mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! This page wasn't found in our factory systems.
        </p>

        {/* CTA */}
        <Button variant="industrial" size="lg" asChild>
          <Link to="/">
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
