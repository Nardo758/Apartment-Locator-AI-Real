/**
 * Modern Design System
 * Extracted from upgraded Landing and Market Intel pages
 */

export const designSystem = {
  // Background patterns from upgraded pages
  backgrounds: {
    hero: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
    page: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
    pageDark: "dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900",
    card: "border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg",
    cardHover: "hover:shadow-xl transition-all duration-300",
    section: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    overlay: "absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10",
    stats: "bg-gradient-to-r from-blue-600 to-purple-600",
    feature: "bg-gradient-to-br from-gray-50 to-gray-100"
  },

  // Typography scales from upgraded pages
  typography: {
    hero: "text-4xl md:text-6xl font-bold text-gray-900 leading-tight",
    heroGradient: "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600",
    heading: "text-3xl md:text-4xl font-bold text-gray-900 mb-4",
    headingGradient: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
    subheading: "text-xl text-gray-600 leading-relaxed",
    subheadingLarge: "text-2xl font-bold text-gray-900",
    body: "text-gray-600 leading-relaxed",
    bodyLarge: "text-lg text-gray-600",
    label: "text-sm text-muted-foreground",
    labelSmall: "text-xs text-muted-foreground",
    caption: "text-sm text-gray-500",
    muted: "text-muted-foreground"
  },

  // Button styles from upgraded pages
  buttons: {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg",
    secondary: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    outline: "variant-outline",
    small: "size-sm gap-2",
    large: "size-lg px-8 py-3 text-lg"
  },

  // Animation patterns from upgraded pages
  animations: {
    entrance: "animate-in fade-in slide-in-from-bottom-4 duration-500",
    staggered: (index: number) => ({ animationDelay: `${index * 100}ms` }),
    hover: "hover:transform hover:scale-105 transition-all duration-300",
    hoverCard: "hover:shadow-xl transition-all duration-300",
    hoverLift: "hover:-translate-y-0.5",
    spin: "border-4 border-blue-600 border-t-transparent rounded-full animate-spin",
    transition: "transition-all duration-300"
  },

  // Layout patterns from upgraded pages
  layouts: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    containerSmall: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-20",
    sectionSmall: "py-8",
    header: "pt-24",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
    gridTwo: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
    gridThree: "grid grid-cols-1 lg:grid-cols-3 gap-6",
    gridFour: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
    flex: "flex flex-col sm:flex-row gap-4",
    center: "flex items-center justify-center",
    between: "flex items-center justify-between"
  },

  // Spacing patterns from upgraded pages
  spacing: {
    section: "space-y-8",
    content: "space-y-6",
    items: "space-y-4",
    small: "space-y-2",
    gap: "gap-4",
    gapLarge: "gap-8",
    gapSmall: "gap-2",
    padding: "p-6",
    paddingLarge: "p-8 lg:p-12",
    paddingSmall: "p-4",
    margin: "mb-8",
    marginLarge: "mb-16",
    marginSmall: "mb-4"
  },

  // Color system from upgraded pages
  colors: {
    primary: "text-blue-600",
    secondary: "text-purple-600",
    success: "text-green-600",
    warning: "text-orange-600",
    error: "text-red-600",
    muted: "text-gray-600",
    mutedForeground: "text-muted-foreground",
    white: "text-white",
    dark: "text-gray-900"
  },

  // Icon sizes from upgraded pages
  icons: {
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-8 h-8",
    xlarge: "w-12 h-12",
    hero: "w-16 h-16"
  }
};

// Utility functions for consistent styling
export const createGradientText = (from: string, to: string) => 
  `text-transparent bg-clip-text bg-gradient-to-r from-${from} to-${to}`;

export const createGradientBackground = (from: string, to: string, opacity?: string) =>
  `bg-gradient-to-r from-${from}${opacity || ''} to-${to}${opacity || ''}`;

export const createCard = (hover: boolean = true) =>
  `${designSystem.backgrounds.card} ${hover ? designSystem.backgrounds.cardHover : ''}`;

export const createSection = (variant: 'hero' | 'content' | 'stats' | 'feature' = 'content') => {
  const base = designSystem.layouts.container + ' ' + designSystem.layouts.section;
  
  switch (variant) {
    case 'hero':
      return `${designSystem.backgrounds.hero} ${base}`;
    case 'stats':
      return `${designSystem.backgrounds.stats} text-white ${base}`;
    case 'feature':
      return `bg-gray-50 ${base}`;
    default:
      return `bg-white ${base}`;
  }
};