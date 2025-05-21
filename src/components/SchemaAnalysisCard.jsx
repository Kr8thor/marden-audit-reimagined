import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

/**
 * Component to display schema analysis results
 */
const SchemaAnalysisCard = ({ schemaData }) => {
  if (!schemaData) return null;
  
  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'missing': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Structured Data Analysis</CardTitle>
          <Badge 
            variant={schemaData.present ? 'success' : 'destructive'}
            className="ml-2"
          >
            {schemaData.present ? 'Found' : 'Missing'}
          </Badge>
        </div>
        <CardDescription>
          Analysis of schema.org markup on the page
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schemaData.present ? (
          <>
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(schemaData.status)}`}></div>
                <span className="font-medium">Status: {schemaData.status}</span>
              </div>
              <div className="text-sm text-gray-500">
                Found {schemaData.count} schema markup{schemaData.count !== 1 ? 's' : ''}
              </div>
            </div>
            
            {schemaData.types && schemaData.types.length > 0 && (
              <div className="mb-4">
                <div className="font-medium mb-1">Schema Types:</div>
                <div className="flex flex-wrap gap-1">
                  {schemaData.types.map((type, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {schemaData.formats && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">JSON-LD</div>
                  <div className="font-medium">{schemaData.formats.jsonLd || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Microdata</div>
                  <div className="font-medium">{schemaData.formats.microdata || 0}</div>
                </div>
              </div>
            )}
            
            {/* Issues */}
            {(schemaData.errors?.length > 0 || schemaData.warnings?.length > 0) && (
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="issues">
                  <AccordionTrigger className="font-medium">
                    Issues Found ({(schemaData.errors?.length || 0) + (schemaData.warnings?.length || 0)})
                  </AccordionTrigger>
                  <AccordionContent>
                    {schemaData.errors?.map((error, index) => (
                      <div key={`error-${index}`} className="flex items-start mb-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                        <div className="text-sm">{error.message}</div>
                      </div>
                    ))}
                    
                    {schemaData.warnings?.map((warning, index) => (
                      <div key={`warning-${index}`} className="flex items-start mb-2">
                        <Info className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                        <div className="text-sm">{warning.message}</div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
          </>
        ) : (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <div className="text-lg font-medium">No Structured Data Found</div>
            <div className="text-sm text-gray-500 mt-1">
              Adding schema.org markup can improve your search results appearance
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        {schemaData.recommendations?.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="font-medium mb-2">Recommendations:</div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {schemaData.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchemaAnalysisCard;