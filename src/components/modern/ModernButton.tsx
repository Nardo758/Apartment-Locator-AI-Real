import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ModernButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  gradient?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animate?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  gradient = true,
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  animate = true,
  className = '',
  disabled,
  ...props
}) => {
  const getButtonClasses = () => {
    let classes = '';
    
    // Base animation
    if (animate) {
      classes += ` ${designSystem.animations.transition}`;
    }
    
    // Variant-specific styles
    switch (variant) {
      case 'primary':
        if (gradient) {
          classes += ` ${designSystem.buttons.primary}`;
        } else {
          classes += ' bg-blue-600 hover:bg-blue-700 text-white';
        }
        break;
      case 'secondary':
        classes += ` ${designSystem.buttons.secondary}`;
        break;
      case 'outline':
        classes += ' border-2 border-gray-300 text-gray-700 hover:bg-gray-50';
        break;
      case 'ghost':
        classes += ' text-gray-700 hover:bg-gray-100';
        break;
    }
    
    // Full width
    if (fullWidth) {
      classes += ' w-full';
    }
    
    // Loading state
    if (loading) {
      classes += ' opacity-70 cursor-not-allowed';
    }
    
    return `${classes} ${className}`;
  };

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className={`${designSystem.icons.small} animate-spin`} />;
    }
    
    if (icon) {
      return icon;
    }
    
    if (variant === 'primary' && !icon && iconPosition === 'right') {
      return <ArrowRight className={designSystem.icons.small} />;
    }
    
    return null;
  };

  const buttonContent = (
    <>
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </>
  );

  return (
    <Button
      className={getButtonClasses()}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </Button>
  );
};

export default ModernButton;