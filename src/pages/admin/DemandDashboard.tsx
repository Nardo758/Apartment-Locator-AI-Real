/**
 * Demand Dashboard - User demand signals and preferences
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DemandData {
  demand: {
    totalRenters: number;
    leaseExpirationsNext90Days: number;
    avgBudget: number;
    bedroomDemand: Record<string, number>;
    topAmenities: Array<{ preference: string; count: number }>;
  };
  signals: any[];
}

export default function DemandDashboard() {
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    days: '90',
  });

  const { data, isLoading } = useQuery<DemandData>({
    queryKey: ['admin-demand', filters],
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      const res = await fetch(`/api/admin/demand-signals?${params}`);
      if (!res.ok) throw new Error('Failed to fetch demand data');
      return res.json();
    },
  });

  const demandData = data?.demand;
  const signals = data?.signals || [];

  // Prepare bedroom demand chart data
  const bedroomData = demandData?.bedroomDemand
    ? Object.entries(demandData.bedroomDemand).map(([bedrooms, count]) => ({
        bedrooms: bedrooms === 'unknown' ? 'Not specified' : `${bedrooms} BR`,
        count,
      }))
    : [];

  // Prepare amenities chart data
  const amenitiesData = demandData?.topAmenities || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demand Dashboard</h1>
          <p className="text-gray-600 mt-2">
            User preferences, lease expirations, and market demand
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="State"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.days}
              onChange={(e) => setFilters({ ...filters, days: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">Next 30 Days</option>
              <option value="60">Next 60 Days</option>
              <option value="90">Next 90 Days</option>
              <option value="180">Next 180 Days</option>
            </select>
            <button
              onClick={() => setFilters({ city: '', state: '', days: '90' })}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Renters</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {demandData?.totalRenters.toLocaleString() || '0'}
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Lease Expirations
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {demandData?.leaseExpirationsNext90Days.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Next {filters.days} days</p>
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Budget</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${Math.round(demandData?.avgBudget || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Per month</p>
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Searches</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {signals.length.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Tracked signals</p>
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bedroom Demand */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Bedroom Demand
                </h2>
                {bedroomData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bedroomData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bedrooms" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No bedroom preference data available
                  </div>
                )}
              </div>

              {/* Top Amenities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Amenity Preferences
                </h2>
                {amenitiesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={amenitiesData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="preference"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No amenity preference data available
                  </div>
                )}
              </div>
            </div>

            {/* Lease Expiration Timeline (placeholder) */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lease Expiration Timeline
              </h2>
              <div className="flex items-center justify-center h-48 text-gray-400">
                <div className="text-center">
                  <svg
                    className="h-16 w-16 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Timeline visualization coming soon</p>
                </div>
              </div>
            </div>

            {/* Recent Demand Signals Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Demand Signals
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bedrooms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lease Expiration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Top Preferences
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {signals.slice(0, 10).map((signal: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {signal.propertyRequirements?.bedrooms || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${signal.budget?.min || 0} - ${signal.budget?.max || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {signal.locationPreferences?.preferredCities?.[0] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {signal.leaseExpiration
                            ? new Date(signal.leaseExpiration).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-wrap gap-1">
                            {Object.keys(signal.apartmentPreferences || {})
                              .filter((key) => signal.apartmentPreferences[key] === true)
                              .slice(0, 3)
                              .map((pref) => (
                                <span
                                  key={pref}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {pref}
                                </span>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {signals.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <svg
                    className="h-16 w-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p>No demand signals found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
