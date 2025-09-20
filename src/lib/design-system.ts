/**
 * Enhanced Design System
 * Comprehensive design system addressing visual hierarchy, contrast, and consistency issues
 */

export const designSystem = {
  // Enhanced background system with better contrast and hierarchy
  backgrounds: {
    // Page backgrounds with improved contrast
    hero: "bg-gradient-to-br from-slate-50 via-white to-blue-50/50",
    page: "min-h-screen bg-gradient-to-br from-slate-50 to-white",
    pageDark: "dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
    
    // Card backgrounds with better contrast and unified design
    card: "bg-white border border-slate-200/60 shadow-sm backdrop-blur-sm",
    cardPrimary: "bg-white border border-blue-200/60 shadow-md",
    cardSecondary: "bg-slate-50/50 border border-slate-200/60 shadow-sm",
    cardSuccess: "bg-green-50/50 border border-green-200/60 shadow-sm",
    cardWarning: "bg-amber-50/50 border border-amber-200/60 shadow-sm",
    cardError: "bg-red-50/50 border border-red-200/60 shadow-sm",
    cardDark: "dark:bg-slate-800/90 dark:border-slate-700/60",
    
    // Hover states with consistent elevation
    cardHover: "hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-0.5",
    cardHoverPrimary: "hover:shadow-lg hover:border-blue-300/60 hover:bg-blue-50/30 transition-all duration-300 hover:-translate-y-0.5",
    
    // Section backgrounds with proper separation
    section: "bg-slate-50/30 border-t border-slate-200/60",
    sectionPrimary: "bg-gradient-to-r from-blue-50/40 to-indigo-50/40 border-t border-blue-200/30",
    sectionSecondary: "bg-gradient-to-r from-slate-50/60 to-gray-50/60 border-t border-slate-200/40",
    
    // Overlays and gradients
    overlay: "absolute inset-0 bg-gradient-to-r from-slate-900/5 to-blue-900/5",
    stats: "bg-gradient-to-r from-slate-800 to-slate-900",
    feature: "bg-white border border-slate-200/60"
  },

  // Enhanced typography with clear hierarchy and improved contrast
  typography: {
    // Hero and display text with strong hierarchy
    hero: "text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight",
    heroGradient: "text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight tracking-tight",
    heroSubtitle: "text-xl md:text-2xl text-slate-600 leading-relaxed font-medium",
    
    // Headings with clear hierarchy
    heading1: "text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight",
    heading2: "text-2xl md:text-3xl font-bold text-slate-900 leading-tight tracking-tight",
    heading3: "text-xl md:text-2xl font-bold text-slate-900 leading-tight tracking-tight",
    heading4: "text-lg md:text-xl font-semibold text-slate-900 leading-tight tracking-tight",
    heading5: "text-base md:text-lg font-semibold text-slate-900 leading-tight",
    heading6: "text-sm md:text-base font-semibold text-slate-900 leading-tight",
    
    // Legacy heading styles for backward compatibility
    heading: "text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight",
    headingGradient: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
    subheading: "text-xl text-slate-600 leading-relaxed font-medium",
    subheadingLarge: "text-2xl font-bold text-slate-900",
    
    // Body text with improved contrast
    body: "text-slate-700 leading-relaxed",
    bodyLarge: "text-lg text-slate-700 leading-relaxed",
    bodySmall: "text-sm text-slate-700 leading-relaxed",
    bodyMuted: "text-slate-600 leading-relaxed",
    
    // Labels and captions with better contrast
    label: "text-sm font-medium text-slate-700",
    labelLarge: "text-base font-medium text-slate-700",
    labelSmall: "text-xs font-medium text-slate-700",
    labelMuted: "text-sm font-medium text-slate-600",
    
    // Captions and meta text
    caption: "text-sm text-slate-600",
    captionSmall: "text-xs text-slate-600",
    muted: "text-slate-500",
    
    // Special purpose text
    error: "text-red-700 font-medium",
    success: "text-green-700 font-medium",
    warning: "text-amber-700 font-medium",
    info: "text-blue-700 font-medium",
    
    // Interactive text
    link: "text-blue-600 hover:text-blue-700 font-medium underline-offset-2 hover:underline",
    linkSubtle: "text-slate-700 hover:text-blue-600 transition-colors"
  },

  // Enhanced button system with consistent styling
  buttons: {
    // Primary buttons with strong visual hierarchy
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200",
    primaryLarge: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-8 py-3 text-lg shadow-sm hover:shadow-md transition-all duration-200",
    primarySmall: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 py-2 text-sm shadow-sm hover:shadow-md transition-all duration-200",
    
    // Secondary buttons with proper contrast
    secondary: "bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200",
    secondaryLarge: "bg-white border border-slate-300 text-slate-700 font-medium px-8 py-3 text-lg hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200",
    secondarySmall: "bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 text-sm hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200",
    
    // Outline buttons
    outline: "bg-transparent border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200",
    outlinePrimary: "bg-transparent border border-blue-300 text-blue-600 font-medium hover:bg-blue-50 hover:border-blue-400 transition-all duration-200",
    
    // Ghost buttons
    ghost: "bg-transparent text-slate-700 font-medium hover:bg-slate-100 transition-all duration-200",
    ghostPrimary: "bg-transparent text-blue-600 font-medium hover:bg-blue-50 transition-all duration-200",
    
    // Size variants
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
    
    // State variants
    success: "bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200",
    warning: "bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200",
    error: "bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200",
    
    // Disabled state
    disabled: "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
  },

  // Enhanced animation system
  animations: {
    // Entrance animations
    entrance: "animate-in fade-in slide-in-from-bottom-4 duration-500",
    entranceFast: "animate-in fade-in slide-in-from-bottom-2 duration-300",
    entranceSlow: "animate-in fade-in slide-in-from-bottom-6 duration-700",
    staggered: (index: number) => ({ animationDelay: `${index * 100}ms` }),
    
    // Hover animations with consistent behavior
    hover: "hover:transform hover:scale-[1.02] transition-all duration-300 ease-out",
    hoverCard: "hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out",
    hoverLift: "hover:-translate-y-0.5 transition-transform duration-200 ease-out",
    hoverScale: "hover:scale-105 transition-transform duration-200 ease-out",
    
    // Loading and interactive states
    spin: "border-4 border-blue-600 border-t-transparent rounded-full animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    
    // Smooth transitions
    transition: "transition-all duration-300 ease-out",
    transitionFast: "transition-all duration-200 ease-out",
    transitionSlow: "transition-all duration-500 ease-out"
  },

  // Enhanced layout system with consistent spacing
  layouts: {
    // Container variants
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    containerMedium: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
    containerSmall: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
    containerTight: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8",
    
    // Section spacing with proper hierarchy
    section: "py-16 sm:py-20",
    sectionLarge: "py-20 sm:py-24",
    sectionMedium: "py-12 sm:py-16",
    sectionSmall: "py-8 sm:py-12",
    sectionTight: "py-6 sm:py-8",
    
    // Header and content areas
    header: "pt-20 sm:pt-24",
    headerSmall: "pt-12 sm:pt-16",
    content: "py-8",
    contentSmall: "py-6",
    
    // Grid layouts with consistent gaps
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8",
    gridTwo: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
    gridThree: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8",
    gridFour: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
    gridFive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6",
    gridSix: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6",
    
    // Flex layouts
    flex: "flex flex-col sm:flex-row gap-4 sm:gap-6",
    flexWrap: "flex flex-wrap gap-4 sm:gap-6",
    flexCenter: "flex items-center justify-center",
    flexBetween: "flex items-center justify-between",
    flexStart: "flex items-start justify-start",
    flexEnd: "flex items-end justify-end",
    
    // Stack layouts
    stack: "flex flex-col",
    stackSmall: "flex flex-col space-y-2",
    stackMedium: "flex flex-col space-y-4",
    stackLarge: "flex flex-col space-y-6",
    
    // Legacy support
    center: "flex items-center justify-center",
    between: "flex items-center justify-between"
  },

  // Enhanced spacing system with consistent hierarchy
  spacing: {
    // Vertical spacing for sections
    section: "space-y-8 sm:space-y-12",
    sectionLarge: "space-y-12 sm:space-y-16",
    sectionSmall: "space-y-6 sm:space-y-8",
    
    // Content spacing
    content: "space-y-6",
    contentLarge: "space-y-8",
    contentSmall: "space-y-4",
    
    // Item spacing
    items: "space-y-4",
    itemsLarge: "space-y-6",
    itemsSmall: "space-y-2",
    itemsTight: "space-y-1",
    
    // Gap utilities
    gap: "gap-4",
    gapLarge: "gap-6 sm:gap-8",
    gapMedium: "gap-4 sm:gap-6",
    gapSmall: "gap-2 sm:gap-3",
    gapTight: "gap-1 sm:gap-2",
    
    // Padding utilities with responsive behavior
    padding: "p-6",
    paddingLarge: "p-8 sm:p-12",
    paddingMedium: "p-6 sm:p-8",
    paddingSmall: "p-4 sm:p-6",
    paddingTight: "p-3 sm:p-4",
    
    // Margin utilities
    margin: "mb-8",
    marginLarge: "mb-12 sm:mb-16",
    marginMedium: "mb-8 sm:mb-12",
    marginSmall: "mb-4 sm:mb-6",
    marginTight: "mb-2 sm:mb-4",
    
    // Card padding variants
    cardPadding: "p-6",
    cardPaddingLarge: "p-8",
    cardPaddingSmall: "p-4",
    cardPaddingTight: "p-3"
  },

  // Enhanced color system with better contrast and consistency
  colors: {
    // Primary colors with proper contrast
    primary: "text-blue-600",
    primaryDark: "text-blue-700",
    primaryLight: "text-blue-500",
    primaryMuted: "text-blue-500/70",
    
    // Secondary colors
    secondary: "text-indigo-600",
    secondaryDark: "text-indigo-700",
    secondaryLight: "text-indigo-500",
    secondaryMuted: "text-indigo-500/70",
    
    // Status colors with improved contrast
    success: "text-green-700",
    successLight: "text-green-600",
    successDark: "text-green-800",
    
    warning: "text-amber-700",
    warningLight: "text-amber-600",
    warningDark: "text-amber-800",
    
    error: "text-red-700",
    errorLight: "text-red-600",
    errorDark: "text-red-800",
    
    info: "text-blue-700",
    infoLight: "text-blue-600",
    infoDark: "text-blue-800",
    
    // Neutral colors with proper hierarchy
    text: "text-slate-900",
    textMuted: "text-slate-700",
    textLight: "text-slate-600",
    textLighter: "text-slate-500",
    textSubtle: "text-slate-400",
    
    // Background colors
    background: "bg-white",
    backgroundMuted: "bg-slate-50",
    backgroundSubtle: "bg-slate-100",
    
    // Border colors
    border: "border-slate-200",
    borderMuted: "border-slate-300",
    borderSubtle: "border-slate-100",
    
    // Legacy support
    muted: "text-slate-600",
    mutedForeground: "text-slate-500",
    white: "text-white",
    dark: "text-slate-900"
  },

  // Enhanced icon system with consistent sizing
  icons: {
    tiny: "w-3 h-3",
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-6 h-6",
    xlarge: "w-8 h-8",
    xxlarge: "w-12 h-12",
    hero: "w-16 h-16",
    massive: "w-24 h-24"
  },

  // Border radius system for consistency
  radius: {
    none: "rounded-none",
    small: "rounded-sm",
    medium: "rounded-md",
    large: "rounded-lg",
    xlarge: "rounded-xl",
    full: "rounded-full"
  },

  // Shadow system for consistent elevation
  shadows: {
    none: "shadow-none",
    small: "shadow-sm",
    medium: "shadow-md",
    large: "shadow-lg",
    xlarge: "shadow-xl",
    inner: "shadow-inner"
  },

  // Data visualization colors for charts and graphs
  dataViz: {
    primary: ["#3B82F6", "#1D4ED8", "#1E40AF", "#1E3A8A"],
    success: ["#10B981", "#059669", "#047857", "#065F46"],
    warning: ["#F59E0B", "#D97706", "#B45309", "#92400E"],
    error: ["#EF4444", "#DC2626", "#B91C1C", "#991B1B"],
    neutral: ["#6B7280", "#4B5563", "#374151", "#1F2937"],
    multi: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]
  }
};

