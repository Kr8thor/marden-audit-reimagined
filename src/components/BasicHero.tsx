import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { ChevronRight, Play, Search, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import AnimatedButton from './AnimatedButton';
import CircularProgress from './CircularProgress';
import { useAuditClient } from '../hooks/useAuditClient';
import AuditResults from './audit/AuditResults';
import AuditError from './audit/AuditError';

// Improved URL validation regex
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

const BasicHero = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  
  // Use our improved audit hook
  const { isLoading, progress, result, error, runAudit } = useAuditClient();
  
  // Handle URL validation
  const validateUrl = (input: string) => {
    setUrl(input);
    
    if (input && !URL_REGEX.test(input)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError(null);
    }
  };
  
  // Handle scan button click - now navigates to the audit page
  const handleScan = (type: 'quick' | 'site' = 'quick') => {
    if (!url || urlError) return;
    
    // Normalize the URL for the route parameter
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = normalizedUrl.replace(/^www\./, '');
    }
    
    // URL encode the normalized URL and navigate with the audit type
    const encodedUrl = encodeURIComponent(normalizedUrl);
    navigate(`/audit/${encodedUrl}?type=${type}`);
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
                  document.getElementById('audit-input')?.scrollIntoView({ behavior: 'smooth' });
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
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter your website URL"
                      className={`pl-10 bg-background/50 border-white/10 focus:border-primary h-12 ${urlError ? 'border-red-400' : ''}`}
                      value={url}
                      onChange={(e) => validateUrl(e.target.value)}
                    />
                    {urlError && (
                      <div className="text-red-400 text-xs mt-1 ml-1">{urlError}</div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <AnimatedButton
                      variant="primary"
                      glowColor="blue" 
                      className="h-12"
                      onClick={() => handleScan('quick')}
                      disabled={!url || !!urlError}
                    >
                      Quick Audit
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      glowColor="purple" 
                      className="h-12"
                      onClick={() => handleScan('site')}
                      disabled={!url || !!urlError}
                      title="Analyzes up to 20 pages on your site"
                    >
                      Site Audit (20 pages)
                    </AnimatedButton>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Quick Audit analyzes a single page • Site Audit crawls up to 20 pages on your website
                  <span className="block mt-1">
                    Need to audit multiple separate URLs? <a href="/batch-audit" className="text-primary hover:underline">Try Batch Audit</a>
                  </span>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="w-full rounded-lg overflow-hidden">
                <div className="bg-background/50 border border-white/10 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Search className="h-7 w-7 text-white/70" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Enter your URL to begin</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Get a comprehensive SEO analysis with actionable insights in seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicHero;