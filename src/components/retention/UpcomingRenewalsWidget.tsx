import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { RetentionUnit, getRiskColors, formatCurrency } from "@/types/retention.types";

interface UpcomingRenewalsWidgetProps {
  units: RetentionUnit[];
  selectedId: string | null;
  onSelect: (unit: RetentionUnit) => void;
}

export default function UpcomingRenewalsWidget({ units, selectedId, onSelect }: UpcomingRenewalsWidgetProps) {
  const renewals = units
    .filter(u => u.status === 'occupied' && u.leaseExpiry <= 90)
    .sort((a, b) => a.leaseExpiry - b.leaseExpiry);

  return (
    <div className="p-4" data-testid="upcoming-renewals-widget">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-900">Upcoming Renewals</span>
        <Badge variant="secondary" className="text-xs" data-testid="badge-renewal-count">
          {renewals.length} units
        </Badge>
      </div>
      
      <div className="flex flex-col gap-2">
        {renewals.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4" data-testid="text-no-renewals">
            No renewals in the next 90 days
          </div>
        ) : (
          renewals.map(u => {
            const c = getRiskColors(u.risk, u.status);
            const isSelected = selectedId === u.id;
            const aboveMarket = u.rent > u.marketRent;
            
            return (
              <div
                key={u.id}
                onClick={() => onSelect(u)}
                className={`
                  rounded-lg p-3 cursor-pointer transition-all border hover-elevate
                  ${isSelected 
                    ? `${c.bg} ${c.border}` 
                    : 'bg-white border-gray-100'
                  }
                `}
                data-testid={`renewal-card-${u.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Unit {u.unit} · {u.address.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {u.beds}BR · {formatCurrency(u.rent)}/mo · {u.tenant}
                    </div>
                  </div>
                  <Badge className={`${c.bg} ${c.text} ${c.border} text-[10px] font-bold`}>
                    {u.leaseExpiry}d
                  </Badge>
                </div>
                
                <div className="flex justify-between mt-2">
                  <span className={`text-[10px] flex items-center gap-1 ${aboveMarket ? 'text-red-600' : 'text-green-600'}`}>
                    {aboveMarket 
                      ? `+${formatCurrency(u.rent - u.marketRent)}/mo above market`
                      : <><Check className="h-3 w-3" />At market</>
                    }
                  </span>
                  <span className={`text-[10px] font-semibold ${c.text}`}>
                    {c.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
