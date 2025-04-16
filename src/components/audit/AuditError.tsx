import React from 'react';
import { AlertTriangle } from 'lucide-react';
import AnimatedButton from '../AnimatedButton';

interface AuditErrorProps {
  message: string;
  onReset: () => void;
}

const AuditError: React.FC<AuditErrorProps> = ({ message, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium mb-3">Audit Failed</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {message || 'There was an issue running the audit. Please try again with a valid URL.'}
      </p>
      <AnimatedButton
        variant="outline"
        glowColor="red"
        onClick={onReset}
      >
        Try Again
      </AnimatedButton>
    </div>
  );
};

export default AuditError;