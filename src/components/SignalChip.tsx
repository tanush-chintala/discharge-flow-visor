import { Badge } from '@/components/ui/badge';
import { Signal, SignalKind } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, AlertCircle, FileText, Camera, Pill, Shield, GraduationCap, MapPin, Truck } from 'lucide-react';

interface SignalChipProps {
  signal: Signal;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const signalIcons: Record<SignalKind, typeof Clock> = {
  labs: FileText,
  imaging: Camera,
  pharmacy: Pill,
  insurance: Shield,
  education: GraduationCap,
  placement: MapPin,
  transport: Truck,
};

const signalLabels: Record<SignalKind, string> = {
  labs: 'Labs',
  imaging: 'Imaging',
  pharmacy: 'Pharmacy',
  insurance: 'Insurance',
  education: 'Education',
  placement: 'Placement',
  transport: 'Transport',
};

export function SignalChip({ signal, size = 'sm', showIcon = true }: SignalChipProps) {
  const Icon = signalIcons[signal.kind];
  const label = signalLabels[signal.kind];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  const statusClasses = {
    pending: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    complete: 'bg-status-success/10 text-status-success border-status-success/20',
    error: 'bg-status-critical/10 text-status-critical border-status-critical/20',
  };

  const StatusIcon = signal.status === 'complete' ? CheckCircle : 
                   signal.status === 'error' ? AlertCircle : Clock;

  return (
    <Badge
      variant="outline"
      className={cn(
        'border transition-medical font-medium',
        sizeClasses[size],
        statusClasses[signal.status]
      )}
    >
      <div className="flex items-center gap-1">
        {showIcon && <Icon className="w-3 h-3" />}
        <span>{label}</span>
        <StatusIcon className="w-3 h-3 ml-1" />
      </div>
    </Badge>
  );
}