import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Type, 
  Image, 
  Link2, 
  Heading1, 
  Heading2,
  XCircle
} from 'lucide-react';

interface PageAnalysisViewProps {
  pageData: any;
  url: string;
  score?: number;
  cached?: boolean;
  cachedAt?: string;
}

const PageAnalysisView: React.FC<PageAnalysisViewProps> = ({ 
  pageData,
  url,
  score,
  cached = false,
  cachedAt
}) => {
  // Extract key values from pageData
  const title = pageData?.title?.text || pageData?.pageData?.title?.text || '';
  const titleLength = pageData?.title?.length || pageData?.pageData?.title?.length || 0;
  
  const metaDescription = pageData?.metaDescription?.text || pageData?.pageData?.metaDescription?.text || '';
  const metaDescriptionLength = pageData?.metaDescription?.length || pageData?.pageData?.metaDescription?.length || 0;
  
  const h1Headings = pageData?.headings?.h1Texts || pageData?.pageData?.headings?.h1Texts || [];
  const h1Count = pageData?.headings?.h1Count || pageData?.pageData?.headings?.h1Count || 0;
  
  const h2Headings = pageData?.headings?.h2Texts || pageData?.pageData?.headings?.h2Texts || [];
  const h2Count = pageData?.headings?.h2Count || pageData?.pageData?.headings?.h2Count || 0;
  
  const internalLinks = pageData?.links?.internalCount || pageData?.pageData?.links?.internalCount || 0;
  const externalLinks = pageData?.links?.externalCount || pageData?.pageData?.links?.externalCount || 0;
  const totalLinks = pageData?.links?.totalCount || pageData?.pageData?.links?.totalCount || 0;
  
  const imgTotal = pageData?.images?.total || pageData?.pageData?.images?.total || 0;
  const imgWithoutAlt = pageData?.images?.withoutAlt || pageData?.pageData?.images?.withoutAlt || 0;
  const imgSamples = pageData?.images?.samples || pageData?.pageData?.images?.samples || [];
  
  const wordCount = pageData?.content?.wordCount || pageData?.pageData?.content?.wordCount || 0;
  const contentLength = pageData?.content?.contentLength || pageData?.contentLength || pageData?.pageData?.content?.contentLength || 0;
  
  const canonical = pageData?.canonical || pageData?.pageData?.canonical || pageData?.technical?.canonicalUrl || pageData?.pageData?.technical?.canonicalUrl || '';
  
  // Helper functions for status displays
  const getTitleStatus = () => {
    if (!title) return { text: 'Missing title', color: 'text-red-500', icon: <XCircle className="h-4 w-4 text-red-500" /> };
    if (titleLength < 30) return { text: 'Too short', color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> };
    if (titleLength > 60) return { text: 'Too long', color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> };
    return { text: 'Good', color: 'text-green-500', icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
  };
  
  const getMetaDescriptionStatus = () => {
    if (!metaDescription) return { text: 'Missing', color: 'text-red-500', icon: <XCircle className="h-4 w-4 text-red-500" /> };
    if (metaDescriptionLength < 80) return { text: 'Too short', color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> };
    if (metaDescriptionLength > 160) return { text: 'Too long', color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> };
    return { text: 'Good', color: 'text-green-500', icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
  };
  
  const getH1Status = () => {
    if (h1Count === 0) return { text: 'Missing H1', color: 'text-red-500', icon: <XCircle className="h-4 w-4 text-red-500" /> };
    if (h1Count > 1) return { text: 'Multiple H1s', color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> };
    return { text: 'Good', color: 'text-green-500', icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
  };
  
  const getH2Status = () => {
    if (h2Count === 0) return { text: 'No H2 headings', color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> };
    return { text: 'Good', color: 'text-green-500', icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
  };
  
  const getContentStatus = () => {
    if (wordCount < 300) return { text: 'Too short', color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> };
    return { text: 'Good', color: 'text-green-500', icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
  };
  
  const getImageAltStatus = () => {
    if (imgTotal === 0) return { text: 'No images', color: 'text-blue-500', icon: <Info className="h-4 w-4 text-blue-500" /> };
    if (imgWithoutAlt > 0) return { 
      text: `${imgWithoutAlt} images missing alt`, 
      color: 'text-red-500', 
      icon: <AlertTriangle className="h-4 w-4 text-red-500" /> 
    };
    return { text: 'All images have alt text', color: 'text-green-500', icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
  };
  
  // Title status
  const titleStatus = getTitleStatus();
  const metaStatus = getMetaDescriptionStatus();
  const h1Status = getH1Status();
  const h2Status = getH2Status();
  const contentStatus = getContentStatus();
  const imageStatus = getImageAltStatus();

  return (
    <div className="page-analysis-view space-y-6">
      {/* Header Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Page Analysis: {url}
              </CardTitle>
              {cached && cachedAt && (
                <CardDescription>
                  Cached Report: {new Date(cachedAt).toLocaleString()}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Page Score:</span>
              <span className={`text-3xl font-bold ${
                score && score >= 80 ? 'text-green-600' :
                score && score >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {score || 0}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Metadata Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Type className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Title</span>
                        </div>
                        <div className="flex items-center">
                          {titleStatus.icon}
                          <span className={`text-sm ml-1 ${titleStatus.color}`}>{titleStatus.text}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Meta Description</span>
                        </div>
                        <div className="flex items-center">
                          {metaStatus.icon}
                          <span className={`text-sm ml-1 ${metaStatus.color}`}>{metaStatus.text}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Content Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Heading1 className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">H1 Headings</span>
                        </div>
                        <div className="flex items-center">
                          {h1Status.icon}
                          <span className={`text-sm ml-1 ${h1Status.color}`}>{h1Status.text}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Heading2 className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">H2 Headings</span>
                        </div>
                        <div className="flex items-center">
                          {h2Status.icon}
                          <span className={`text-sm ml-1 ${h2Status.color}`}>{h2Status.text}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Content Length</span>
                        </div>
                        <div className="flex items-center">
                          {contentStatus.icon}
                          <span className={`text-sm ml-1 ${contentStatus.color}`}>{contentStatus.text}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Elements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Image className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Images</span>
                        </div>
                        <span className="text-sm font-medium">{imgTotal}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Link2 className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Links</span>
                        </div>
                        <span className="text-sm font-medium">{totalLinks}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Image className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Alt Text</span>
                        </div>
                        <div className="flex items-center">
                          {imageStatus.icon}
                          <span className={`text-sm ml-1 ${imageStatus.color}`}>
                            {imgTotal > 0 ? `${imgTotal - imgWithoutAlt}/${imgTotal}` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Page Title</CardTitle>
                  {titleLength > 0 && (
                    <CardDescription>
                      {titleLength} characters {' '}
                      <Badge className={
                        titleLength >= 30 && titleLength <= 60 ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {titleLength < 30 ? 'Too short' : 
                         titleLength > 60 ? 'Too long' : 'Good length'}
                      </Badge>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {title ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <p className="font-medium">{title}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-md flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>No title detected - this is a critical SEO issue</span>
                    </div>
                  )}
                  
                  {title && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Recommended length: 30-60 characters</span>
                        <span className={titleStatus.color}>{titleStatus.text}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (titleLength / 60) * 100)} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meta Description</CardTitle>
                  {metaDescriptionLength > 0 && (
                    <CardDescription>
                      {metaDescriptionLength} characters {' '}
                      <Badge className={
                        metaDescriptionLength >= 80 && metaDescriptionLength <= 160 ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {metaDescriptionLength < 80 ? 'Too short' : 
                         metaDescriptionLength > 160 ? 'Too long' : 'Good length'}
                      </Badge>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {metaDescription ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <p>{metaDescription}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-md flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>No meta description detected - this is a critical SEO issue</span>
                    </div>
                  )}
                  
                  {metaDescription && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Recommended length: 80-160 characters</span>
                        <span className={metaStatus.color}>{metaStatus.text}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (metaDescriptionLength / 160) * 100)} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {canonical && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Canonical URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <p className="font-mono text-sm break-all">{canonical}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">H1 Headings</CardTitle>
                    <CardDescription>
                      {h1Count} found {' '}
                      <Badge className={
                        h1Count === 1 ? 'bg-green-100 text-green-800' :
                        h1Count === 0 ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {h1Count === 0 ? 'Missing' : 
                         h1Count > 1 ? 'Multiple' : 'Good'}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {h1Headings.length > 0 ? (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {h1Headings.map((heading, index) => (
                            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                              <p className="font-medium">{heading}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-md flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <span>No H1 headings detected - this is a critical SEO issue</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">H2 Headings</CardTitle>
                    <CardDescription>
                      {h2Count} found {' '}
                      <Badge className={
                        h2Count > 0 ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {h2Count === 0 ? 'None' : 'Good'}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {h2Headings.length > 0 ? (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {h2Headings.map((heading, index) => (
                            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                              <p>{heading}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300 rounded-md flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        <span>No H2 headings detected - consider adding some for better content structure</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Images</CardTitle>
                  <CardDescription>
                    {imgTotal} images found, {imgWithoutAlt} missing alt text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {imgTotal > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              imgWithoutAlt === 0 ? 'bg-green-500' : 'bg-yellow-500'
                            }`} 
                            style={{ width: `${100 - (imgWithoutAlt / imgTotal * 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">
                          {Math.round(100 - (imgWithoutAlt / imgTotal * 100))}% with alt text
                        </span>
                      </div>
                      
                      {imgSamples.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Sample Images</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {imgSamples.map((img, index) => (
                              <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <div className="flex items-start space-x-2">
                                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                    <Image className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-mono truncate max-w-full">{img.src}</div>
                                    <div className="text-xs mt-1">
                                      Alt: {img.alt ? 
                                        <span className="text-green-600 dark:text-green-400">{img.alt}</span> : 
                                        <span className="text-red-600 dark:text-red-400">Missing</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      <span>No images detected on this page</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Word Count</div>
                      <div className="text-2xl font-bold">{wordCount.toLocaleString()}</div>
                      <div className="text-xs mt-1">
                        {wordCount < 300 ? (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Below recommended minimum (300)
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">
                            Good length
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Characters</div>
                      <div className="text-2xl font-bold">{contentLength.toLocaleString()}</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reading Time</div>
                      <div className="text-2xl font-bold">
                        {Math.max(1, Math.round(wordCount / 200))} min
                      </div>
                      <div className="text-xs mt-1">Based on 200 words per minute</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Link Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Internal Links</div>
                      <div className="text-2xl font-bold">{internalLinks}</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">External Links</div>
                      <div className="text-2xl font-bold">{externalLinks}</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Links</div>
                      <div className="text-2xl font-bold">{totalLinks}</div>
                    </div>
                  </div>
                  
                  {totalLinks > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-l-full bg-blue-500" 
                            style={{ width: `${(internalLinks / totalLinks * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Internal: {Math.round(internalLinks / totalLinks * 100)}%</span>
                        <span>External: {Math.round(externalLinks / totalLinks * 100)}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {pageData?.performanceMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    <CardDescription>
                      Core Web Vitals and performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pageData.performanceMetrics.lcp && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>LCP (Largest Contentful Paint)</span>
                            <span className={
                              pageData.performanceMetrics.lcp.score >= 90 ? 'text-green-600' :
                              pageData.performanceMetrics.lcp.score >= 70 ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {pageData.performanceMetrics.lcp.value}{pageData.performanceMetrics.lcp.unit}
                            </span>
                          </div>
                          <Progress 
                            value={pageData.performanceMetrics.lcp.score} 
                            className="h-2" 
                          />
                        </div>
                      )}
                      
                      {pageData.performanceMetrics.cls && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CLS (Cumulative Layout Shift)</span>
                            <span className={
                              pageData.performanceMetrics.cls.score >= 90 ? 'text-green-600' :
                              pageData.performanceMetrics.cls.score >= 70 ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {pageData.performanceMetrics.cls.value}
                            </span>
                          </div>
                          <Progress 
                            value={pageData.performanceMetrics.cls.score} 
                            className="h-2" 
                          />
                        </div>
                      )}
                      
                      {pageData.performanceMetrics.fid && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>FID (First Input Delay)</span>
                            <span className={
                              pageData.performanceMetrics.fid.score >= 90 ? 'text-green-600' :
                              pageData.performanceMetrics.fid.score >= 70 ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {pageData.performanceMetrics.fid.value}{pageData.performanceMetrics.fid.unit}
                            </span>
                          </div>
                          <Progress 
                            value={pageData.performanceMetrics.fid.score} 
                            className="h-2" 
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center">
                        <Link2 className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Canonical URL</span>
                      </div>
                      <div className="flex items-center">
                        {canonical ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`text-sm ml-1 ${canonical ? 'text-green-500' : 'text-yellow-500'}`}>
                          {canonical ? 'Present' : 'Missing'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Add more technical SEO checks here */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageAnalysisView;