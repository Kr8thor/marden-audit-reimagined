import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronRight, Play, Search, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import AnimatedButton from './AnimatedButton';
import CircularProgress from './CircularProgress';
import { runSeoAudit, useApiStatus, AuditResult } from '@/services/api';
import { useToast } from './ui/use-toast';

const Hero = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const { isApiReady, isLoading, error, checkStatus } = useApiStatus();
  const { toast } = useToast();
  
  // Check API status on component mount
  useEffect(() => {
    checkStatus();
  }, []);
  
  const handleScan = async () => {
    if (!url) return;
    
    // Basic URL validation
    try {
      // Add https:// if missing
      let urlToAudit = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToAudit = `https://${url}`;
      }
      
      // Validate URL format
      new URL(urlToAudit);
      
      setIsScanning(true);
      setScanProgress(0);
      setShowResults(false);
      
      // Progress simulation
      const interval = setInterval(() => {
        setScanProgress(prev => {
          // Cap at 95% until we get actual results
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      try {
        // Call the API service
        const result = await runSeoAudit(urlToAudit);
        setAuditResult(result);
        
        // Complete the progress and show results
        clearInterval(interval);
        setScanProgress(100);
        
        setTimeout(() => {
          setIsScanning(false);
          setShowResults(true);
        }, 500);
        
      } catch (apiError) {
        clearInterval(interval);
        setIsScanning(false);
        
        toast({
          title: "Audit Failed",
          description: "There was an error while analyzing this website. Please try again.",
          variant: "destructive",
        });
        
        console.error("API Error:", apiError);
      }
      
    } catch (urlError) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
    }
  };
  
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Animated Background */}
      <div className="hero-background"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in text-glow">
              Your SEO Audit. <span className="gradient-text">Reimagined.</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Free, lightning-fast, and powered by AI—MardenSEO Audit gives you crystal-clear insights with zero fluff.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <AnimatedButton 
                variant="primary"
                size="lg"
                glowColor="purple"
                className="w-full sm:w-auto"
                onClick={() => {
                  // Scroll to the URL input
                  document.getElementById('audit-input')?.scrollIntoView({ behavior: 'smooth' });
                  // Focus on the input field
                  setTimeout(() => {
                    const inputElement = document.querySelector('input[placeholder="Enter your website URL"]') as HTMLInputElement;
                    if (inputElement) inputElement.focus();
                  }, 500);
                }}
              >
                Run Your Free Audit
                <ChevronRight className="ml-2 h-5 w-5" />
              </AnimatedButton>
              
              <Dialog>
                <DialogTrigger asChild>
                  <AnimatedButton 
                    variant="outline" 
                    size="lg"
                    glowEffect={false}
                    className="w-full sm:w-auto"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] bg-card/90 backdrop-blur-lg">
                  <div className="aspect-video bg-black/30 rounded-md flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Demo video would play here</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* URL Scan Demo */}
          <div id="audit-input" className="max-w-4xl mx-auto bg-card/30 backdrop-blur-md border border-white/10 rounded-xl p-6 animate-fade-in neon-glow-purple" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {isScanning && <div className="scan-line"></div>}
              
              {/* API Status Indicator */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="text-sm">
                    <span className="font-medium">API Connection Error: </span> 
                    <span className="text-white/70">Unable to connect to the audit backend.</span>
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter your website URL"
                      className="pl-10 bg-background/50 border-white/10 focus:border-primary h-12"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isScanning || (isLoading || (!isApiReady && !error))}
                    />
                  </div>
                  <AnimatedButton
                    variant="primary"
                    glowColor="blue" 
                    className="h-12 sm:w-32"
                    onClick={handleScan}
                    disabled={isScanning || !url || (isLoading || (!isApiReady && !error))}
                  >
                    {isScanning ? 'Scanning...' : 'Analyze'}
                  </AnimatedButton>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="w-full rounded-lg overflow-hidden">
                <div className="bg-background/50 border border-white/10 rounded-lg p-4">
                  {isScanning && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="relative w-32 h-32 mb-6">
                        <div className="radar-scan"></div>
                        <CircularProgress
                          value={scanProgress}
                          size={130}
                          strokeWidth={6}
                          gradientStart="#8b5cf6"
                          gradientEnd="#0ea5e9"
                          animate={true}
                          duration={300}
                          label="Scanning"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground text-center max-w-sm">
                        Analyzing {url || 'your website'} for SEO issues and opportunities...
                      </div>
                    </div>
                  )}
                  
                  {showResults && auditResult && (
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold">{auditResult.url}</h3>
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
                            <div className="text-2xl font-bold gradient-text">{auditResult.score}</div>
                            <div className="text-xs ml-1 text-white/60">/100</div>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-muted-foreground mb-1">Issues Found</div>
                          <div className="text-2xl font-bold text-red-400">{auditResult.issuesFound}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-muted-foreground mb-1">Opportunities</div>
                          <div className="text-2xl font-bold text-green-400">{auditResult.opportunities}</div>
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
                                <span className={auditResult.performanceMetrics.lcp.score >= 90 ? "text-green-400" : 
                                               auditResult.performanceMetrics.lcp.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                                  {auditResult.performanceMetrics.lcp.value}{auditResult.performanceMetrics.lcp.unit}
                                </span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  auditResult.performanceMetrics.lcp.score >= 90 ? "bg-green-400" : 
                                  auditResult.performanceMetrics.lcp.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                                }`} style={{ width: `${auditResult.performanceMetrics.lcp.score}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>CLS (Cumulative Layout Shift)</span>
                                <span className={auditResult.performanceMetrics.cls.score >= 90 ? "text-green-400" : 
                                               auditResult.performanceMetrics.cls.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                                  {auditResult.performanceMetrics.cls.value}
                                </span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  auditResult.performanceMetrics.cls.score >= 90 ? "bg-green-400" : 
                                  auditResult.performanceMetrics.cls.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                                }`} style={{ width: `${auditResult.performanceMetrics.cls.score}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>FID (First Input Delay)</span>
                                <span className={auditResult.performanceMetrics.fid.score >= 90 ? "text-green-400" : 
                                               auditResult.performanceMetrics.fid.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                                  {auditResult.performanceMetrics.fid.value}{auditResult.performanceMetrics.fid.unit}
                                </span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  auditResult.performanceMetrics.fid.score >= 90 ? "bg-green-400" : 
                                  auditResult.performanceMetrics.fid.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                                }`} style={{ width: `${auditResult.performanceMetrics.fid.score}%` }}></div>
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
                            {auditResult.topIssues.map((issue, index) => (
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
                  )}
                  
                  {!isScanning && !showResults && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Search className="h-7 w-7 text-white/70" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Enter your URL to begin</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Get a comprehensive SEO analysis with actionable insights in seconds.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
