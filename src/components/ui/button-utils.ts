import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 hover:-translate-y-0.5",
        outline:
          "border-2 border-white/20 bg-white/5 text-white rounded-xl backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5",
        secondary:
          "bg-white/5 border border-white/20 text-white rounded-xl backdrop-blur-sm hover:bg-white/10 hover:border-white/40",
        ghost: "text-white/80 rounded-lg hover:bg-white/5 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        "gradient-primary": "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5",
        "gradient-secondary": "bg-gradient-to-r from-[#4ecdc4] to-[#44a08d] text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5",
        "hero": "bg-white/5 text-white border-2 border-white/20 rounded-xl backdrop-blur-sm hover:bg-white/10 hover:border-white/40",
        "premium": "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5",
        "glass": "bg-white/5 text-white border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/8 hover:border-purple-500/30",
        "danger": "bg-red-500 text-white rounded-xl hover:bg-red-600 hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-3 text-base rounded-xl",
        sm: "h-9 px-4 py-2 text-sm rounded-lg",
        lg: "h-14 px-8 py-4 text-lg rounded-xl",
        xl: "h-16 px-10 py-5 text-xl rounded-xl",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
