import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, SmartphoneIcon, TabletIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

/**
 * Component to display mobile-friendliness analysis results
 */
const MobileAnalysisCard = ({ mobileData }) => {
  if (!mobileData) return null;
  
  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'needs_improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };
  
  // Get background color for progress
  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500 mt-1 mr-2 flex-shrink-0" />;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mobile-Friendliness</CardTitle>
          <Badge 
            variant={mobileData.score >= 80 ? 'success' : mobileData.score >= 50 ? 'warning' : 'destructive'}
            className="ml-2"
          >
            {mobileData.status}
          </Badge>
        </div>
        <CardDescription>
          Analysis of mobile-friendly factors
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Score indicator */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Score</span>
            <span className="text-sm font-medium">{mobileData.score}/100</span>
          </div>
          <Progress 
            value={mobileData.score} 
            className={`h-2 ${getProgressColor(mobileData.score)}`} 
          />
        </div>
        
        {/* Mobile factors */}
        <div className="space-y-4">
          {/* Viewport */}
          {mobileData.factors?.viewport && (
            <div>
              <div className="font-medium mb-1">Viewport</div>
              <div className="flex items-center">
                {mobileData.factors.viewport.present ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className="text-sm">
                  {mobileData.factors.viewport.present 
                    ? 'Viewport meta tag is present' 
                    : 'Viewport meta tag is missing'}
                </span>
              </div>
              {mobileData.factors.viewport.present && (
                <div className="text-xs text-gray-500 mt-1">
                  {mobileData.factors.viewport.value}
                </div>
              )}
            </div>
          )}
          
          {/* Tap Targets */}
          {mobileData.factors?.tapTargets && (
            <div>
              <div className="font-medium mb-1">Tap Targets</div>
              <div className="flex items-center">
                {mobileData.factors.tapTargets.smallTargetsCount === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className={`h-4 w-4 ${mobileData.factors.tapTargets.smallTargetsCount > 5 ? 'text-red-500' : 'text-yellow-500'} mr-2`} />
                )}
                <span className="text-sm">
                  {mobileData.factors.tapTargets.smallTargetsCount === 0 
                    ? 'All tap targets are properly sized' 
                    : `${mobileData.factors.tapTargets.smallTargetsCount} small tap targets found`}
                </span>
              </div>
            </div>
          )}
          
          {/* Responsive Design */}
          {mobileData.factors?.responsiveDesign && (
            <div>
              <div className="font-medium mb-1">Responsive Design</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  {mobileData.factors.responsiveDesign.mediaQueryCount > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className="text-sm">
                    {mobileData.factors.responsiveDesign.mediaQueryCount} media queries
                  </span>
                </div>
                <div className="flex items-center">
                  {!mobileData.factors.responsiveDesign.hasFixedWidth ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className="text-sm">
                    {mobileData.factors.responsiveDesign.hasFixedWidth 
                      ? 'Fixed width detected' 
                      : 'No fixed width'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Issues */}
        {mobileData.issues?.length > 0 && (
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="issues">
              <AccordionTrigger className="font-medium">
                Issues Found ({mobileData.issues.length})
              </AccordionTrigger>
              <AccordionContent>
                {mobileData.issues.map((issue, index) => (
                  <div key={`issue-${index}`} className="flex items-start mb-2">
                    {getSeverityIcon(issue.severity)}
                    <div>
                      <div className="text-sm font-medium">{issue.type.split('_').join(' ')}</div>
                      <div className="text-xs text-gray-500">{issue.recommendation}</div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {/* Positive aspects */}
        {mobileData.positiveAspects?.length > 0 && (
          <div className="mt-4">
            <div className="font-medium mb-2">Positive Aspects:</div>
            <ul className="text-sm space-y-1">
              {mobileData.positiveAspects.map((aspect, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {aspect}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Recommendations */}
        {mobileData.recommendations?.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="font-medium mb-2">Recommendations:</div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {mobileData.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileAnalysisCard;