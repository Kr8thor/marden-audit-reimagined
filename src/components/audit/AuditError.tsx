import React from 'react';
import { AlertTriangle, RefreshCw, Home, ExternalLink } from 'lucide-react';

interface AuditErrorProps {
  error: string;
  url: string;
  onTryAgain: () => void;
  onBackToHome: () => void;
}

const AuditError: React.FC<AuditErrorProps> = ({ error, url, onTryAgain, onBackToHome }) => {
  // Provide specific troubleshooting tips based on the error message
  const getTroubleshootingTips = (errorMsg: string) => {
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network error')) {
      return [
        'Check your internet connection',
        'The API server might be down or experiencing issues',
        'Try again in a few moments'
      ];
    }
    
    if (errorMsg.includes('CORS')) {
      return [
        'This is a Cross-Origin Resource Sharing (CORS) issue',
        'It may be a temporary issue with the API server',
        'Try again in a few moments'
      ];
    }
    
    if (errorMsg.includes('Invalid URL') || errorMsg.includes('URL format')) {
      return [
        'Make sure the URL is correctly formatted (e.g., example.com)',
        'Try adding https:// to the beginning of your URL',
        'Check for any special characters in the URL'
      ];
    }
    
    if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
      return [
        'The request took too long to complete',
        'The website you\'re trying to analyze might be slow to respond',
        'Try a different website or try again later'
      ];
    }
    
    // Default tips
    return [
      'Try analyzing a different website',
      'Refresh the page and try again',
      'Return to the home page and start over'
    ];
  };
  
  const tips = getTroubleshootingTips(error);
  
  return (
    <div className="container max-w-3xl mx-auto pt-12 px-4">
      <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Audit Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We encountered an error while analyzing <span className="text-white font-medium">{url}</span>
          </p>
          
          <div className="bg-white/5 p-4 rounded-md text-sm text-red-300 mb-6 w-full overflow-auto">
            <code>{error}</code>
          </div>
          
          <div className="bg-white/5 p-4 rounded-md text-sm mb-6 w-full text-left">
            <h4 className="text-white font-medium mb-2">Troubleshooting Tips:</h4>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onTryAgain}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-sm"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button 
              onClick={onBackToHome}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-md px-4 py-2 text-sm"
            >
              <Home size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditError;

export default AuditError;