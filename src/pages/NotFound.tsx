import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Search, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { designSystem } from "@/lib/design-system";
import ModernCard from "@/components/modern/ModernCard";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const quickLinks = [
    {
      icon: Home,
      title: "Homepage",
      description: "Return to our main page",
      path: "/",
      color: "text-blue-600"
    },
    {
      icon: Search,
      title: "Property Search",
      description: "Find apartments with AI",
      path: "/dashboard",
      color: "text-green-600"
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Get support and answers",
      path: "/help",
      color: "text-purple-600"
    }
  ];

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark} flex items-center justify-center px-4 py-8`}>
      <div className="max-w-2xl w-full text-center">
        {/* 404 Header */}
        <div className={`${designSystem.animations.entrance} mb-12`}>
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              404
            </span>
          </div>
          
          <h1 className={`${designSystem.typography.hero} mb-4`}>
            <span className={designSystem.typography.heroGradient}>Page Not Found</span>
          </h1>
          
          <p className={`${designSystem.typography.bodyLarge} mb-2`}>
            Oops! The page you're looking for doesn't exist.
          </p>
          
          <p className={`${designSystem.typography.body} mb-8`}>
            The page at <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">{location.pathname}</code> could not be found.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className={`${designSystem.layouts.gridThree} mb-8`}>
          {quickLinks.map((link, index) => (
            <ModernCard
              key={link.title}
              animate
              animationDelay={index * 100 + 200}
              hover
              className="text-center"
            >
              <Link to={link.path} className="block">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <link.icon className={`w-8 h-8 ${link.color}`} />
                  </div>
                  <div>
                    <h3 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                      {link.title}
                    </h3>
                    <p className={designSystem.typography.body}>
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            </ModernCard>
          ))}
        </div>

        {/* Main Actions */}
        <ModernCard className={`${designSystem.animations.entrance}`} >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button className={`${designSystem.buttons.primary} gap-2`}>
                <Home className="w-4 h-4" />
                Return to Homepage
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default NotFound;
