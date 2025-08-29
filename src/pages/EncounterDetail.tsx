import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScoreChip } from '@/components/ScoreChip';
import { SignalChip } from '@/components/SignalChip';
import { AppHeader } from '@/components/AppHeader';
import { mockEncounters, computeReadinessScore } from '@/lib/mockData';
import { getStoredAuth, canPerformAction } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Plus, RefreshCw, Calendar, User, MapPin, Truck } from 'lucide-react';
import { Signal, Task } from '@/types';

export default function EncounterDetail() {
  const { id } = useParams<{ id: string }>();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const auth = getStoredAuth();
  const { toast } = useToast();

  const encounter = useMemo(() => {
    const enc = mockEncounters.find(e => e.id === id);
    if (enc) {
      // Initialize local state with encounter data
      if (signals.length === 0) setSignals(enc.signals);
      if (tasks.length === 0) setTasks(enc.tasks);
      return enc;
    }
    return null;
  }, [id, signals.length, tasks.length]);

  const currentScore = useMemo(() => {
    if (!encounter) return null;
    return computeReadinessScore(signals);
  }, [encounter, signals]);

  if (!encounter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Encounter Not Found</h1>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSignalUpdate = (signalId: string, newStatus: 'pending' | 'complete' | 'error') => {
    if (!canPerformAction(auth.user?.role || 'nurse', 'complete_signal')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to update signals.',
        variant: 'destructive',
      });
      return;
    }

    setSignals(prev => prev.map(signal => 
      signal.id === signalId 
        ? { ...signal, status: newStatus, lastUpdatedTs: new Date().toISOString() }
        : signal
    ));

    toast({
      title: 'Signal Updated',
      description: `Signal marked as ${newStatus}`,
    });
  };

  const handleTaskUpdate = (taskId: string, newStatus: 'open' | 'in_progress' | 'complete') => {
    if (!canPerformAction(auth.user?.role || 'nurse', 'complete_task')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to update tasks.',
        variant: 'destructive',
      });
      return;
    }

    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus, 
            completedTs: newStatus === 'complete' ? new Date().toISOString() : undefined 
          }
        : task
    ));

    toast({
      title: 'Task Updated',
      description: `Task ${newStatus === 'complete' ? 'completed' : 'updated'}`,
    });
  };

  const startDischarge = () => {
    if (!canPerformAction(auth.user?.role || 'nurse', 'start_discharge')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to start discharge.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Discharge Started',
      description: 'Discharge process has been initiated.',
    });
  };

  const priorityColors = {
    1: 'bg-status-critical text-status-critical-foreground',
    2: 'bg-status-warning text-status-warning-foreground',
    3: 'bg-status-info text-status-info-foreground',
  };

  const priorityLabels = { 1: 'High', 2: 'Medium', 3: 'Low' };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title={encounter.patient.name}
        subtitle={`${encounter.patient.mrnExt} • ${encounter.patient.unit} ${encounter.patient.room}`}
      >
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        {currentScore && (
          <ScoreChip
            score={currentScore.score}
            label={currentScore.label}
            pendingCount={currentScore.pendingCount}
            size="lg"
          />
        )}
      </AppHeader>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Patient Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">DOB:</span>
                <span className="text-sm font-medium">{new Date(encounter.patient.dob).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sex:</span>
                <span className="text-sm font-medium">{encounter.patient.sex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payer:</span>
                <span className="text-sm font-medium">{encounter.patient.payer}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service:</span>
                <span className="text-sm font-medium">{encounter.patient.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">LOS:</span>
                <span className="text-sm font-medium">{encounter.patient.losDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Admitted:</span>
                <span className="text-sm font-medium">{new Date(encounter.patient.admitTs).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Discharge Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Started:</span>
                <span className="text-sm font-medium">
                  {encounter.startedDischargeTs ? new Date(encounter.startedDischargeTs).toLocaleString() : 'Not started'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ready:</span>
                <span className="text-sm font-medium">
                  {encounter.dischargeReadyTs ? new Date(encounter.dischargeReadyTs).toLocaleString() : 'Pending'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {!encounter.startedDischargeTs && (
                <Button variant="medical" onClick={startDischarge}>
                  <Clock className="w-4 h-4 mr-2" />
                  Start Discharge
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/placements">
                  <MapPin className="w-4 h-4 mr-2" />
                  Manage Placements
                </Link>
              </Button>
              <Button variant="outline">
                <Truck className="w-4 h-4 mr-2" />
                Schedule Transport
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Signals Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Discharge Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signal Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map(signal => (
                  <TableRow key={signal.id}>
                    <TableCell>
                      <SignalChip signal={signal} size="md" />
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          signal.status === 'complete' ? 'border-status-success text-status-success' :
                          signal.status === 'error' ? 'border-status-critical text-status-critical' :
                          'border-status-warning text-status-warning'
                        }
                      >
                        {signal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(signal.lastUpdatedTs).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {signal.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSignalUpdate(signal.id, 'complete')}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSignalUpdate(signal.id, 'pending')}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Refresh
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Tasks ({tasks.filter(t => t.status !== 'complete').length} open)
              </div>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{task.ownerRole?.replace('_', ' ') || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={priorityColors[task.priority as keyof typeof priorityColors]}
                      >
                        {priorityLabels[task.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.dueTs ? new Date(task.dueTs).toLocaleDateString() : 'No due date'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          task.status === 'complete' ? 'border-status-success text-status-success' :
                          task.status === 'in_progress' ? 'border-status-warning text-status-warning' :
                          'border-status-info text-status-info'
                        }
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {task.status !== 'complete' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleTaskUpdate(task.id, 'complete')}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No tasks assigned to this encounter
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}