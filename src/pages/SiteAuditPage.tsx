import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteAuditForm from '../components/SiteAuditForm';
import DebugPanel from '../components/DebugPanel';

const SiteAuditPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false);

  // Get API URL from environment
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  
  // Handle navigation to page audit
  const handlePageAudit = (url: string) => {
    navigate(`/?url=${encodeURIComponent(url)}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Full Site SEO Audit</h1>
        
        <SiteAuditForm onPageAudit={handlePageAudit} />
        
        {/* Debug toggle button */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {showDebug ? 'Hide Debug Panel' : 'Show Debug Panel'}
          </button>
        </div>
        
        {/* Debug panel */}
        {showDebug && (
          <div className="mt-4">
            <DebugPanel apiUrl={apiUrl} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteAuditPage;