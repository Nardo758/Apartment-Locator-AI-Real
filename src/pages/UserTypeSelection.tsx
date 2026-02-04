import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Building, Briefcase, CheckCircle } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

type UserType = 'renter' | 'landlord' | 'agent';

interface UserTypeOption {
  type: UserType;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  route: string;
}

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const userTypes: UserTypeOption[] = [
    {
      type: 'renter',
      icon: <Home className="w-12 h-12" />,
      title: "I'm Looking for an Apartment",
      description: "Find your perfect home with AI-powered search",
      features: [
        "Smart apartment search",
        "Market intelligence",
        "Negotiation tools",
        "Saved searches"
      ],
      route: '/program-ai'
    },
    {
      type: 'landlord',
      icon: <Building className="w-12 h-12" />,
      title: "I'm a Landlord/Property Manager",
      description: "Optimize your portfolio and reduce vacancies",
      features: [
        "Portfolio dashboard",
        "Competitive intelligence",
        "Renewal optimizer",
        "Email templates"
      ],
      route: '/portfolio-dashboard'
    },
    {
      type: 'agent',
      icon: <Briefcase className="w-12 h-12" />,
      title: "I'm an Agent/Broker",
      description: "Manage clients and close more deals",
      features: [
        "Client portfolio",
        "Lead capture",
        "Commission calculator",
        "Activity tracking"
      ],
      route: '/agent-dashboard'
    }
  ];

  const handleContinue = () => {
    if (!selectedType) return;

    // Store user type in localStorage for now
    // TODO: Save to database when backend is connected
    localStorage.setItem('userType', selectedType);

    // Navigate to appropriate dashboard
    const selectedOption = userTypes.find(t => t.type === selectedType);
    if (selectedOption) {
      navigate(selectedOption.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-4">
            Welcome to Apartment Locator AI
          </h1>
          <p className="text-xl text-gray-600">
            Tell us about yourself to get started
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {userTypes.map((option) => (
            <Card
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={`
                cursor-pointer transition-all duration-200 p-6 bg-white
                ${selectedType === option.type 
                  ? 'ring-2 ring-blue-500 shadow-2xl scale-105' 
                  : 'hover:shadow-xl hover:scale-102'
                }
              `}
            >
              {/* Icon & Selection Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  p-3 rounded-xl transition-colors
                  ${selectedType === option.type 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {option.icon}
                </div>
                {selectedType === option.type && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {option.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-6 text-lg"
          >
            Continue
          </Button>
          {!selectedType && (
            <p className="text-sm text-gray-500 mt-4">
              Please select an option to continue
            </p>
          )}
        </div>

        {/* Skip for now */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Skip for now (I'll decide later)
          </button>
        </div>
      </div>
    </div>
  );
}
