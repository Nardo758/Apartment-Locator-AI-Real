import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  Send,
  Calendar,
  User,
  Home,
  DollarSign,
  CheckCircle
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'renewal' | 'offer' | 'followup' | 'maintenance';
  subject: string;
  body: string;
  usageCount: number;
  successRate?: number;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Standard Renewal Offer',
    category: 'renewal',
    subject: 'Your Lease Renewal Offer - {{property_address}}',
    body: `Hi {{tenant_name}},

We hope you've enjoyed living at {{property_address}}! Your lease expires on {{lease_end}}, and we'd love to have you stay.

We're offering to renew your lease at ${{offered_rent}}/month.

Please let us know by {{response_deadline}} if you'd like to renew.

Best regards,
{{landlord_name}}
{{management_company}}`,
    usageCount: 45,
    successRate: 78
  },
  {
    id: '2',
    name: 'Renewal with Incentive',
    category: 'renewal',
    subject: 'Special Renewal Offer for {{tenant_name}}',
    body: `Hi {{tenant_name}},

As a valued tenant at {{property_address}}, we'd like to offer you a special renewal package:

- Rent: ${{offered_rent}}/month
- {{incentive_description}}

This offer is available until {{response_deadline}}.

Looking forward to having you stay!

Best,
{{landlord_name}}`,
    usageCount: 23,
    successRate: 85
  },
  {
    id: '3',
    name: 'Initial Offer - Below Asking',
    category: 'offer',
    subject: 'Rental Application for {{property_address}}',
    body: `Dear {{landlord_name}},

I'm interested in renting {{property_address}}. I'm a responsible tenant with excellent references and stable employment.

I'd like to offer ${{offer_amount}}/month for a {{lease_length}} lease starting {{move_in_date}}.

I'm happy to provide:
- Proof of income
- References
- Background check
- Security deposit

Please let me know if you'd like to discuss this offer.

Best regards,
{{renter_name}}
{{renter_phone}}`,
    usageCount: 67,
    successRate: 62
  },
  {
    id: '4',
    name: 'Counter Offer Response',
    category: 'offer',
    subject: 'Re: {{property_address}} - Counter Offer',
    body: `Hi {{landlord_name}},

Thank you for your counter offer of ${{counter_amount}}/month.

I'd like to propose meeting in the middle at ${{new_offer}}/month, or alternatively, accepting your price with {{concession_request}}.

I'm ready to move forward quickly and can sign the lease this week.

Looking forward to hearing from you.

Best,
{{renter_name}}`,
    usageCount: 34,
    successRate: 71
  },
  {
    id: '5',
    name: 'Follow-up - No Response',
    category: 'followup',
    subject: 'Following up on {{property_address}}',
    body: `Hi {{landlord_name}},

I wanted to follow up on my rental application for {{property_address}} that I submitted on {{submit_date}}.

I'm still very interested in the property and would love to hear back from you.

Please let me know if you need any additional information.

Thank you,
{{renter_name}}`,
    usageCount: 28,
    successRate: 45
  },
  {
    id: '6',
    name: 'Thank You - Acceptance',
    category: 'followup',
    subject: 'Thank you - {{property_address}}',
    body: `Hi {{landlord_name}},

Thank you so much for accepting my application! I'm excited to move into {{property_address}} on {{move_in_date}}.

Please let me know the next steps for signing the lease and arranging the security deposit.

Looking forward to being your tenant!

Best,
{{renter_name}}`,
    usageCount: 19,
    successRate: 95
  }
];

const availableTokens = [
  { token: '{{tenant_name}}', description: 'Tenant full name' },
  { token: '{{landlord_name}}', description: 'Landlord/manager name' },
  { token: '{{property_address}}', description: 'Full property address' },
  { token: '{{unit_number}}', description: 'Unit/apartment number' },
  { token: '{{current_rent}}', description: 'Current monthly rent' },
  { token: '{{offered_rent}}', description: 'Offered/new rent amount' },
  { token: '{{lease_start}}', description: 'Lease start date' },
  { token: '{{lease_end}}', description: 'Lease expiration date' },
  { token: '{{move_in_date}}', description: 'Move-in date' },
  { token: '{{response_deadline}}', description: 'Response deadline date' },
  { token: '{{management_company}}', description: 'Management company name' },
  { token: '{{renter_name}}', description: 'Renter full name' },
  { token: '{{renter_phone}}', description: 'Renter phone number' },
  { token: '{{offer_amount}}', description: 'Offer amount' },
  { token: '{{savings}}', description: 'Monthly savings amount' },
];

export default function EmailTemplates() {
  const [templates] = useState(mockTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'renewal', label: 'Renewals', count: templates.filter(t => t.category === 'renewal').length },
    { id: 'offer', label: 'Offers', count: templates.filter(t => t.category === 'offer').length },
    { id: 'followup', label: 'Follow-ups', count: templates.filter(t => t.category === 'followup').length },
  ];

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Email Templates
              </h1>
              <p className="text-white/60">
                Professional email templates for renewals, offers, and follow-ups
              </p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Template Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <Card variant="elevated" className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedTemplate.name}
                    </h2>
                    <Badge variant="primary">
                      {selectedTemplate.category}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/60 text-xl">×</span>
                  </button>
                </div>

                {/* Subject */}
                <div className="mb-6">
                  <label className="label mb-2">Subject</label>
                  <Input
                    value={selectedTemplate.subject}
                    readOnly
                    className="font-semibold"
                  />
                </div>

                {/* Body */}
                <div className="mb-6">
                  <label className="label mb-2">Email Body</label>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <pre className="text-white/80 whitespace-pre-wrap font-sans">
                      {selectedTemplate.body}
                    </pre>
                  </div>
                </div>

                {/* Available Tokens */}
                <div className="mb-6">
                  <label className="label mb-3">Available Tokens</label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {availableTokens.slice(0, 8).map((token) => (
                      <div
                        key={token.token}
                        className="p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <code className="text-blue-400 text-sm">{token.token}</code>
                        <p className="text-white/60 text-xs mt-1">{token.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                  <Button variant="outline" size="lg">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="lg">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Template Grid */}
        {filteredTemplates.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <Mail className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/70 mb-2">
              No templates found
            </h3>
            <p className="text-white/50 mb-4">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} variant="elevated" hover className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {template.name}
                      </h3>
                      <Badge variant={
                        template.category === 'renewal' ? 'primary' :
                        template.category === 'offer' ? 'success' : 'warning'
                      } size="sm">
                        {template.category}
                      </Badge>
                    </div>
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>

                  <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Subject</div>
                    <div className="text-white text-sm font-medium truncate">
                      {template.subject}
                    </div>
                  </div>

                  <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 max-h-32 overflow-hidden">
                    <div className="text-white/70 text-sm line-clamp-4">
                      {template.body}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="text-white/60">
                      Used {template.usageCount} times
                    </div>
                    {template.successRate && (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        {template.successRate}% success
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <Card variant="glass" className="p-6 text-center">
            <Mail className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {templates.length}
            </div>
            <div className="text-white/60 text-sm">Total Templates</div>
          </Card>
          <Card variant="glass" className="p-6 text-center">
            <Send className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
            <div className="text-white/60 text-sm">Emails Sent</div>
          </Card>
          <Card variant="glass" className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              72%
            </div>
            <div className="text-white/60 text-sm">Avg Success Rate</div>
          </Card>
          <Card variant="glass" className="p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              156
            </div>
            <div className="text-white/60 text-sm">Sent This Month</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
