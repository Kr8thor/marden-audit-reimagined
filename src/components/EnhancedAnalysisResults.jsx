import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, BarChart4 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import SchemaAnalysisCard from './SchemaAnalysisCard';
import MobileAnalysisCard from './MobileAnalysisCard';

/**
 * Component to display enhanced SEO analysis results
 */
const EnhancedAnalysisResults = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <div className="text-lg font-medium">No Results Available</div>
        <div className="text-sm text-gray-500 mt-1">
          Enter a URL and click analyze to see enhanced SEO results
        </div>
      </div>
    );
  }
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'needs_improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };  
  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Enhanced SEO Analysis Results</CardTitle>
            <Badge 
              variant={data.status === 'good' ? 'success' : data.status === 'needs_improvement' ? 'warning' : 'destructive'}
              className="ml-2"
            >
              {data.status}
            </Badge>
          </div>
          <CardDescription>
            {data.analysisType === 'site' ? 'Multi-page site analysis' : 'Single page analysis'} for {data.url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Overall score */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(data.score)}`}>{data.score}</span>
              </div>
              <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={data.score >= 80 ? '#22c55e' : data.score >= 50 ? '#eab308' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${data.score}, 100`}
                />
              </svg>
            </div>
          </div>
          
          {/* Analysis components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border rounded-md">
              <div className="font-medium mb-1">Analysis Type</div>
              <div>{data.analysisType === 'site' ? 'Multi-page Site Analysis' : 'Single Page Analysis'}</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="font-medium mb-1">Components Analyzed</div>
              <div>{Object.keys(data.components || {}).length}</div>
            </div>
          </div>          
          {/* Recommendations */}
          {data.recommendations?.length > 0 && (
            <div className="mt-4">
              <div className="font-medium mb-2">Top Recommendations:</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {data.recommendations.slice(0, 5).map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
              {data.recommendations.length > 5 && (
                <div className="text-xs text-gray-500 mt-2">
                  + {data.recommendations.length - 5} more recommendations
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Mobile Summary */}
            {data.components.mobileFriendliness && (
              <Card>
                <CardHeader>
                  <CardTitle>Mobile-Friendliness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Score</span>
                    <span className="text-sm font-medium">{data.components.mobileFriendliness.score}/100</span>
                  </div>
                  <Progress 
                    value={data.components.mobileFriendliness.score} 
                    className={`h-2 ${getStatusColor(data.components.mobileFriendliness.status)}`} 
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {data.components.mobileFriendliness.issues} issues found
                  </div>
                </CardContent>
              </Card>
            )}            
            {/* Schema Summary */}
            {data.components.structuredData && (
              <Card>
                <CardHeader>
                  <CardTitle>Structured Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(data.components.structuredData.status)}`}></div>
                    <span className="font-medium">{data.components.structuredData.status}</span>
                  </div>
                  {data.components.structuredData.present ? (
                    <div className="text-sm text-gray-500">
                      {data.components.structuredData.count} schema markup{data.components.structuredData.count !== 1 ? 's' : ''} found
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No structured data present
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Site Crawl Summary - If available */}
            {data.components.siteCrawl && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Site Crawl Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-md text-center">
                      <div className="text-sm text-gray-500">Pages Crawled</div>
                      <div className="text-2xl font-bold">{data.components.siteCrawl.pageCount || 0}</div>
                    </div>
                    <div className="p-4 border rounded-md text-center">
                      <div className="text-sm text-gray-500">Average Score</div>
                      <div className="text-2xl font-bold">{data.components.siteCrawl.siteScore || 0}</div>
                    </div>
                    <div className="p-4 border rounded-md text-center">
                      <div className="text-sm text-gray-500">Issues Found</div>
                      <div className="text-2xl font-bold">{data.components.siteCrawl.totalIssuesCount || 0}</div>
                    </div>
                    <div className="p-4 border rounded-md text-center">
                      <div className="text-sm text-gray-500">Crawl Depth</div>
                      <div className="text-2xl font-bold">{data.components.siteCrawl.crawlMetrics?.crawlDepth || 0}</div>
                    </div>
                  </div>                  
                  {/* Common issues */}
                  {data.components.siteCrawl.commonIssues?.length > 0 && (
                    <div className="mt-4">
                      <div className="font-medium mb-2">Common Issues:</div>
                      <ul className="text-sm space-y-1">
                        {data.components.siteCrawl.commonIssues.slice(0, 3).map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                            <div>
                              <div>{issue.type.split('_').join(' ')} ({issue.count} occurrences)</div>
                              <div className="text-xs text-gray-500">{issue.recommendation}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="mobile">
          {data.components.mobileFriendliness ? (
            <MobileAnalysisCard mobileData={data.components.mobileFriendliness} />
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <div className="text-lg font-medium">Mobile Analysis Not Available</div>
              <div className="text-sm text-gray-500 mt-1">
                Mobile-friendliness analysis was not performed for this URL
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="schema">
          {data.components.structuredData ? (
            <SchemaAnalysisCard schemaData={data.components.structuredData} />
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <div className="text-lg font-medium">Schema Analysis Not Available</div>
              <div className="text-sm text-gray-500 mt-1">
                Structured data analysis was not performed for this URL
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalysisResults;