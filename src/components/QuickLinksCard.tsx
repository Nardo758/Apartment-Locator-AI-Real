import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Mail, 
  FileText, 
  Shield,
  User,
  Heart
} from 'lucide-react';

interface QuickLinksCardProps {
  variant?: 'sidebar' | 'footer' | 'compact';
}

const QuickLinksCard: React.FC<QuickLinksCardProps> = ({ variant = 'sidebar' }) => {
  const links = [
    { to: '/profile', icon: User, label: 'Profile & Settings' },
    { to: '/billing', icon: CreditCard, label: 'Billing & Plans' },
    { to: '/saved-properties', icon: Heart, label: 'Saved Properties' },
    { to: '/help', icon: HelpCircle, label: 'Help Center' },
    { to: '/contact', icon: Mail, label: 'Contact Support' },
    { to: '/terms', icon: FileText, label: 'Terms of Service' },
    { to: '/privacy', icon: Shield, label: 'Privacy Policy' }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {links.slice(0, 4).map((link) => (
          <Button key={link.to} variant="ghost" size="sm" className="justify-start" asChild>
            <Link to={link.to}>
              <link.icon size={14} className="mr-2" />
              {link.label.split(' ')[0]}
            </Link>
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="space-y-2">
        {links.map((link) => (
          <Link 
            key={link.to} 
            to={link.to} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <link.icon size={14} />
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Card className="glass-dark border-border/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Settings size={20} className="mr-2 text-muted-foreground" />
          Quick Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {links.map((link) => (
          <Button key={link.to} variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link to={link.to}>
              <link.icon size={16} className="mr-2" />
              {link.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickLinksCard;