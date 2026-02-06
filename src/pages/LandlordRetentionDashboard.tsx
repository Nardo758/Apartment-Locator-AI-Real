import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Map, List, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { authFetchJson } from "@/lib/authHelpers";

import RetentionHealthBar from "@/components/retention/RetentionHealthBar";
import PortfolioHealthWidget from "@/components/retention/PortfolioHealthWidget";
import UpcomingRenewalsWidget from "@/components/retention/UpcomingRenewalsWidget";
import RetentionAlertsSidebar from "@/components/retention/RetentionAlertsSidebar";
import RetentionFilterBar, { RetentionFilter } from "@/components/retention/RetentionFilterBar";
import RetentionMapView from "@/components/retention/RetentionMapView";
import RetentionDetailCard from "@/components/retention/RetentionDetailCard";
import { RetentionUnit, NearbyComparable, RetentionAlert, PortfolioHealth, RetentionMetrics } from "@/types/retention.types";

interface LandlordProperty {
  id: string;
  address: string;
  unitNumber?: string | null;
  bedroomsMin?: number | null;
  bedroomsMax?: number | null;
  bathroomsMin?: number | string | null;
  bathroomsMax?: number | string | null;
  squareFeetMin?: number | null;
  squareFeetMax?: number | null;
  actualRent?: number | string | null;
  targetRent?: number | string | null;
  marketRent?: number | string | null;
  occupancyStatus?: string | null;
  retentionRiskScore?: number | null;
  daysVacant?: number | null;
  leaseEndDate?: string | null;
  tenantName?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  riskFactors?: Array<{ name: string; score: number; detail: string; impact?: 'low' | 'medium' | 'high' }> | null;
}

interface PricingAlert {
  id: string;
  alertType: string;
  severity?: string | null;
  title: string;
  message: string;
  createdAt?: string | null;
  propertyId?: string | null;
}

const MOCK_UNITS: RetentionUnit[] = [
  { id: "1", address: "1234 Main St", unit: "2A", beds: 2, baths: 2, sqft: 1100, rent: 2200, marketRent: 2050, status: "occupied", risk: 82, leaseExpiry: 18, daysVacant: 0, lat: 30.2672, lng: -97.7431, tenant: "M. Johnson", factors: [{ name: "Price vs Market", score: 35, detail: "+$150/mo (7.3% above)" }, { name: "Lease Expiring", score: 30, detail: "18 days remaining" }, { name: "No Pet Policy", score: 17, detail: "75% of market allows pets" }] },
  { id: "2", address: "1234 Main St", unit: "3B", beds: 1, baths: 1, sqft: 750, rent: 1650, marketRent: 1625, status: "occupied", risk: 22, leaseExpiry: 195, daysVacant: 0, lat: 30.2675, lng: -97.7435, tenant: "S. Williams", factors: [{ name: "Price vs Market", score: 8, detail: "+$25/mo (1.5% above)" }, { name: "Lease Proximity", score: 5, detail: "195 days remaining" }, { name: "Well Maintained", score: 9, detail: "0 requests in 90 days" }] },
  { id: "3", address: "567 Oak Ave", unit: "1A", beds: 2, baths: 1, sqft: 950, rent: 1800, marketRent: 1825, status: "occupied", risk: 45, leaseExpiry: 42, daysVacant: 0, lat: 30.2812, lng: -97.7255, tenant: "R. Chen", factors: [{ name: "Price vs Market", score: 5, detail: "-$25/mo (below market ✓)" }, { name: "Lease Expiring", score: 22, detail: "42 days remaining" }, { name: "Amenity Gap", score: 18, detail: "No in-unit laundry" }] },
  { id: "4", address: "567 Oak Ave", unit: "2B", beds: 3, baths: 2, sqft: 1350, rent: 2400, marketRent: 2150, status: "occupied", risk: 71, leaseExpiry: 28, daysVacant: 0, lat: 30.2815, lng: -97.7260, tenant: "A. Patel", factors: [{ name: "Price vs Market", score: 32, detail: "+$250/mo (11.6% above)" }, { name: "Lease Expiring", score: 25, detail: "28 days remaining" }, { name: "Maintenance Issues", score: 14, detail: "4 requests in 90 days" }] },
  { id: "5", address: "890 Elm St", unit: "1C", beds: 1, baths: 1, sqft: 680, rent: 0, marketRent: 1450, status: "vacant", risk: 95, leaseExpiry: 0, daysVacant: 45, lat: 30.2550, lng: -97.7520, tenant: null, factors: [{ name: "Days Vacant", score: 45, detail: "45 days — $2,175 lost rent" }, { name: "Above Market", score: 30, detail: "Was listed at $1,650 (14% above)" }, { name: "No Concession", score: 20, detail: "42% of nearby units offer concessions" }] },
  { id: "6", address: "890 Elm St", unit: "2A", beds: 2, baths: 1, sqft: 900, rent: 1750, marketRent: 1780, status: "occupied", risk: 18, leaseExpiry: 220, daysVacant: 0, lat: 30.2555, lng: -97.7525, tenant: "K. Lee", factors: [{ name: "Price vs Market", score: 3, detail: "-$30/mo (below market ✓)" }, { name: "Lease Proximity", score: 4, detail: "220 days remaining" }, { name: "Happy Tenant", score: 11, detail: "Renewed once already" }] },
  { id: "7", address: "2468 Riverside Dr", unit: "A", beds: 2, baths: 2, sqft: 1050, rent: 0, marketRent: 1900, status: "vacant", risk: 88, leaseExpiry: 0, daysVacant: 32, lat: 30.2450, lng: -97.7380, tenant: null, factors: [{ name: "Days Vacant", score: 38, detail: "32 days — $2,027 lost rent" }, { name: "Priced High", score: 28, detail: "Listed at $2,100 (11% above)" }, { name: "Low Foot Traffic", score: 22, detail: "2 showings in 30 days" }] },
  { id: "8", address: "2468 Riverside Dr", unit: "B", beds: 1, baths: 1, sqft: 620, rent: 1400, marketRent: 1380, status: "occupied", risk: 12, leaseExpiry: 310, daysVacant: 0, lat: 30.2455, lng: -97.7385, tenant: "J. Torres", factors: [{ name: "Price vs Market", score: 4, detail: "+$20/mo (1.4% above)" }, { name: "Lease Proximity", score: 2, detail: "310 days remaining" }, { name: "Low Risk", score: 6, detail: "Long-term tenant, no issues" }] },
];

const MOCK_NEARBY: NearbyComparable[] = [
  { id: "n1", name: "Riverside Apts #204", rent: 1950, beds: 2, concession: "1 mo free", lat: 30.2700, lng: -97.7350 },
  { id: "n2", name: "Downtown Towers #8B", rent: 2100, beds: 2, concession: "$500 off", lat: 30.2620, lng: -97.7480 },
  { id: "n3", name: "Urban Living #3F", rent: 2250, beds: 2, concession: null, lat: 30.2780, lng: -97.7300 },
  { id: "n4", name: "Cedar Park Apts #1A", rent: 1680, beds: 1, concession: "Waived fee", lat: 30.2500, lng: -97.7600 },
  { id: "n5", name: "Parkview #5C", rent: 1775, beds: 2, concession: "Free parking", lat: 30.2850, lng: -97.7200 },
  { id: "n6", name: "The Granary #2B", rent: 1520, beds: 1, concession: null, lat: 30.2400, lng: -97.7550 },
];

const MOCK_ALERTS: RetentionAlert[] = [
  { id: "1", type: "renewal", severity: "critical", title: "Lease Expiring — Unit 2A, 1234 Main St", message: "18 days left. Unit is $150/mo above market. High churn risk.", time: "2h ago" },
  { id: "2", type: "vacancy", severity: "warning", title: "Vacancy Cost Rising — Unit 1C, 890 Elm St", message: "45 days vacant. $2,175 lost so far. Comparable units filling in 12 days with concessions.", time: "6h ago" },
  { id: "3", type: "market", severity: "info", title: "Market Shift — Riverside District", message: "3 nearby properties now offering move-in concessions. Your vacant unit may need a competitive offer.", time: "1d ago" },
  { id: "4", type: "win", severity: "success", title: "Retention Win! — Unit 2A, 890 Elm St", message: "Tenant K. Lee renewed. Estimated savings vs. vacancy: $4,200.", time: "3d ago" },
];

