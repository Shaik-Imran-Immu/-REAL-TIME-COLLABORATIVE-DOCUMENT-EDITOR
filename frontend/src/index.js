// Import React and ReactDOM to render components into the DOM
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import the main App component

// Get the root element from index.html
const rootElement = document.getElementById('root');

// Make sure the root element exists
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("⚠️ Could not find element with ID 'root' in index.html");
}
