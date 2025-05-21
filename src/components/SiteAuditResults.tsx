import React, { useState } from 'react';
import { SiteAuditResult } from '../api/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Info, AlertTriangle, CheckCircle, BarChart, FileText, Globe, Network } from 'lucide-react';
import { Button } from './ui/button';

interface SiteAuditResultsProps {
  data: SiteAuditResult;
  onAnalyzePage?: (url: string) => void;
}

const SiteAuditResults: React.FC<SiteAuditResultsProps> = ({ data, onAnalyzePage }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Format functions
  const formatScore = (score: number) => {
    return Math.round(score);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };
  
  // Sort pages by score (ascending)
  const sortedPages = [...data.siteAnalysis.pages].sort((a, b) => a.score - b.score);
  
  return (
    <div className="site-audit-results space-y-4">
      {/* Header Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Site SEO Audit: {data.baseDomain}
              </CardTitle>
              <CardDescription>
                {data.pageResults.length} pages analyzed • {new Date(data.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall Score:</span>
              <span className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
                {formatScore(data.score)}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Common Issues</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              {data.siteStructure && (
                <TabsTrigger value="structure">Site Structure</TabsTrigger>
              )}
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Site Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className={`text-5xl font-bold ${getScoreColor(data.score)}`}>
                        {formatScore(data.score)}
                      </div>
                      <Progress
                        value={data.score}
                        className="h-2 mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {data.status === 'good' ? 'Good' : 
                         data.status === 'needs_improvement' ? 'Needs Improvement' : 
                         'Poor'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pages Analyzed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-bold text-blue-600">
                        {data.pageResults.length}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {data.homepageOnly ? 'Homepage only' : 
                         data.crawlResults ? `${data.crawlResults.pagesDiscovered} pages discovered` : 
                         'Pages analyzed'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Issues Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-bold text-amber-600">
                        {data.siteAnalysis.commonIssues.length}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Common issues detected
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {data.crawlResults && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Crawl Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Pages Discovered</span>
                        <span className="text-xl font-semibold">{data.crawlResults.pagesDiscovered}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Pages Crawled</span>
                        <span className="text-xl font-semibold">{data.crawlResults.pagesCrawled}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Crawl Depth</span>
                        <span className="text-xl font-semibold">{data.crawlResults.maxDepthReached || '1'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Crawl Duration</span>
                        <span className="text-xl font-semibold">{Math.round(data.crawlResults.crawlDuration / 1000)}s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Top issues summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.siteAnalysis.commonIssues.length > 0 ? (
                    <div className="space-y-2">
                      {data.siteAnalysis.commonIssues.slice(0, 3).map((issue, index) => (
                        <Alert key={index} variant="outline" className="py-3">
                          <div className="flex gap-2">
                            {getSeverityIcon(issue.severity)}
                            <div>
                              <AlertTitle className="text-sm font-medium">{issue.type.replace(/_/g, ' ')}</AlertTitle>
                              <AlertDescription className="text-xs">
                                Found on {issue.frequency} pages
                              </AlertDescription>
                            </div>
                          </div>
                        </Alert>
                      ))}
                      {data.siteAnalysis.commonIssues.length > 3 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => setActiveTab('issues')}
                        >
                          View all {data.siteAnalysis.commonIssues.length} issues
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No common issues found across the site
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Issues Tab */}
            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Common Issues Across the Site</CardTitle>
                  <CardDescription>
                    Issues that appear on multiple pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.siteAnalysis.commonIssues.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Issue</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Recommendation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.siteAnalysis.commonIssues.map((issue, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium flex items-center gap-2">
                                {getSeverityIcon(issue.severity)}
                                {issue.type.replace(/_/g, ' ')}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                  issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {issue.severity}
                                </Badge>
                              </TableCell>
                              <TableCell>{issue.frequency} pages</TableCell>
                              <TableCell>{issue.recommendation}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No common issues found across the site
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pages Tab */}
            <TabsContent value="pages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analyzed Pages</CardTitle>
                  <CardDescription>
                    {data.pageResults.length} pages analyzed, sorted by score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Issues</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPages.map((page, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium max-w-md truncate">
                              <div className="truncate">{page.title || page.url}</div>
                              <div className="text-xs text-gray-500 truncate">{page.url}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getScoreBadgeColor(page.score)}>
                                {formatScore(page.score)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {page.criticalIssues ? (
                                <span className="text-red-600 font-medium">{page.criticalIssues} critical</span>
                              ) : null}
                              {page.criticalIssues && page.issues ? <span>, </span> : null}
                              {page.issues ? (
                                <span>{page.issues} total</span>
                              ) : (
                                <span>-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onAnalyzePage?.(page.url)}
                              >
                                Analyze
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Site-Wide Recommendations</CardTitle>
                  <CardDescription>
                    Actions to improve your site's SEO
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recommendations && data.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {data.recommendations.map((recommendation, index) => (
                        <Alert key={index} className="py-4">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {recommendation.priority === 'high' ? (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                              ) : recommendation.priority === 'medium' ? (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <Info className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <AlertTitle className="mb-1 flex items-center gap-2">
                                {recommendation.type.replace(/_/g, ' ')}
                                {getPriorityBadge(recommendation.priority)}
                              </AlertTitle>
                              <AlertDescription>
                                {recommendation.description}
                              </AlertDescription>
                              
                              {recommendation.affectedUrls && recommendation.affectedUrls.length > 0 && (
                                <div className="mt-2">
                                  <details className="text-sm">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                      View affected pages ({recommendation.affectedUrls.length})
                                    </summary>
                                    <ul className="mt-2 pl-5 list-disc text-gray-600 space-y-1">
                                      {recommendation.affectedUrls.map((url, urlIndex) => (
                                        <li key={urlIndex} className="truncate">
                                          <a 
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                          >
                                            {url}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                              )}
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No site-wide recommendations available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Site Structure Tab */}
            {data.siteStructure && (
              <TabsContent value="structure" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Structure</CardTitle>
                    <CardDescription>
                      Visual representation of your site's structure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Network className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">Site structure visualization is available in the interactive version</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {data.siteStructure.nodes.length} pages and {data.siteStructure.edges.length} links discovered
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Site Structure Data</CardTitle>
                    <CardDescription>
                      Pages and links in your site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Page</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Inbound Links</TableHead>
                            <TableHead>Outbound Links</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.siteStructure.nodes.map((node, index) => {
                            const inboundLinks = data.siteStructure.edges.filter(edge => edge.target === node.id).length;
                            const outboundLinks = data.siteStructure.edges.filter(edge => edge.source === node.id).length;
                            
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  <div className="truncate max-w-xs">{node.label}</div>
                                  <div className="text-xs text-gray-500 truncate">{node.id}</div>
                                </TableCell>
                                <TableCell>{node.title || '-'}</TableCell>
                                <TableCell>{inboundLinks}</TableCell>
                                <TableCell>{outboundLinks}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAuditResults;