import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import Header from '@/components/Header';
import AIFormulaExplainer from '@/components/AIFormulaExplainer';

const AIFormula: React.FC = () => {
  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <ModernPageLayout
        title="AI Formula & Intelligence"
        subtitle="Discover how our advanced AI system identifies opportunities and calculates savings with 87% accuracy"
        showHeader={true}
        headerContent={
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </Link>
        }
      >
        {/* AI Introduction */}
        <div className={`${designSystem.animations.entrance} mb-8`}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                    Advanced AI Engine
                  </h2>
                  <p className={designSystem.typography.body}>
                    Powered by machine learning and market intelligence
                  </p>
                </div>
              </div>
              <p className={`${designSystem.typography.bodyLarge} mb-6`}>
                Our proprietary AI combines multiple data sources, behavioral analysis, and market trends to identify rental opportunities that traditional search platforms miss.
              </p>
              <div className="flex gap-4">
                <Link to="/auth?type=renter&mode=signup">
                  <Button className={`${designSystem.buttons.primary} gap-2`}>
                    <Calculator size={16} />
                    Try AI Analysis
                  </Button>
                </Link>
                <Link to="/market-intel">
                  <Button variant="outline" className="gap-2">
                    <Brain size={16} />
                    Market Intelligence
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-blue-600 mb-1">87%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Formula Component */}
        <div className={`${designSystem.animations.entrance}`} >
          <AIFormulaExplainer />
        </div>
      </ModernPageLayout>
    </div>
  );
};

export default AIFormula;