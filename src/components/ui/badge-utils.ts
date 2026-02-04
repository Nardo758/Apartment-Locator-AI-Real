import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border-white/20 bg-white/10 text-white/80",
        primary:
          "border-purple-500/30 bg-purple-500/20 text-purple-300",
        secondary:
          "border-blue-500/30 bg-blue-500/20 text-blue-300",
        success:
          "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
        warning:
          "border-amber-500/30 bg-amber-500/20 text-amber-300",
        error:
          "border-red-500/30 bg-red-500/20 text-red-300",
        destructive:
          "border-red-500/30 bg-red-500/20 text-red-300",
        outline: "border-white/20 bg-transparent text-white/70",
        "opportunity-high": "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
        "opportunity-medium": "border-amber-500/30 bg-amber-500/20 text-amber-300",
        "opportunity-low": "border-slate-500/30 bg-slate-500/20 text-slate-300",
        "leverage-excellent": "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
        "leverage-good": "border-blue-500/30 bg-blue-500/20 text-blue-300",
        "leverage-poor": "border-red-500/30 bg-red-500/20 text-red-300",
        "severity-critical": "border-red-500/30 bg-red-500/20 text-red-300",
        "severity-warning": "border-amber-500/30 bg-amber-500/20 text-amber-300",
        "severity-info": "border-blue-500/30 bg-blue-500/20 text-blue-300",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