// Enhanced utility functions for consistent styling
export const createGradientText = (from: string, to: string) => 
  `text-transparent bg-clip-text bg-gradient-to-r from-${from} to-${to}`;

export const createGradientBackground = (from: string, to: string, opacity?: string) =>
  `bg-gradient-to-r from-${from}${opacity || ''} to-${to}${opacity || ''}`;

// Enhanced card creation with multiple variants
export const createCard = (variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'default', hover: boolean = true) => {
  const baseCard = designSystem.backgrounds.card;
  const hoverEffect = hover ? designSystem.backgrounds.cardHover : '';
  
  switch (variant) {
    case 'primary':
      return `${designSystem.backgrounds.cardPrimary} ${hover ? designSystem.backgrounds.cardHoverPrimary : ''}`;
    case 'secondary':
      return `${designSystem.backgrounds.cardSecondary} ${hoverEffect}`;
    case 'success':
      return `${designSystem.backgrounds.cardSuccess} ${hoverEffect}`;
    case 'warning':
      return `${designSystem.backgrounds.cardWarning} ${hoverEffect}`;
    case 'error':
      return `${designSystem.backgrounds.cardError} ${hoverEffect}`;
    default:
      return `${baseCard} ${hoverEffect}`;
  }
};

// Enhanced section creation with better variants
export const createSection = (variant: 'hero' | 'content' | 'stats' | 'feature' | 'primary' | 'secondary' = 'content') => {
  const base = designSystem.layouts.container + ' ' + designSystem.layouts.section;
  
  switch (variant) {
    case 'hero':
      return `${designSystem.backgrounds.hero} ${base}`;
    case 'stats':
      return `${designSystem.backgrounds.stats} text-white ${base}`;
    case 'feature':
      return `${designSystem.backgrounds.feature} ${base}`;
    case 'primary':
      return `${designSystem.backgrounds.sectionPrimary} ${base}`;
    case 'secondary':
      return `${designSystem.backgrounds.sectionSecondary} ${base}`;
    default:
      return `bg-white ${base}`;
  }
};

// Typography utility functions
export const createHeading = (level: 1 | 2 | 3 | 4 | 5 | 6, className?: string) => {
  const headingClass = designSystem.typography[`heading${level}` as keyof typeof designSystem.typography];
  return className ? `${headingClass} ${className}` : headingClass;
};

// Button utility function
export const createButton = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary', size: 'small' | 'medium' | 'large' = 'medium') => {
  const baseButton = designSystem.buttons[variant];
  const sizeClass = designSystem.buttons[size];
  return `${baseButton} ${sizeClass} ${designSystem.radius.medium}`;
};

// Status badge utility
export const createStatusBadge = (status: 'success' | 'warning' | 'error' | 'info') => {
  const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]}`;
};

// Data visualization color utility
export const getDataVizColor = (index: number, palette: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'multi' = 'multi') => {
  const colors = designSystem.dataViz[palette];
  return colors[index % colors.length];
};

// Responsive spacing utility
export const createResponsiveSpacing = (mobile: string, tablet?: string, desktop?: string) => {
  let classes = mobile;
  if (tablet) classes += ` sm:${tablet}`;
  if (desktop) classes += ` lg:${desktop}`;
  return classes;
};