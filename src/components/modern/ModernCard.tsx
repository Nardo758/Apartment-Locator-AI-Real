import React from 'react';
import { designSystem } from '@/lib/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModernCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'outline' | 'secondary';
  hover?: boolean;
  gradient?: boolean;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
  animate?: boolean;
  animationDelay?: number;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  badge,
  badgeVariant = 'outline',
  hover = true,
  gradient = false,
  className = '',
  contentClassName = '',
  onClick,
  animate = false,
  animationDelay = 0
}) => {
  const getCardClasses = () => {
    let classes = designSystem.backgrounds.card;
    
    if (hover) {
      classes += ` ${designSystem.backgrounds.cardHover}`;
    }
    
    if (gradient) {
      classes += ` ${designSystem.backgrounds.feature}`;
    }
    
    if (onClick) {
      classes += ' cursor-pointer';
    }
    
    if (animate) {
      classes += ` ${designSystem.animations.entrance}`;
    }
    
    return `${classes} ${className}`;
  };

  const getAnimationStyle = () => {
    if (animate && animationDelay > 0) {
      return { animationDelay: `${animationDelay}ms` };
    }
    return {};
  };

  const cardContent = (
    <>
      {(title || subtitle || icon || badge) && (
        <CardHeader className={designSystem.spacing.paddingSmall}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                {title && (
                  <CardTitle className={designSystem.typography.subheadingLarge}>
                    {title}
                  </CardTitle>
                )}
                {subtitle && (
                  <p className={designSystem.typography.label}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {badge && (
              <Badge variant={badgeVariant} className={designSystem.typography.labelSmall}>
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>
      )}
      
      {children && (
        <CardContent className={`${designSystem.spacing.paddingSmall} ${contentClassName}`}>
          {children}
        </CardContent>
      )}
    </>
  );

  return (
    <Card
      className={getCardClasses()}
      onClick={onClick}
      style={getAnimationStyle()}
    >
      {cardContent}
    </Card>
  );
};

export default ModernCard;