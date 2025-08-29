import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScoreChip } from '@/components/ScoreChip';
import { SignalChip } from '@/components/SignalChip';
import { AppHeader } from '@/components/AppHeader';
import { mockEncounters, computeReadinessScore } from '@/lib/mockData';
import { Search, Filter, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  // Compute current scores for all encounters
  const encountersWithScores = useMemo(() => {
    return mockEncounters.map(encounter => {
      const score = computeReadinessScore(encounter.signals);
      return {
        ...encounter,
        currentScore: score,
      };
    });
  }, []);

  // Filter encounters based on search and filters
  const filteredEncounters = useMemo(() => {
    return encountersWithScores.filter(encounter => {
      const matchesSearch = encounter.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           encounter.patient.mrnExt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUnit = unitFilter === 'all' || encounter.patient.unit === unitFilter;
      const matchesScore = scoreFilter === 'all' || encounter.currentScore.label === scoreFilter;
      
      return matchesSearch && matchesUnit && matchesScore;
    });
  }, [encountersWithScores, searchTerm, unitFilter, scoreFilter]);

  // Dashboard statistics
  const stats = useMemo(() => {
    const total = encountersWithScores.length;
    const green = encountersWithScores.filter(e => e.currentScore.label === 'Green').length;
    const yellow = encountersWithScores.filter(e => e.currentScore.label === 'Yellow').length;
    const red = encountersWithScores.filter(e => e.currentScore.label === 'Red').length;
    const avgLos = Math.round(encountersWithScores.reduce((sum, e) => sum + e.patient.losDays, 0) / total);
    
    return { total, green, yellow, red, avgLos };
  }, [encountersWithScores]);

  const units = ['all', 'Gen Med', 'Post-Op'];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Discharge Dashboard" 
        subtitle="Real-time patient discharge coordination"
      >
        <Badge variant="outline" className="bg-primary-light text-primary">
          Active Sessions: {stats.total}
        </Badge>
        <Button variant="outline" asChild>
          <Link to="/placements">Placements</Link>
        </Button>
      </AppHeader>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="w-4 h-4" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-score-green" />
                Ready
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-status-success">{stats.green}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-score-yellow" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-status-warning">{stats.yellow}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-status-critical" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-status-critical">{stats.red}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="w-4 h-4" />
                Avg LOS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.avgLos} days</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by patient name or MRN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit === 'all' ? 'All Units' : unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="w-32">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Yellow">Yellow</SelectItem>
                    <SelectItem value="Green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Active Discharges ({filteredEncounters.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Patient</TableHead>
                    <TableHead>Unit / Room</TableHead>
                    <TableHead>LOS</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pending Signals</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEncounters.map(encounter => (
                    <TableRow key={encounter.id} className="hover:bg-muted/30 transition-medical">
                      <TableCell>
                        <div>
                          <div className="font-medium">{encounter.patient.name}</div>
                          <div className="text-sm text-muted-foreground">{encounter.patient.mrnExt}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{encounter.patient.unit}</div>
                          <div className="text-sm text-muted-foreground">{encounter.patient.room}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{encounter.patient.losDays} days</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{encounter.patient.service}</span>
                      </TableCell>
                      <TableCell>
                        <ScoreChip
                          score={encounter.currentScore.score}
                          label={encounter.currentScore.label}
                          pendingCount={encounter.currentScore.pendingCount}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {encounter.signals
                            .filter(signal => signal.status === 'pending')
                            .slice(0, 3)
                            .map(signal => (
                              <SignalChip key={signal.id} signal={signal} size="sm" />
                            ))}
                          {encounter.signals.filter(s => s.status === 'pending').length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{encounter.signals.filter(s => s.status === 'pending').length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {encounter.tasks.filter(t => t.status !== 'complete').length > 0 ? (
                            <span className="text-status-warning">
                              {encounter.tasks.filter(t => t.status !== 'complete').length} open
                            </span>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/encounters/${encounter.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}