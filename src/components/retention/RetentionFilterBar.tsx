import { Button } from "@/components/ui/button";

export type RetentionFilter = 'All' | 'Critical' | 'At Risk' | 'Healthy' | 'Vacant';

interface RetentionFilterBarProps {
  filter: RetentionFilter;
  onFilterChange: (filter: RetentionFilter) => void;
}

const filters: RetentionFilter[] = ['All', 'Critical', 'At Risk', 'Healthy', 'Vacant'];

export default function RetentionFilterBar({ filter, onFilterChange }: RetentionFilterBarProps) {
  return (
    <div className="p-4">
      <div className="text-sm font-semibold text-gray-900 mb-3">Filters</div>
      <div className="flex flex-wrap gap-1.5">
        {filters.map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(f)}
            data-testid={`filter-${f.toLowerCase().replace(' ', '-')}`}
          >
            {f}
          </Button>
        ))}
      </div>
    </div>
  );
}
