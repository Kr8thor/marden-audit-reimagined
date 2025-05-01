import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AuditErrorProps {
  error: string;
  url: string;
  onTryAgain: () => void;
  onBackToHome: () => void;
}

const AuditError: React.FC<AuditErrorProps> = ({ error, url, onTryAgain, onBackToHome }) => {
  return (
    <div className="container max-w-3xl mx-auto pt-12 px-4">
      <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle size={48} className="text-red-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Audit Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We encountered an error while analyzing {url}
          </p>
          <div className="bg-white/5 p-4 rounded-md text-sm text-red-300 mb-6 w-full">
            {error}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onTryAgain}
              className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-sm"
            >
              Try Again
            </button>
            <button 
              onClick={onBackToHome}
              className="bg-white/10 hover:bg-white/20 text-white rounded-md px-4 py-2 text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditError;