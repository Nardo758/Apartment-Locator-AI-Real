import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure React is available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).React = React;
  console.log('🔧 React version:', React.version);
  console.log('🔧 React available:', typeof React.createContext === 'function');
}

// Add console logs for debugging the startup process
console.log('🚀 Main.tsx: Starting Apartment Locator AI...', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  url: window.location.href,
  nodeEnv: process.env.NODE_ENV
});

// Show a loading message while the app initializes
const rootElement = document.getElementById("root");
if (rootElement) {
  // Add temporary loading content
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: system-ui, -apple-system, sans-serif;
      color: white;
    ">
      <div style="text-align: center;">
        <div style="
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
          Apartment Locator AI
        </h1>
        <p style="margin: 0; opacity: 0.8;">
          Loading your smart apartment hunting platform...
        </p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  console.log('✅ Loading screen displayed');

  // Create the React root and render the app
  try {
    const root = createRoot(rootElement);
    console.log('✅ React root created');
    
    root.render(<App />);
    console.log('✅ App component rendered');
  } catch (error) {
    console.error('❌ Failed to render App:', error);
    
    // Fallback error display
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fee2e2;
        font-family: system-ui, -apple-system, sans-serif;
        color: #dc2626;
      ">
        <div style="text-align: center; max-width: 500px; padding: 20px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">
            Application Error
          </h1>
          <p style="margin: 0 0 16px 0;">
            Failed to start Apartment Locator AI. Please check the browser console for details.
          </p>
          <button onclick="window.location.reload()" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          ">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
} else {
  console.error('❌ Root element not found!');
}
