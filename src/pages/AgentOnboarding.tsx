import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Users
} from 'lucide-react';

export default function AgentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'complete'>('info');
  const [brokerageName, setBrokerageName] = useState('');
  const [teamSize, setTeamSize] = useState('solo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Content */}
        <Card className="p-8 bg-white shadow-2xl">
          {/* Step 1: Basic Info */}
          {step === 'info' && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tell Us About Your Business
                </h2>
                <p className="text-gray-600">
                  Help us customize your experience (Optional)
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brokerage Name (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Smith Realty Group"
                    value={brokerageName}
                    onChange={(e) => setBrokerageName(e.target.value)}
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'solo', label: 'Solo Agent', icon: <Users className="w-5 h-5" /> },
                      { id: 'small', label: '2-5 Agents', icon: <Users className="w-5 h-5" /> },
                      { id: 'medium', label: '6-20 Agents', icon: <Users className="w-5 h-5" /> },
                      { id: 'large', label: '20+ Agents', icon: <Users className="w-5 h-5" /> }
                    ].map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setTeamSize(size.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          teamSize === size.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${
                            teamSize === size.id ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {size.icon}
                          </div>
                          <span className={`text-sm font-medium ${
                            teamSize === size.id ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {size.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Complete */}
          {step === 'complete' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set!
              </h3>
              <p className="text-gray-600 mb-6">
                Your 14-day free trial starts now. No credit card required.
              </p>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trial ends:</span>
                  <span className="text-gray-900 font-semibold">
                    {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={() => navigate('/agent-dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                You can update your profile and choose a plan later from your dashboard.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== 'complete' && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => navigate('/user-type')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep('complete')}
                >
                  Skip
                </Button>
                <Button
                  onClick={() => setStep('complete')}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
