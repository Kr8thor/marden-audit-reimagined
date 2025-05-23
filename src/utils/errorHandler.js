/**
 * Enhanced Error Handling Service
 * Provides meaningful error messages and proper error processing
 */

export class AnalysisError extends Error {
  constructor(message, type = 'ANALYSIS_ERROR', originalError = null) {
    super(message);
    this.name = 'AnalysisError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DNS_ERROR: 'DNS_ERROR', 
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SSL_ERROR: 'SSL_ERROR',
  INVALID_URL: 'INVALID_URL',
  SERVER_ERROR: 'SERVER_ERROR',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
  MOCK_DATA_ERROR: 'MOCK_DATA_ERROR'
};

export const processAnalysisResult = (result, originalUrl) => {
  // Check if we have a valid result structure
  if (!result || typeof result !== 'object') {
    throw new AnalysisError(
      'Invalid response from analysis service', 
      ErrorTypes.SERVER_ERROR
    );
  }

  // Check if the backend returned an error
  if (result.status === 'error') {
    const errorMessage = result.message || result.error || 'Analysis failed';
    throw new AnalysisError(errorMessage, ErrorTypes.ANALYSIS_ERROR);
  }

  // Check if the data contains an error
  if (result.data && result.data.status === 'error') {
    const backendError = result.data.error;
    const errorMessage = backendError?.message || 'Backend analysis failed';
    
    // Categorize the error for better user messages
    let errorType = ErrorTypes.ANALYSIS_ERROR;
    let userMessage = errorMessage;

    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      errorType = ErrorTypes.DNS_ERROR;
      userMessage = `Cannot reach "${originalUrl}". Please check if the website URL is correct and the site is accessible.`;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      errorType = ErrorTypes.TIMEOUT_ERROR;
      userMessage = `The website "${originalUrl}" took too long to respond. It may be slow or temporarily unavailable.`;
    } else if (errorMessage.includes('SSL') || errorMessage.includes('certificate') || errorMessage.includes('CERT')) {
      errorType = ErrorTypes.SSL_ERROR;
      userMessage = `SSL certificate issue with "${originalUrl}". The website may have security configuration problems.`;
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection refused')) {
      errorType = ErrorTypes.NETWORK_ERROR;
      userMessage = `Connection refused by "${originalUrl}". The website may be down or blocking automated requests.`;
    }

    throw new AnalysisError(userMessage, errorType, backendError);
  }

  // Validate that we have actual analysis data
  if (!result.data || typeof result.data !== 'object') {
    throw new AnalysisError(
      'No analysis data received from service', 
      ErrorTypes.SERVER_ERROR
    );
  }

  // Check for mock data indicators
  const dataStr = JSON.stringify(result.data).toLowerCase();
  const mockIndicators = [
    'sample', 'example', 'mock', 'fake', 'test-data', 
    'placeholder', 'fallback', 'demo', 'default website'
  ];
  
  const hasMockData = mockIndicators.some(indicator => dataStr.includes(indicator));
  
  if (hasMockData) {
    console.warn('⚠️ Potential mock data detected:', result.data);
    throw new AnalysisError(
      `Analysis returned sample data instead of real results for "${originalUrl}". This usually indicates a technical issue. Please try again.`,
      ErrorTypes.MOCK_DATA_ERROR
    );
  }

  // Additional validation for meaningful data
  if (result.data.score === 0 && !result.data.pageData) {
    throw new AnalysisError(
      `No meaningful analysis data available for "${originalUrl}". The website may be inaccessible or incompatible with our analysis tools.`,
      ErrorTypes.ANALYSIS_ERROR
    );
  }

  return result;
};

export const getErrorDisplayInfo = (error) => {
  if (!(error instanceof AnalysisError)) {
    return {
      title: 'Unexpected Error',
      message: error.message || 'An unexpected error occurred',
      type: 'error',
      suggestions: ['Please try again', 'Contact support if the problem persists']
    };
  }

  const errorDisplayMap = {
    [ErrorTypes.DNS_ERROR]: {
      title: 'Website Not Found',
      type: 'warning',
      suggestions: [
        'Double-check the website URL for typos',
        'Make sure the website is actually online',
        'Try accessing the website in your browser first'
      ]
    },
    [ErrorTypes.TIMEOUT_ERROR]: {
      title: 'Website Timeout',
      type: 'warning', 
      suggestions: [
        'Try again in a few moments',
        'The website may be experiencing heavy traffic',
        'Check if the website loads normally in your browser'
      ]
    },
    [ErrorTypes.SSL_ERROR]: {
      title: 'SSL Certificate Issue',
      type: 'error',
      suggestions: [
        'The website has SSL/security configuration problems',
        'This may affect the site\'s search engine ranking',
        'Contact the website owner about the SSL issue'
      ]
    },
    [ErrorTypes.NETWORK_ERROR]: {
      title: 'Connection Refused',
      type: 'error',
      suggestions: [
        'The website may be blocking automated requests',
        'Try again later as the site may be temporarily down',
        'Check if the website is accessible from your browser'
      ]
    },
    [ErrorTypes.MOCK_DATA_ERROR]: {
      title: 'Service Error',
      type: 'error',
      suggestions: [
        'Our analysis service returned sample data instead of real results',
        'This is a technical issue on our end',
        'Please try again or contact support'
      ]
    },
    [ErrorTypes.INVALID_URL]: {
      title: 'Invalid URL',
      type: 'warning',
      suggestions: [
        'Please enter a valid website URL',
        'Make sure to include http:// or https://',
        'Example: https://example.com'
      ]
    }
  };

  const displayInfo = errorDisplayMap[error.type] || {
    title: 'Analysis Error',
    type: 'error',
    suggestions: ['Please try again', 'Contact support if the issue persists']
  };

  return {
    ...displayInfo,
    message: error.message,
    timestamp: error.timestamp
  };
};