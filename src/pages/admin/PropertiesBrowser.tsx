/**
 * Properties Browser - View and filter all scraped properties
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalUnits?: number;
  currentOccupancyPercent?: number;
  propertyClass?: 'A' | 'B' | 'C';
  yearBuilt?: number;
  lastScrapedAt?: string;
}

interface GroupedMarket {
  city: string;
  state: string;
  zipCode?: string;
  totalProperties: number;
  totalUnits: number;
  avgOccupancy: number;
}

export default function PropertiesBrowser() {
  const [view, setView] = useState<'list' | 'grouped'>('list');
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    zipCode: '',
    propertyClass: '',
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  // List view query
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['admin-properties-list', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      });
      const res = await fetch(`/api/admin/properties?${params}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
    enabled: view === 'list',
  });

  // Grouped view query
  const { data: groupedData, isLoading: groupedLoading } = useQuery({
    queryKey: ['admin-properties-grouped', filters.state, filters.city],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.state) params.append('state', filters.state);
      if (filters.city) params.append('city', filters.city);
      const res = await fetch(`/api/admin/properties/grouped?${params}`);
      if (!res.ok) throw new Error('Failed to fetch grouped data');
      return res.json();
    },
    enabled: view === 'grouped',
  });

  const isLoading = view === 'list' ? listLoading : groupedLoading;
  const properties = listData?.properties || [];
  const markets = groupedData?.markets || [];
  const totalPages = listData ? Math.ceil(listData.pagination.total / limit) : 1;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Properties Browser</h1>
          <p className="text-gray-600 mt-2">View and manage all scraped properties</p>
        </div>

        {/* View Toggle & Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setView('grouped')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'grouped'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Grouped by Location
              </button>
            </div>

            {/* Filters */}
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
              {view === 'list' && (
                <>
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={filters.zipCode}
                    onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={filters.propertyClass}
                    onChange={(e) => setFilters({ ...filters, propertyClass: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Classes</option>
                    <option value="A">Class A</option>
                    <option value="B">Class B</option>
                    <option value="C">Class C</option>
                  </select>
                </>
              )}
              <button
                onClick={() => setFilters({ city: '', state: '', zipCode: '', propertyClass: '' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {!isLoading && view === 'list' && (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Scraped
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property: Property) => (
                    <tr key={property.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{property.name}</div>
                          <div className="text-sm text-gray-500">{property.address}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {property.city}, {property.state}
                        </div>
                        <div className="text-sm text-gray-500">{property.zipCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.totalUnits || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {property.currentOccupancyPercent ? (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              property.currentOccupancyPercent >= 95
                                ? 'bg-green-100 text-green-800'
                                : property.currentOccupancyPercent >= 90
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {property.currentOccupancyPercent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {property.propertyClass ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            Class {property.propertyClass}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.lastScrapedAt
                          ? new Date(property.lastScrapedAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grouped View */}
        {!isLoading && view === 'grouped' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market: GroupedMarket) => (
              <div key={`${market.city}-${market.state}`} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {market.city}, {market.state}
                  </h3>
                  {market.zipCode && (
                    <p className="text-sm text-gray-500">{market.zipCode}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Properties</span>
                    <span className="text-sm font-medium text-gray-900">
                      {market.totalProperties}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Units</span>
                    <span className="text-sm font-medium text-gray-900">
                      {market.totalUnits}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Occupancy</span>
                    <span className="text-sm font-medium text-gray-900">
                      {market.avgOccupancy.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFilters({ ...filters, city: market.city, state: market.state });
                    setView('list');
                  }}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Properties
                </button>
              </div>
            ))}

            {markets.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No markets found. Try adjusting your filters.
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && view === 'list' && properties.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
