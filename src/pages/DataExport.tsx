import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Download, History, Info } from 'lucide-react';
import { DataExportModal } from '@/components/DataExportModal';
import { DataExportHistory } from '@/components/DataExportHistory';

const DataExport: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Export & Privacy</h1>
        <p className="text-muted-foreground">
          Export your data or view your export history. We believe in transparency and your right to data portability.
        </p>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Request Export
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Export History
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy Info
          </TabsTrigger>
        </TabsList>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get a copy of your data</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Request a comprehensive export of all your data. You can choose specific categories, 
                    date ranges, and formats. We'll process your request and notify you when it's ready.
                  </p>
                </div>
                <Button size="lg" onClick={() => setIsModalOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Request Data Export
                </Button>
              </div>

              {/* What's Included */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">What's included in your export:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Profile Information</div>
                        <div className="text-sm text-muted-foreground">
                          Your account details, preferences, and settings
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Activity Data</div>
                        <div className="text-sm text-muted-foreground">
                          Page views, searches, clicks, and interactions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Content Data</div>
                        <div className="text-sm text-muted-foreground">
                          Saved properties, offers, notes, and uploads
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Session Information</div>
                        <div className="text-sm text-muted-foreground">
                          Login history, device information, and session data
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Transaction Records</div>
                        <div className="text-sm text-muted-foreground">
                          Purchase history and subscription details (anonymized)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Technical Data</div>
                        <div className="text-sm text-muted-foreground">
                          Device info, IP addresses, and browser details
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <DataExportHistory />
        </TabsContent>

        {/* Privacy Info Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Your Data Rights</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 text-primary" />
                      <span><strong>Right to Access:</strong> You can request a copy of all your personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 text-primary" />
                      <span><strong>Right to Portability:</strong> Export your data in machine-readable formats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 text-primary" />
                      <span><strong>Right to Rectification:</strong> Correct any inaccurate personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 text-primary" />
                      <span><strong>Right to Erasure:</strong> Request deletion of your personal data</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Data Processing</h4>
                  <div className="text-muted-foreground space-y-2">
                    <p>
                      We process your data based on legitimate interests and your consent to provide 
                      our rental intelligence services. All data is stored securely and encrypted.
                    </p>
                    <p>
                      Your exported data includes all information we have about you, organized by 
                      category with clear attribution of data sources and processing purposes.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Data Retention</h4>
                  <div className="text-muted-foreground space-y-2">
                    <p>
                      We retain your data for as long as necessary to provide our services and 
                      comply with legal obligations. You can request deletion at any time.
                    </p>
                    <p>
                      Export files are automatically deleted after 7 days for security purposes. 
                      You can re-request exports at any time.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Third-Party Sharing</h4>
                  <div className="text-muted-foreground">
                    <p>
                      We do not sell your personal data. We only share data with trusted service 
                      providers who help us operate our platform, and only as necessary to provide our services.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <DataExportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default DataExport;