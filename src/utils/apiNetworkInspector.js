/**
 * Creates an inspector to monitor all network requests
 * This will help identify if API calls are being made and their results
 */
export function setupNetworkInspector() {
  console.log('🔍 Setting up network inspector');
  
  // Store original methods
  const originalFetch = window.fetch;
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  // Array to track requests
  const requests = [];
  
  // Override fetch
  window.fetch = async function(...args) {
    const url = args[0] instanceof Request ? args[0].url : args[0];
    const options = args[1] || {};
    
    console.log(`🔍 NETWORK: fetch request to ${url}`, options);
    
    const requestId = Date.now();
    const requestEntry = {
      id: requestId,
      type: 'fetch',
      url,
      method: options.method || 'GET',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    requests.push(requestEntry);
    
    try {
      // Call original fetch
      const response = await originalFetch.apply(this, args);
      
      // Clone the response so we can read its body (since it can only be consumed once)
      const responseClone = response.clone();
      
      // Try to get response body if it's JSON
      let responseBody = null;
      try {
        if (response.headers.get('content-type')?.includes('application/json')) {
          responseBody = await responseClone.json();
        }
      } catch (e) {
        console.warn('Could not parse response as JSON', e);
      }      
      // Update request entry
      const indexToUpdate = requests.findIndex(req => req.id === requestId);
      if (indexToUpdate !== -1) {
        requests[indexToUpdate] = {
          ...requestEntry,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          headers: Object.fromEntries([...response.headers.entries()]),
          response: responseBody,
          completed: new Date().toISOString()
        };
      }
      
      // If the response contains "mock" data, log a warning
      if (responseBody && 
          (responseBody.isMockData === true || 
           JSON.stringify(responseBody).includes('"isMockData":true'))) {
        console.warn('🔍 NETWORK: Response contains mock data!', responseBody);
      }
      
      console.log(`🔍 NETWORK: fetch response from ${url}:`, response.status, responseBody);
      
      return response;
    } catch (error) {
      // Update request entry with error
      const indexToUpdate = requests.findIndex(req => req.id === requestId);
      if (indexToUpdate !== -1) {
        requests[indexToUpdate] = {
          ...requestEntry,
          status: 'failed',
          error: error.message,
          completed: new Date().toISOString()
        };
      }
      
      console.error(`🔍 NETWORK: fetch error for ${url}:`, error);
      throw error;
    }
  };
  
  // Override XMLHttpRequest open
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._inspectorData = {
      method,
      url,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    console.log(`🔍 NETWORK: XHR ${method} request to ${url}`);
    
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };  
  // Override XMLHttpRequest send
  XMLHttpRequest.prototype.send = function(body) {
    if (this._inspectorData) {
      const requestEntry = {
        ...this._inspectorData,
        type: 'xhr',
        body: body ? (typeof body === 'string' ? body : '[binary data]') : null,
        status: 'pending'
      };
      
      requests.push(requestEntry);
      
      // Add event listener for load
      this.addEventListener('load', function() {
        const indexToUpdate = requests.findIndex(req => req.id === requestEntry.id);
        
        let responseBody = null;
        try {
          if (this.responseType === 'json' || 
              (this.responseType === '' && this.getResponseHeader('content-type')?.includes('application/json'))) {
            responseBody = JSON.parse(this.responseText);
          }
        } catch (e) {
          console.warn('Could not parse XHR response as JSON', e);
        }
        
        if (indexToUpdate !== -1) {
          requests[indexToUpdate] = {
            ...requestEntry,
            status: this.status >= 200 && this.status < 300 ? 'success' : 'error',
            statusCode: this.status,
            headers: this.getAllResponseHeaders().split('\r\n').reduce((acc, line) => {
              const parts = line.split(': ');
              if (parts.length === 2) {
                acc[parts[0]] = parts[1];
              }
              return acc;
            }, {}),
            response: responseBody || this.responseText,
            completed: new Date().toISOString()
          };
        }
        
        console.log(`🔍 NETWORK: XHR response from ${requestEntry.url}:`, this.status, responseBody);
      });
      
      // Add event listener for error
      this.addEventListener('error', function(error) {
        const indexToUpdate = requests.findIndex(req => req.id === requestEntry.id);
        if (indexToUpdate !== -1) {
          requests[indexToUpdate] = {
            ...requestEntry,
            status: 'failed',
            error: 'Network error',
            completed: new Date().toISOString()
          };
        }
        
        console.error(`🔍 NETWORK: XHR error for ${requestEntry.url}:`, error);
      });
    }    
    return originalXHRSend.apply(this, arguments);
  };
  
  // Add a method to get all tracked requests
  window.__getNetworkRequests = function() {
    return [...requests];
  };
  
  // Add a method to clear tracked requests
  window.__clearNetworkRequests = function() {
    requests.length = 0;
    return true;
  };
  
  // Add a method to restore original implementations
  window.__restoreNetworkInspector = function() {
    window.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXHROpen;
    XMLHttpRequest.prototype.send = originalXHRSend;
    console.log('Network inspector restored to original implementation');
    return true;
  };
  
  console.log('🔍 Network inspector setup complete. Use window.__getNetworkRequests() to see all tracked requests');
  
  return {
    getRequests: () => [...requests],
    clearRequests: () => {
      requests.length = 0;
      return true;
    },
    restore: () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
      return true;
    }
  };
}