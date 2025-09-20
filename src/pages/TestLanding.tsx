import React from 'react';

const TestLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Apartment Locator AI
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Smart apartment hunting with AI-powered insights
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">✅ App is Loading</h2>
            <p>If you can see this, the React app is working correctly.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-2">🚀 Features</h2>
            <ul className="text-left text-green-700 space-y-1">
              <li>• Market Intelligence Hub</li>
              <li>• Rent vs Buy Analysis</li>
              <li>• AI-Powered Recommendations</li>
              <li>• Real-time Market Data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLanding;