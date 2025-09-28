import React from 'react';
import { MarketIntelligenceDashboard } from '@/components/MarketIntelligenceDashboard';
import { PropertySearchExample } from '@/components/PropertySearchExample';
import Header from '@/components/Header';

const ComponentDemo: React.FC = () => {
  const handlePropertySearch = (data: { location: string; currentRent: number; propertyValue: number }) => {
    console.log('Property search data:', data);
    // Handle the search data as needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            📱 Component Integration Demo
          </h1>
          <p className="text-muted-foreground">
            Example implementation of MarketIntelligenceDashboard and PropertySearchExample components
          </p>
        </div>

        <div className="space-y-12">
          {/* Market Intelligence Dashboard */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Market Intelligence Dashboard
            </h2>
            <MarketIntelligenceDashboard defaultLocation="Austin, TX" />
          </section>

          {/* Property Search Example */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Property Search Example
            </h2>
            <PropertySearchExample onSearch={handlePropertySearch} />
          </section>

          {/* Integration Code Examples */}
          <section className="mt-16">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Integration Examples
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Import Example */}
              <div className="bg-slate-900 rounded-lg p-6 text-green-400 font-mono text-sm overflow-x-auto">
                <div className="text-slate-400 mb-2">// Import the components</div>
                <div className="text-blue-300">import</div> {`{ MarketIntelligenceDashboard }`} <div className="text-blue-300">from</div> <div className="text-yellow-300">'./components/MarketIntelligenceDashboard'</div><br />
                <div className="text-blue-300">import</div> {`{ PropertySearchExample }`} <div className="text-blue-300">from</div> <div className="text-yellow-300">'./components/PropertySearchExample'</div>
              </div>

              {/* Usage Example */}
              <div className="bg-slate-900 rounded-lg p-6 text-green-400 font-mono text-sm overflow-x-auto">
                <div className="text-slate-400 mb-2">// Use anywhere in your app</div>
                <div className="text-red-400">&lt;MarketIntelligenceDashboard</div> <div className="text-yellow-300">defaultLocation</div>=<div className="text-green-300">"Austin, TX"</div> <div className="text-red-400">/&gt;</div><br />
                <div className="text-red-400">&lt;PropertySearchExample</div> <div className="text-red-400">/&gt;</div>
              </div>
            </div>

            {/* Props Documentation */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-foreground">MarketIntelligenceDashboard Props</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">defaultLocation?</span> - string (default: "Austin, TX")</div>
                  <div><span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">className?</span> - string (optional styling)</div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-foreground">PropertySearchExample Props</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">className?</span> - string (optional styling)</div>
                  <div><span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">onSearch?</span> - function callback for search results</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ComponentDemo;