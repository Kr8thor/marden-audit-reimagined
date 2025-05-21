import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Info, AlertTriangle, Globe, Settings, List } from 'lucide-react';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { useSiteAudit } from '../services/api';
import SiteAuditResults from './SiteAuditResults';

interface SiteAuditFormProps {
  onPageAudit?: (url: string) => void;
}

interface FormValues {
  url: string;
  maxPages: number;
  maxDepth: number;
  respectRobots: boolean;
  customPages: string;
  advancedMode: boolean;
}

const SiteAuditForm: React.FC<SiteAuditFormProps> = ({ onPageAudit }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      url: '',
      maxPages: 25,
      maxDepth: 3,
      respectRobots: true,
      customPages: '',
      advancedMode: false
    }
  });
  
  const { result, isLoading, error, progress, statusMessage, runAudit } = useSiteAudit();
  
  const advancedMode = watch('advancedMode');
  const maxPages = watch('maxPages');
  const maxDepth = watch('maxDepth');
  
  const onSubmit = async (data: FormValues) => {
    try {
      // Parse custom pages if provided
      let customPages: string[] = [];
      if (data.customPages) {
        customPages = data.customPages
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }
      
      // Run the site audit
      await runAudit(data.url, {
        maxPages: data.maxPages,
        maxDepth: data.maxDepth,
        respectRobots: data.respectRobots,
        skipCrawl: customPages.length > 0,
        customPages: customPages.length > 0 ? customPages : undefined
      });
    } catch (error) {
      console.error('Error running site audit:', error);
    }
  };
  
  // If we have results, show them
  if (result && result.data) {
    return (
      <SiteAuditResults 
        data={result.data} 
        onAnalyzePage={onPageAudit}
      />
    );
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Full Site SEO Audit
        </CardTitle>
        <CardDescription>
          Crawl and analyze your entire website for SEO issues
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...register('url', { 
                  required: 'URL is required',
                  pattern: {
                    value: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                    message: 'Please enter a valid URL'
                  }
                })}
                disabled={isLoading}
              />
              {errors.url && (
                <p className="text-sm text-red-500">{errors.url.message}</p>
              )}
            </div>
            
            {/* Advanced Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="advanced-mode"
                  checked={advancedMode}
                  onCheckedChange={(checked) => setValue('advancedMode', checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="advanced-mode" className="cursor-pointer">Advanced Options</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Analyzing...' : 'Start Site Audit'}
                </Button>
              </div>
            </div>
            
            {/* Advanced Options */}
            {advancedMode && (
              <div className="pt-4 space-y-6">
                <Separator />
                
                <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic" className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Crawl Settings
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center gap-1">
                      <List className="h-4 w-4" />
                      Custom Pages
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Basic Settings Tab */}
                  <TabsContent value="basic" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Max Pages to Analyze: {maxPages}</Label>
                        <span className="text-sm text-gray-500">
                          {maxPages >= 50 ? 'High server load' : 'Normal server load'}
                        </span>
                      </div>
                      <Slider
                        value={[maxPages]}
                        min={5}
                        max={100}
                        step={5}
                        onValueChange={(value) => setValue('maxPages', value[0])}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Limit the number of pages to analyze (5-100)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Max Crawl Depth: {maxDepth}</Label>
                        <span className="text-sm text-gray-500">
                          {maxDepth >= 4 ? 'Deep crawl' : 'Standard crawl'}
                        </span>
                      </div>
                      <Slider
                        value={[maxDepth]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(value) => setValue('maxDepth', value[0])}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        How many clicks from the homepage to crawl (1-5)
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="respect-robots"
                        {...register('respectRobots')}
                        disabled={isLoading}
                      />
                      <Label htmlFor="respect-robots" className="cursor-pointer">Respect robots.txt</Label>
                    </div>
                  </TabsContent>
                  
                  {/* Custom Pages Tab */}
                  <TabsContent value="custom" className="space-y-6 pt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Custom Pages Mode</AlertTitle>
                      <AlertDescription>
                        Enter specific URLs to analyze instead of crawling the site.
                        Enter one URL per line.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="custom-pages">Pages to Analyze</Label>
                      <Textarea
                        id="custom-pages"
                        placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                        rows={5}
                        {...register('customPages')}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Enter up to {maxPages} URLs, one per line
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span>{statusMessage || 'Analyzing site...'}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">
                  {statusMessage || (
                    progress < 30 ? 'Crawling pages...' : 
                    progress < 60 ? 'Analyzing SEO factors...' : 
                    progress < 90 ? 'Generating recommendations...' : 
                    'Finalizing report...'
                  )}
                </p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'Failed to run site audit. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-800 flex flex-col items-start">
        <p className="text-sm text-gray-500">
          <Info className="h-4 w-4 inline mr-1" />
          Full site audits analyze multiple pages to provide a comprehensive SEO assessment.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SiteAuditForm;