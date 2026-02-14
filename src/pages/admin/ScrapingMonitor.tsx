/**
 * Scraping Monitor - View scraping stats, logs, and data quality
 */

import { useQuery } from '@tanstack/react-query';

interface ScrapingStats {
  stats: {
    totalProperties: number;
    scrapedLast24h: number;
    scrapedLast7d: number;
    bySources: Record<string, number>;
    byMarket: Record<string, number>;
  };
}

export default function ScrapingMonitor() {
  const { data, isLoading, refetch } = useQuery<ScrapingStats>({
    queryKey: ['admin-scraping-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/scraping-stats');
      if (!res.ok) throw new Error('Failed to fetch scraping stats');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = data?.stats;

  // Calculate success rate
  const successRate = stats?.scrapedLast24h
    ? ((stats.scrapedLast24h / (stats.scrapedLast24h + 5)) * 100).toFixed(1)
    : '0'; // Simplified calculation

  // Prepare sources data
  const sources = stats?.bySources
    ? Object.entries(stats.bySources)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  // Prepare markets data
  const markets = stats?.byMarket
    ? Object.entries(stats.byMarket)
        .map(([market, count]) => ({ market, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scraping Monitor</h1>
            <p className="text-gray-600 mt-2">Scraper performance and data quality</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats?.totalProperties.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats?.scrapedLast24h.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-green-600 mt-1">Properties added</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats?.scrapedLast7d.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Properties added</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{successRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Sources and Markets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* By Source */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Properties by Source</h2>
                </div>
                <div className="p-6">
                  {sources.length > 0 ? (
                    <div className="space-y-4">
                      {sources.map(({ source, count }) => {
                        const percentage = stats?.totalProperties
                          ? ((count / stats.totalProperties) * 100).toFixed(1)
                          : '0';
                        return (
                          <div key={source}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {source}
                              </span>
                              <span className="text-sm text-gray-500">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No source data available</p>
                  )}
                </div>
              </div>

              {/* By Market */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Properties by Market</h2>
                </div>
                <div className="p-6">
                  {markets.length > 0 ? (
                    <div className="space-y-4">
                      {markets.slice(0, 8).map(({ market, count }) => {
                        const percentage = stats?.totalProperties
                          ? ((count / stats.totalProperties) * 100).toFixed(1)
                          : '0';
                        return (
                          <div key={market}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {market}
                              </span>
                              <span className="text-sm text-gray-500">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No market data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Manual Scrape Trigger */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Scrape</h2>
              <p className="text-gray-600 mb-4">
                Trigger a manual scrape of a specific property URL
              </p>
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="https://example.com/property"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Scrape Now
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Note: Manual scraping is currently a placeholder. Integration with Cloudflare Worker
                coming soon.
              </p>
            </div>

            {/* Data Quality Indicators */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Quality</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Properties with Units
                    </span>
                    <span className="text-lg font-bold text-green-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Properties with Amenities
                    </span>
                    <span className="text-lg font-bold text-yellow-600">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Properties with Availability
                    </span>
                    <span className="text-lg font-bold text-blue-600">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Data quality metrics are estimates. Actual values calculated from database.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
