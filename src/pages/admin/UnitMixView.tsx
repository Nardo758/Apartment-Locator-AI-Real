/**
 * Unit Mix View - Breakdown of units by type across properties
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface UnitMixData {
  unitType: string;
  count: number;
  available: number;
  avgRent: number;
  occupancyRate: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function UnitMixView() {
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    zipCode: '',
    unitType: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-unit-mix', filters],
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      const res = await fetch(`/api/admin/units?${params}`);
      if (!res.ok) throw new Error('Failed to fetch unit mix');
      return res.json();
    },
  });

  const unitMix: UnitMixData[] = data?.unitMix || [];
  const total = data?.total || 0;

  // Prepare chart data
  const pieData = unitMix.map((unit) => ({
    name: unit.unitType,
    value: unit.count,
  }));

  const barData = unitMix.map((unit) => ({
    unitType: unit.unitType,
    avgRent: unit.avgRent,
    available: unit.available,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Unit Mix Analysis</h1>
          <p className="text-gray-600 mt-2">
            Breakdown of units by type across all properties
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
            <input
              type="text"
              placeholder="Zip Code"
              value={filters.zipCode}
              onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.unitType}
              onChange={(e) => setFilters({ ...filters, unitType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Unit Types</option>
              <option value="studio">Studio</option>
              <option value="1br">1 Bedroom</option>
              <option value="2br">2 Bedroom</option>
              <option value="3br">3 Bedroom</option>
              <option value="4br+">4+ Bedroom</option>
            </select>
            <button
              onClick={() => setFilters({ city: '', state: '', zipCode: '', unitType: '' })}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {total.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Unit Types</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{unitMix.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Avg Availability</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {unitMix.length > 0
                    ? (
                        (unitMix.reduce((sum, u) => sum + u.available, 0) / total) *
                        100
                      ).toFixed(1)
                    : '0'}
                  %
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Avg Rent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  $
                  {unitMix.length > 0
                    ? Math.round(
                        unitMix.reduce((sum, u) => sum + u.avgRent, 0) / unitMix.length
                      ).toLocaleString()
                    : '0'}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pie Chart - Unit Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Unit Distribution
                </h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>

              {/* Bar Chart - Avg Rent by Type */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Average Rent by Type
                </h2>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="unitType" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgRent" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Detailed Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Units
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupancy Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Rent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unitMix.map((unit) => (
                      <tr key={unit.unitType}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {unit.unitType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {unit.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {unit.available.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              parseFloat(unit.occupancyRate) >= 95
                                ? 'bg-green-100 text-green-800'
                                : parseFloat(unit.occupancyRate) >= 90
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {unit.occupancyRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${unit.avgRent.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {unitMix.length === 0 && (
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <p>No unit data found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
