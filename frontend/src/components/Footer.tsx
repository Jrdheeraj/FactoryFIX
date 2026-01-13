import { Factory } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal-deep border-t border-border py-12">
      <div className="container px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Factory className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                Factory<span className="text-primary">FIX</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Enterprise-grade AI platform for manufacturing intelligence. 
              Predict failures, detect defects, and optimize production.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="#overview" className="text-muted-foreground hover:text-primary transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#upload" className="text-muted-foreground hover:text-primary transition-colors">
                  Upload Data
                </a>
              </li>
              <li>
                <a href="#results" className="text-muted-foreground hover:text-primary transition-colors">
                  Results
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom (clean, empty separator only) */}
        <div className="separator-industrial" />
      </div>
    </footer>
  );
};
