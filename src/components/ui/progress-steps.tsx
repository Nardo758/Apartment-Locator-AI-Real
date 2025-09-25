import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  required: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
  orientation = 'horizontal',
  showConnectors = true
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'flex-row items-center' : 'flex-col',
      className
    )}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = step.completed;
        const isClickable = onStepClick && (isCompleted || index <= currentStep);
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div
              className={cn(
                'flex items-center gap-3',
                isHorizontal ? 'flex-row' : 'flex-col text-center',
                isClickable && 'cursor-pointer group'
              )}
              onClick={() => isClickable && onStepClick?.(index)}
            >
              {/* Step Circle */}
              <div className={cn(
                'relative flex items-center justify-center',
                'w-8 h-8 rounded-full border-2 transition-all duration-200',
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isActive
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted border-muted-foreground/30 text-muted-foreground',
                isClickable && 'group-hover:scale-110'
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className={cn(
                    'w-4 h-4',
                    isActive && 'fill-current'
                  )} />
                )}
                
                {/* Step number overlay for incomplete steps */}
                {!isCompleted && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Step Content */}
              <div className={cn(
                'flex flex-col',
                !isHorizontal && 'items-center'
              )}>
                <div className={cn(
                  'text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : isCompleted
                    ? 'text-primary'
                    : 'text-muted-foreground',
                  isClickable && 'group-hover:text-foreground'
                )}>
                  {step.title}
                  {step.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </div>
                
                {step.description && (
                  <div className={cn(
                    'text-xs text-muted-foreground mt-1',
                    !isHorizontal && 'text-center'
                  )}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Connector */}
            {showConnectors && !isLast && (
              <div className={cn(
                'transition-colors duration-200',
                isHorizontal 
                  ? 'h-0.5 flex-1 mx-4' 
                  : 'w-0.5 h-8 my-2',
                isCompleted || (index < currentStep)
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Simplified progress indicator for compact spaces
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  className
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium text-foreground">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};