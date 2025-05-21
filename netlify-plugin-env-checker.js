// netlify-plugin-env-checker.js
module.exports = {
  onPreBuild: ({ utils }) => {
    // Check for essential environment variables
    const requiredVars = [
      'VITE_API_URL',
      'VITE_API_FALLBACK_URL'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('\n⚠️ WARNING: Missing required environment variables:');
      missingVars.forEach(varName => {
        console.warn(`  - ${varName}`);
      });
      console.warn('\nUsing default values for these variables...\n');
      
      // We're not failing the build, just warning
    }
    
    // Log the state of important environment variables (masked for security)
    console.log('\n✅ Environment configuration:');
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      console.log(`  - ${varName}: ${value ? '********' : 'not set (using default)'}`);
    });
    console.log('');
    
    // Create a temp file in public directory that will show environment variable status
    const envStatus = {
      buildTime: new Date().toISOString(),
      variables: requiredVars.map(varName => ({
        name: varName,
        set: !!process.env[varName]
      }))
    };
    
    try {
      utils.status.show({
        title: 'Environment Variables Status',
        summary: missingVars.length === 0 
          ? 'All required environment variables are set!' 
          : `Missing ${missingVars.length} required environment variables.`,
        text: missingVars.length === 0 
          ? 'Deployment will use properly configured environment variables.'
          : 'Deployment will fall back to default values, which may not work correctly.'
      });
    } catch (error) {
      console.error('Error showing status:', error);
    }
  }
};
