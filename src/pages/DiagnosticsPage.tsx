// Simple diagnostics page to help identify issues
import React from 'react';

const DiagnosticsInfo = () => {
  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'Not set',
    NODE_ENV: import.meta.env.NODE_ENV || 'Not set',
    BASE_URL: import.meta.env.BASE_URL || 'Not set'
  };
  
  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookiesEnabled: navigator.cookieEnabled
  };
  
  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow my-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Frontend Diagnostics</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-blue-600">Environment Information</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 p-2 text-left">Variable</th>
                <th className="border border-gray-300 p-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(envVars).map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-medium">{key}</td>
                  <td className="border border-gray-300 p-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-blue-600">Browser Information</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 p-2 text-left">Property</th>
                <th className="border border-gray-300 p-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(browserInfo).map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-medium">{key}</td>
                  <td className="border border-gray-300 p-2">{value.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-blue-600">Route Testing</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Available Routes:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="/" className="text-blue-500 hover:underline">Home Page</a></li>
              <li><a href="/enhanced-analyzer" className="text-blue-500 hover:underline">Enhanced SEO Analyzer</a></li>
              <li><a href="/test-crawl" className="text-blue-500 hover:underline">Test Crawl</a></li>
              <li><a href="/batch-audit" className="text-blue-500 hover:underline">Batch Audit</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.873-1.037 2.157-1.037 3.03 0l6.28 7.47c.873 1.037.38 1.882-.985 1.882H3.19c-1.365 0-1.858-.845-.985-1.882l6.28-7.47zM10 5a1 1 0 01-1 1 1 1 0 110-2 1 1 0 011 1zm0 3a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              If you're seeing this page, the application is running but there might be JavaScript issues. Check the console for errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsInfo;