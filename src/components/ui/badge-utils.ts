import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        "opportunity-high": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        "opportunity-medium": "border-amber-500/30 bg-amber-500/10 text-amber-400",
        "opportunity-low": "border-slate-500/30 bg-slate-500/10 text-slate-400",
        "leverage-excellent": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        "leverage-good": "border-blue-500/30 bg-blue-500/10 text-blue-400",
        "leverage-poor": "border-red-500/30 bg-red-500/10 text-red-400",
        "severity-critical": "border-red-500/30 bg-red-500/10 text-red-400",
        "severity-warning": "border-amber-500/30 bg-amber-500/10 text-amber-400",
        "severity-info": "border-blue-500/30 bg-blue-500/10 text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
