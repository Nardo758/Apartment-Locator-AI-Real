import { AlertTriangle, DollarSign, BarChart, CheckCircle } from "lucide-react";
import { RetentionAlert, getSeverityStyles } from "@/types/retention.types";

interface RetentionAlertsSidebarProps {
  alerts: RetentionAlert[];
  onAlertClick?: (alert: RetentionAlert) => void;
}

const iconMap = {
  'alert-triangle': AlertTriangle,
  'dollar-sign': DollarSign,
  'bar-chart': BarChart,
  'check-circle': CheckCircle,
};

export default function RetentionAlertsSidebar({ alerts, onAlertClick }: RetentionAlertsSidebarProps) {
  return (
    <div className="p-4">
      <div className="text-sm font-semibold text-gray-900 mb-3">
        Retention Alerts
      </div>
      
      <div className="flex flex-col gap-2">
        {alerts.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4" data-testid="text-no-alerts">
            No active alerts
          </div>
        ) : (
          alerts.map(a => {
            const s = getSeverityStyles(a.severity);
            const Icon = iconMap[s.iconType];
            return (
              <div
                key={a.id}
                onClick={() => onAlertClick?.(a)}
                className={`
                  rounded-lg p-3 cursor-pointer transition-all hover-elevate overflow-visible
                  ${s.bg} border-2 ${s.border}
                `}
                data-testid={`alert-card-${a.id}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {a.title.split("—")[0]}
                  </span>
                  <span className="text-[9px] text-gray-500">
                    {a.time}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                  {a.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
