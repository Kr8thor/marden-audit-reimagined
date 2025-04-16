import React from 'react';
import { PageAnalysisResult, SiteAnalysisResult, Issue, Recommendation } from '../../api/types';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '../ui/badge';

interface AuditResultsProps {
  pageAnalysis?: PageAnalysisResult;
  siteAnalysis?: SiteAnalysisResult;
  url: string;
}

// Impact color mapping
const impactColors = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

// Progress bar color based on score
const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-400';
  if (score >= 60) return 'bg-yellow-400';
  return 'bg-red-400';
};

const AuditResults: React.FC<AuditResultsProps> = ({ pageAnalysis, siteAnalysis, url }) => {
  // Use site analysis if available, otherwise page analysis
  const analysis = siteAnalysis || pageAnalysis;
  
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No analysis data available</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          We couldn't retrieve the analysis results. Please try again.
        </p>
      </div>
    );
  }
  
  // Extract common data
  const scores = analysis.scores;
  const timestamp = new Date(analysis.timestamp).toLocaleString();
  const recommendations = siteAnalysis?.recommendations || pageAnalysis?.recommendations || [];
  
  // Determine issue count
  const issueCount = siteAnalysis?.totalIssues || pageAnalysis?.issueCount || 0;
  
  // Get top issues
  const topIssues = siteAnalysis
    ? siteAnalysis.topIssues.slice(0, 4)
    : pageAnalysis?.issues
      .filter(issue => issue.impact === 'high' || issue.impact === 'medium')
      .slice(0, 4) || [];
  
  // For performance metrics, we'll just show placeholders since the real metrics
  // would need to be extracted from the page analysis data in a real implementation
  const performanceMetrics = {
    lcp: '2.5s',
    cls: '0.02',
    fid: '12ms',
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{url}</h3>
          <p className="text-sm text-muted-foreground">SEO Audit Results • {timestamp}</p>
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
            <div className="text-2xl font-bold gradient-text">{scores.overall}</div>
            <div className="text-xs ml-1 text-white/60">/100</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-muted-foreground mb-1">Issues Found</div>
          <div className="text-2xl font-bold text-red-400">{issueCount}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-muted-foreground mb-1">Opportunities</div>
          <div className="text-2xl font-bold text-green-400">{recommendations.length}</div>
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
                <span className="text-yellow-400">{performanceMetrics.lcp}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>CLS (Cumulative Layout Shift)</span>
                <span className="text-green-400">{performanceMetrics.cls}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>FID (First Input Delay)</span>
                <span className="text-green-400">{performanceMetrics.fid}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between mb-3">
            <div className="text-sm font-medium">Top Issues</div>
            <div className="text-xs text-primary cursor-pointer">View All</div>
          </div>
          <div className="space-y-2">
            {topIssues.length > 0 ? (
              topIssues.map((issue, index) => {
                // Handle both site and page analysis formats
                const issueType = 'type' in issue ? issue.type : issue;
                const issueCount = 'count' in issue ? issue.count : 1;
                const impact = 'impact' in issue 
                  ? (issue as Issue).impact 
                  : siteAnalysis?.issueTypeCounts[issueType] > 3 ? 'high' : 'medium';
                
                // Format issue text
                const issueText = issueType
                  .replace(/_/g, ' ')
                  .replace(/^(.)|\s+(.)/g, c => c.toUpperCase());
                
                return (
                  <div key={index} className="flex items-center text-xs p-2 bg-white/5 rounded">
                    <div className={`w-2 h-2 rounded-full mr-2 ${impactColors[impact]}`}></div>
                    <div>
                      {issueText}
                      {issueCount > 1 && ` (${issueCount} pages)`}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-4 text-muted-foreground text-xs">
                No major issues found
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Category Scores */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Category Scores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex justify-between mb-2">
              <div className="text-xs font-medium">Meta Tags</div>
              <div className="text-xs">{scores.meta}%</div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className={`${getScoreColor(scores.meta)} h-full rounded-full`} style={{ width: `${scores.meta}%` }}></div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex justify-between mb-2">
              <div className="text-xs font-medium">Content</div>
              <div className="text-xs">{scores.content}%</div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className={`${getScoreColor(scores.content)} h-full rounded-full`} style={{ width: `${scores.content}%` }}></div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex justify-between mb-2">
              <div className="text-xs font-medium">Technical</div>
              <div className="text-xs">{scores.technical}%</div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className={`${getScoreColor(scores.technical)} h-full rounded-full`} style={{ width: `${scores.technical}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Recommendations */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Top Recommendations</h3>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-start mb-2">
                <div className={`mt-0.5 mr-2 ${impactColors[rec.impact]}`}>
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{rec.message}</div>
                  {rec.details && (
                    <div className="text-xs text-muted-foreground mt-1">{rec.details}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Badge className={`text-xs ${
                  rec.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                  rec.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} Impact
                </Badge>
                {rec.affectedPages && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Affects {rec.affectedPages} {rec.affectedPages === 1 ? 'page' : 'pages'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditResults;