
import { useState } from 'react';
import { Search, Zap, BarChart, Smartphone, Server, FileSearch, Code, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  isNew?: boolean;
  link?: string;
}

const FeatureCard = ({ icon, title, description, color, isNew, link }: FeatureCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleClick = () => {
    if (link) {
      // If there's a link, navigate instead of flipping
      window.location.href = link;
    } else {
      // Otherwise flip the card
      setIsFlipped(!isFlipped);
    }
  };
  
  return (
    <div 
      className={`feature-card glass-card h-56 cursor-pointer transition-all duration-500 ${color}`}
      style={{ 
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}
      onClick={handleClick}
    >
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-6 backface-hidden"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${color}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-center">
          {title}
          {isNew && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white">
              New
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          {link ? 'Click to try' : 'Click to learn more'}
        </p>
      </div>
      
      <div 
        className="absolute inset-0 flex flex-col items-start justify-center p-6 backface-hidden"
        style={{ 
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {link && (
          <button 
            className="mt-4 px-3 py-1 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-md text-sm"
          >
            Try Now
          </button>
        )}
      </div>
    </div>
  );
};

const FeatureCards = () => {
  const features = [
    {
      icon: <Search className="h-7 w-7 text-white" />,
      title: "Technical SEO",
      description: "Comprehensive analysis of crawlability, indexing, site architecture, and Core Web Vitals to ensure search engines can properly access your content.",
      color: "neon-glow-purple"
    },
    {
      icon: <FileSearch className="h-7 w-7 text-white" />,
      title: "On-Page Content",
      description: "Detailed evaluation of meta tags, content quality, keyword usage, and semantic relevance to optimize your pages for maximum visibility.",
      color: "neon-glow-blue"
    },
    {
      icon: <Smartphone className="h-7 w-7 text-white" />,
      title: "Mobile Friendliness",
      description: "In-depth testing of your site's mobile experience, responsive design implementation, and touch-friendly interface elements.",
      color: "neon-glow-teal",
      isNew: true,
      link: "/enhanced"
    },
    {
      icon: <Zap className="h-7 w-7 text-white" />,
      title: "Site Speed",
      description: "Performance analysis to identify bottlenecks and provide actionable recommendations to improve loading times across all devices.",
      color: "neon-glow-purple"
    },
    // Added new features
    {
      icon: <Code className="h-7 w-7 text-white" />,
      title: "Schema Validator",
      description: "Comprehensive analysis of structured data markup to ensure proper implementation and maximize rich snippet opportunities in search results.",
      color: "neon-glow-green",
      isNew: true,
      link: "/enhanced"
    },
    {
      icon: <Globe className="h-7 w-7 text-white" />,
      title: "Site Crawler",
      description: "Advanced website crawling with depth analysis to identify structural issues, broken links, and optimization opportunities across your entire site.",
      color: "neon-glow-orange",
      isNew: true,
      link: "/site-audit"
    },
  ];
  
  return (
    <section className="py-16 md:py-24" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive Audit Breakdown</h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive audit examines every aspect of your site's SEO performance.
            Click each card to learn more or try our new enhanced features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              isNew={feature.isNew}
              link={feature.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;