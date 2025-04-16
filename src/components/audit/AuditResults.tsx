import React from 'react';

interface AuditResultsProps {
  pageAnalysis?: any;
  siteAnalysis?: any;
  url: string;
}

const AuditResults: React.FC<AuditResultsProps> = ({ pageAnalysis, siteAnalysis, url }) => {
  // Use mock data for demo purposes
  const mockResult = {
    url: url,
    score: 78,
    issuesFound: 12,
    opportunities: 5,
    performanceMetrics: {
      lcp: {
        value: 2.4,
        unit: 's',
        score: 85,
      },
      cls: {
        value: 0.15,
        score: 75,
      },
      fid: {
        value: 180,
        unit: 'ms',
        score: 70,
      },
    },
    topIssues: [
      {
        severity: 'critical',
        description: 'Missing meta descriptions on 3 pages',
      },
      {
        severity: 'warning',
        description: 'Images without alt text',
      },
      {
        severity: 'info',
        description: 'Consider adding structured data',
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{url}</h3>
          <p className="text-sm text-muted-foreground">SEO Audit Results</p>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-neon-purple"></div>
          <div className="text-sm font-semibold text-white/90">Live Report</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
          <div className="flex items-center">
            <div className="text-2xl font-bold gradient-text">{mockResult.score}</div>
            <div className="text-xs ml-1 text-white/60">/100</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-muted-foreground mb-1">Issues Found</div>
          <div className="text-2xl font-bold text-red-400">{mockResult.issuesFound}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-muted-foreground mb-1">Opportunities</div>
          <div className="text-2xl font-bold text-green-400">{mockResult.opportunities}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between mb-3">
            <div className="text-sm font-medium">Performance Metrics</div>
            <div className="text-xs text-muted-foreground">Core Web Vitals</div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>LCP (Largest Contentful Paint)</span>
                <span className={mockResult.performanceMetrics.lcp.score >= 90 ? "text-green-400" : 
                              mockResult.performanceMetrics.lcp.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                  {mockResult.performanceMetrics.lcp.value}{mockResult.performanceMetrics.lcp.unit}
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  mockResult.performanceMetrics.lcp.score >= 90 ? "bg-green-400" : 
                  mockResult.performanceMetrics.lcp.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                }`} style={{ width: `${mockResult.performanceMetrics.lcp.score}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>CLS (Cumulative Layout Shift)</span>
                <span className={mockResult.performanceMetrics.cls.score >= 90 ? "text-green-400" : 
                              mockResult.performanceMetrics.cls.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                  {mockResult.performanceMetrics.cls.value}
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  mockResult.performanceMetrics.cls.score >= 90 ? "bg-green-400" : 
                  mockResult.performanceMetrics.cls.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                }`} style={{ width: `${mockResult.performanceMetrics.cls.score}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>FID (First Input Delay)</span>
                <span className={mockResult.performanceMetrics.fid.score >= 90 ? "text-green-400" : 
                              mockResult.performanceMetrics.fid.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                  {mockResult.performanceMetrics.fid.value}{mockResult.performanceMetrics.fid.unit}
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  mockResult.performanceMetrics.fid.score >= 90 ? "bg-green-400" : 
                  mockResult.performanceMetrics.fid.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                }`} style={{ width: `${mockResult.performanceMetrics.fid.score}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between mb-3">
            <div className="text-sm font-medium">Top Issues</div>
            <div className="text-xs text-primary">View All</div>
          </div>
          <div className="space-y-2">
            {mockResult.topIssues.map((issue, index) => (
              <div key={index} className="flex items-center text-xs p-2 bg-white/5 rounded">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  issue.severity === 'critical' ? 'bg-red-400' : 
                  issue.severity === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <div>{issue.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditResults;