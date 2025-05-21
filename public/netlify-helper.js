function directNetlifyDeploy() {
  const spinner = document.createElement('div');
  spinner.className = 'netlify-drop-spinner';
  spinner.innerHTML = 'Uploading to Netlify...';
  document.body.appendChild(spinner);

  // Open Netlify Drop in a new tab
  window.open('https://app.netlify.com/drop', '_blank');
  
  // Instructions
  const instructions = document.createElement('div');
  instructions.className = 'netlify-drop-instructions';
  instructions.innerHTML = `
    <h3>Deploy to Netlify:</h3>
    <ol>
      <li>When Netlify Drop opens, drag the entire "dist" folder from your file explorer</li>
      <li>Wait for the upload to complete (should take less than a minute)</li>
      <li>Your site will be deployed automatically</li>
      <li>You can update your custom domain in the Netlify dashboard</li>
    </ol>
  `;
  document.body.appendChild(instructions);

  // Add some styling
  const style = document.createElement('style');
  style.textContent = `
    .netlify-drop-spinner {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 9999;
    }
    .netlify-drop-instructions {
      position: fixed;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 10px;
      z-index: 9999;
      max-width: 600px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
}
