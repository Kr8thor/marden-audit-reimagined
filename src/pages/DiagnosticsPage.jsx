import React from 'react';
import ApiDiagnostics from '../components/ApiDiagnostics';

/**
 * Diagnostics page for debugging API connections and functionality
 */
const DiagnosticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="py-4 px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Marden SEO Audit Tool - Diagnostics</h1>
          </div>
          <div>
            <a 
              href="/"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto py-8 px-4">
        <ApiDiagnostics />
      </main>
      
      <footer className="py-4 px-6 bg-gray-900 mt-8">
        <div className="max-w-5xl mx-auto text-center text-gray-400 text-sm">
          Marden SEO Audit Tool - {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default DiagnosticsPage;