export default function LandlordRetentionDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [selectedUnit, setSelectedUnit] = useState<RetentionUnit | null>(null);
  const [filter, setFilter] = useState<RetentionFilter>("All");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [sortBy, setSortBy] = useState<string>("risk");
  const [units, setUnits] = useState<RetentionUnit[]>([]);
  const [alerts, setAlerts] = useState<RetentionAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = 'Landlord Dashboard | Apartment Locator AI';
  }, []);

  const toNumber = (value: unknown, fallback = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  const daysUntil = (dateString?: string | null) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 0;
    const diffMs = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const formatRelativeTime = (dateString?: string | null) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Recently';
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US');
  };

  useEffect(() => {
    const loadRetentionData = async () => {
      setIsLoading(true);
      setLoadError(null);

      const [propertiesResult, alertsResult] = await Promise.all([
        authFetchJson<{ properties: LandlordProperty[] }>('/api/landlord/properties'),
        authFetchJson<{ alerts: PricingAlert[] }>('/api/alerts'),
      ]);

      if (propertiesResult.success) {
        const mappedUnits = propertiesResult.data.properties.map((property) => {
          const beds = property.bedroomsMin ?? property.bedroomsMax ?? 0;
          const baths = toNumber(property.bathroomsMin ?? property.bathroomsMax, 0);
          const sqft = property.squareFeetMin ?? property.squareFeetMax ?? 0;
          const rent = toNumber(property.actualRent ?? property.targetRent, 0);
          const marketRent = toNumber(property.marketRent, rent);
          const status: 'occupied' | 'vacant' = property.occupancyStatus === 'vacant' ? 'vacant' : 'occupied';
          const risk = property.retentionRiskScore ?? 0;
          const lat = toNumber(property.latitude, 30.2672);
          const lng = toNumber(property.longitude, -97.7431);

          return {
            id: property.id,
            address: property.address,
            unit: property.unitNumber || '—',
            beds,
            baths,
            sqft,
            rent,
            marketRent,
            status,
            risk,
            leaseExpiry: daysUntil(property.leaseEndDate),
            daysVacant: property.daysVacant ?? 0,
            lat,
            lng,
            tenant: property.tenantName ?? null,
            factors: Array.isArray(property.riskFactors) ? property.riskFactors : [],
          };
        });

        setUnits(mappedUnits);
      } else {
        setLoadError(propertiesResult.error);
        setUnits(MOCK_UNITS);
      }

      if (alertsResult.success) {
        const mappedAlerts = alertsResult.data.alerts.map((alert) => {
          const typeMap: Record<string, RetentionAlert['type']> = {
            vacancy_risk: 'vacancy',
            market_trend: 'market',
            price_change: 'renewal',
            concession: 'market',
          };

          const severityMap: Record<string, RetentionAlert['severity']> = {
            critical: 'critical',
            warning: 'warning',
            info: 'info',
          };

          return {
            id: alert.id,
            type: typeMap[alert.alertType] || 'market',
            severity: severityMap[alert.severity || 'info'] || 'info',
            title: alert.title,
            message: alert.message,
            time: formatRelativeTime(alert.createdAt),
            propertyId: alert.propertyId ?? undefined,
          };
        });

        setAlerts(mappedAlerts);
      } else {
        if (!propertiesResult.success) {
          setLoadError(propertiesResult.error);
        } else {
          setLoadError(alertsResult.error);
        }
        setAlerts(MOCK_ALERTS);
      }

      setIsLoading(false);
    };

    loadRetentionData();
  }, []);

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      if (filter === "All") return true;
      if (filter === "Vacant") return u.status === "vacant";
      if (filter === "Critical") return u.status === "occupied" && u.risk >= 70;
      if (filter === "At Risk") return u.status === "occupied" && u.risk >= 40 && u.risk < 70;
      if (filter === "Healthy") return u.status === "occupied" && u.risk < 40;
      return true;
    }).sort((a, b) => {
      if (sortBy === "risk") return b.risk - a.risk;
      if (sortBy === "lease") return a.leaseExpiry - b.leaseExpiry;
      if (sortBy === "rent") return b.rent - a.rent;
      return 0;
    });
  }, [filter, sortBy, units]);

  const portfolioHealth: PortfolioHealth = useMemo(() => {
    const occupied = units.filter(u => u.status === "occupied").length;
    const vacant = units.filter(u => u.status === "vacant").length;
    const atRisk = units.filter(u => u.status === "occupied" && u.risk >= 40).length;
    const vacancyCost = units.filter(u => u.status === "vacant").reduce((sum, u) => sum + (u.daysVacant * (u.marketRent / 30)), 0);
    const retentionRate = occupied > 0 ? Math.round(((occupied - atRisk) / occupied) * 100) : 0;
    
    return {
      retentionRate,
      marketRetentionRate: 78,
      totalUnits: units.length,
      occupiedUnits: occupied,
      vacantUnits: vacant,
      atRiskUnits: atRisk,
      vacancyCostThisMonth: Math.round(vacancyCost),
      avgTurnoverCost: 4200,
      renewalsDue90Days: units.filter(u => u.status === "occupied" && u.leaseExpiry <= 90).length,
    };
  }, [units]);

  const metrics: RetentionMetrics = {
    portfolioRetention: portfolioHealth.retentionRate,
    marketRetention: 78,
    unitsAtRisk: portfolioHealth.atRiskUnits,
    totalUnits: portfolioHealth.totalUnits,
    vacancyCostPerMonth: portfolioHealth.vacancyCostThisMonth,
    vacantUnits: portfolioHealth.vacantUnits,
    renewalsDue: portfolioHealth.renewalsDue90Days,
    aiInsight: portfolioHealth.atRiskUnits > 0
      ? `${portfolioHealth.atRiskUnits} units at risk — prioritize renewals and pricing adjustments.`
      : "Portfolio is stable — keep monitoring upcoming renewals.",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" data-testid="landlord-retention-dashboard">
      <header className="flex justify-between items-center px-5 py-3 bg-white border-b border-gray-200 shadow-sm" data-testid="dashboard-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900">ApartmentIQ</span>
            <span className="text-xs text-gray-500" data-testid="landlord-dashboard-label">
              Landlord Dashboard
            </span>
          </div>
          <span className="text-[10px] font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full ml-1">
            LANDLORD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/landlord/settings')}
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 border-2 border-indigo-300" data-testid="user-avatar">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'LP'}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-red-600"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <RetentionHealthBar market="Austin, TX" metrics={metrics} />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0">
          {loadError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border-b border-red-200">
              Failed to load live data: {loadError}
            </div>
          )}
          {isLoading && (
            <div className="p-3 text-xs text-gray-500 border-b border-gray-200">
              Loading portfolio data...
            </div>
          )}
          <PortfolioHealthWidget health={portfolioHealth} />
          <div className="border-t border-gray-200">
            <RetentionFilterBar filter={filter} onFilterChange={setFilter} />
          </div>
          <div className="border-t border-gray-200 flex-1">
            <UpcomingRenewalsWidget 
              units={units} 
              selectedId={selectedUnit?.id || null}
              onSelect={setSelectedUnit} 
            />
          </div>
          <div className="border-t border-gray-200">
            <RetentionAlertsSidebar alerts={alerts} />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <div className="flex gap-1">
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                data-testid="button-view-map"
              >
                <Map className="h-4 w-4 mr-1" />
                Map
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500" data-testid="text-unit-count">
                Showing {filteredUnits.length} of {units.length} units
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] text-xs" data-testid="select-sort-trigger">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk" data-testid="select-sort-risk">Sort: Retention Risk</SelectItem>
                  <SelectItem value="lease" data-testid="select-sort-lease">Sort: Lease Expiry</SelectItem>
                  <SelectItem value="rent" data-testid="select-sort-rent">Sort: Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 ${selectedUnit ? 'w-1/2' : 'w-full'}`}>
              {viewMode === "map" ? (
                <RetentionMapView
                  units={filteredUnits}
                  nearbyComparables={MOCK_NEARBY}
                  selectedId={selectedUnit?.id || null}
                  onSelect={setSelectedUnit}
                />
              ) : (
                <div className="h-full overflow-y-auto p-4 bg-gray-50">
                  <div className="space-y-2">
                    {filteredUnits.map(u => {
                      const riskColor = u.status === 'vacant' ? 'gray' : 
                        u.risk >= 70 ? 'red' : u.risk >= 40 ? 'amber' : 'green';
                      const bgColors = {
                        gray: 'bg-gray-50 border-gray-300',
                        red: 'bg-red-50 border-red-300',
                        amber: 'bg-amber-50 border-amber-300',
                        green: 'bg-green-50 border-green-300',
                      };
                      const textColors = {
                        gray: 'text-gray-700',
                        red: 'text-red-700',
                        amber: 'text-amber-700',
                        green: 'text-green-700',
                      };
                      return (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUnit(u)}
                          className={`
                            p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedUnit?.id === u.id ? bgColors[riskColor] : 'bg-white border-gray-100 hover:border-gray-200'}
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-gray-900">
                                Unit {u.unit} · {u.address}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">
                                {u.beds}BR/{u.baths}BA · {u.sqft} sqft · 
                                {u.status === 'occupied' 
                                  ? ` ${u.tenant} · ${u.leaseExpiry}d until renewal`
                                  : ` Vacant ${u.daysVacant} days`
                                }
                              </div>
                            </div>
                            <div className={`text-sm font-bold ${textColors[riskColor]}`}>
                              {u.status === 'vacant' ? 'VACANT' : `Risk: ${u.risk}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {selectedUnit && (
              <div className="w-1/2 border-l border-gray-200 overflow-hidden">
                <RetentionDetailCard 
                  unit={selectedUnit} 
                  onClose={() => setSelectedUnit(null)} 
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
