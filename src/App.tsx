// src/App.tsx - VITE VERSION
import { useState } from 'react';
import { TestIntegration } from '@/components/TestIntegration';
import './App.css';

function App() {
  const [isTesting, setIsTesting] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Apartment Locator AI
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Database Integration Test</h2>
        <TestIntegration />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">Search Filters</h3>
          {/* Filter components will go here */}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h3 className="text-xl font-semibold mb-3">Apartment Results</h3>
          {/* Results components will go here */}
        </div>
      </div>
    </div>
  );
}

export default App;
