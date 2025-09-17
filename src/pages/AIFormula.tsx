import React from 'react';
import Header from '@/components/Header';
import AIFormulaExplainer from '@/components/AIFormulaExplainer';

const AIFormula: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">ApartmentIQ AI Formula</h1>
            <p className="text-muted-foreground text-lg">
              Discover how our advanced AI system identifies opportunities and calculates savings with 87% accuracy.
            </p>
          </div>
          <AIFormulaExplainer />
        </div>
      </main>
    </div>
  );
};

export default AIFormula;