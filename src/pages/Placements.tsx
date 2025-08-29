import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/AppHeader';
import { mockEncounters, mockFacilities } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Phone, Mail, Users, Building, Clock, CheckCircle2, Send } from 'lucide-react';
import { Facility, Encounter } from '@/types';

export default function Placements() {
  const [selectedEncounter, setSelectedEncounter] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const activeEncounters = mockEncounters.filter(e => e.status === 'active');
  const selectedEncounterData = activeEncounters.find(e => e.id === selectedEncounter);

  const handleSendPlacement = (facilityId: string) => {
    if (!selectedEncounter) {
      toast({
        title: 'Select Patient',
        description: 'Please select a patient before sending placement request.',
        variant: 'destructive',
      });
      return;
    }

    const facility = mockFacilities.find(f => f.id === facilityId);
    toast({
      title: 'Placement Sent',
      description: `Placement packet sent to ${facility?.name}`,
    });
  };

  const handleAcceptPlacement = () => {
    if (!selectedFacility) {
      toast({
        title: 'Select Facility',
        description: 'Please select a facility first.',
        variant: 'destructive',
      });
      return;
    }

    const facility = mockFacilities.find(f => f.id === selectedFacility);
    toast({
      title: 'Placement Accepted',
      description: `Placement accepted at ${facility?.name}`,
    });
  };

  const getCapacityColor = (status?: string) => {
    switch (status) {
      case 'open': return 'border-status-success text-status-success';
      case 'limited': return 'border-status-warning text-status-warning';
      case 'full': return 'border-status-critical text-status-critical';
      default: return 'border-muted text-muted-foreground';
    }
  };

  const getFacilityIcon = (kind: string) => {
    switch (kind) {
      case 'SNF': return '🏥';
      case 'HomeHealth': return '🏠';
      case 'Rehab': return '🔄';
      case 'Hospice': return '💚';
      default: return '🏢';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Placement Management"
        subtitle="Send placement requests and manage facility responses"
      >
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </AppHeader>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Patient Selection & Details */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedEncounter} onValueChange={setSelectedEncounter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient for placement..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEncounters.map(encounter => (
                      <SelectItem key={encounter.id} value={encounter.id}>
                        {encounter.patient.name} - {encounter.patient.unit} {encounter.patient.room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedEncounterData && (
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Patient:</span>
                      <span className="text-sm">{selectedEncounterData.patient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">MRN:</span>
                      <span className="text-sm">{selectedEncounterData.patient.mrnExt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Payer:</span>
                      <span className="text-sm">{selectedEncounterData.patient.payer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">LOS:</span>
                      <span className="text-sm">{selectedEncounterData.patient.losDays} days</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Placement Notes & Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter special requirements, mobility needs, dietary restrictions, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                />
              </CardContent>
            </Card>

            {selectedEncounterData?.placements && selectedEncounterData.placements.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Sent Placements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEncounterData.placements.map(placement => (
                      <div key={placement.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{placement.facility.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Sent: {placement.packetSentTs ? new Date(placement.packetSentTs).toLocaleString() : 'Pending'}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-status-warning text-status-warning">
                          {placement.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Facility Directory */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Facility Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFacilities.map(facility => (
                    <div
                      key={facility.id}
                      className={`p-4 border rounded-lg transition-medical cursor-pointer hover:shadow-md ${
                        selectedFacility === facility.id ? 'border-primary bg-primary-light' : 'border-border'
                      }`}
                      onClick={() => setSelectedFacility(facility.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFacilityIcon(facility.kind)}</span>
                          <div>
                            <h3 className="font-medium">{facility.name}</h3>
                            <p className="text-sm text-muted-foreground">{facility.kind}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getCapacityColor(facility.capacityStatus)}
                        >
                          {facility.capacityStatus || 'Unknown'}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground mb-3">
                        {facility.distanceMi && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {facility.distanceMi} miles away
                          </div>
                        )}
                        {facility.contactEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {facility.contactEmail}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendPlacement(facility.id);
                          }}
                          disabled={!selectedEncounter}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send Packet
                        </Button>
                        
                        {facility.capacityStatus === 'open' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFacility(facility.id);
                              handleAcceptPlacement();
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}