import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error handling for React root creation
const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("React application mounted successfully");
  } catch (error) {
    console.error("Failed to render React application:", error);
    rootElement.innerHTML = `
      <div style="font-family: system-ui, sans-serif; padding: 20px; text-align: center;">
        <h1>Error Loading Application</h1>
        <p>We're experiencing technical difficulties. Please try again later or visit our main site.</p>
        <a href="https://audit.mardenseo.com" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px;">Go to Main Site</a>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
  document.body.innerHTML = `
    <div style="font-family: system-ui, sans-serif; padding: 20px; text-align: center;">
      <h1>Error Loading Application</h1>
      <p>Root element not found. Please visit our main site.</p>
      <a href="https://audit.mardenseo.com" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px;">Go to Main Site</a>
    </div>
  `;
}