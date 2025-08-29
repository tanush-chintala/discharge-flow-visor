// Core types for the discharge orchestration system

export type UserRole = 'doctor' | 'case_manager' | 'nurse' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  mrnExt: string;
  name: string;
  dob: string;
  sex: 'M' | 'F' | 'Other';
  payer?: string;
  unit?: string;
  room?: string;
  service?: string;
  admitTs: string;
  losDays: number;
}

export type EncounterStatus = 'active' | 'discharged';

export interface Encounter {
  id: string;
  patientId: string;
  status: EncounterStatus;
  startedDischargeTs?: string;
  dischargeReadyTs?: string;
  leftUnitTs?: string;
  patient: Patient;
  signals: Signal[];
  tasks: Task[];
  placements: PlacementRequest[];
  transportOrders: TransportOrder[];
  scoreSnapshots: ScoreSnapshot[];
}

export type SignalKind = 'labs' | 'imaging' | 'pharmacy' | 'insurance' | 'education' | 'placement' | 'transport';
export type SignalStatus = 'pending' | 'complete' | 'error';

export interface Signal {
  id: string;
  encounterId: string;
  kind: SignalKind;
  status: SignalStatus;
  details?: any;
  lastUpdatedTs: string;
}

export type TaskStatus = 'open' | 'in_progress' | 'complete';

export interface Task {
  id: string;
  encounterId: string;
  type: string;
  ownerRole?: UserRole;
  ownerUserId?: string;
  status: TaskStatus;
  priority: 1 | 2 | 3; // 1=high, 2=med, 3=low
  dueTs?: string;
  completedTs?: string;
  notes?: string;
}

export type FacilityKind = 'SNF' | 'HomeHealth' | 'Rehab' | 'Hospice';
export type CapacityStatus = 'open' | 'limited' | 'full';

export interface Facility {
  id: string;
  name: string;
  kind: FacilityKind;
  distanceMi?: number;
  capacityStatus?: CapacityStatus;
  contactEmail?: string;
}

export type PlacementStatus = 'draft' | 'sent' | 'responded' | 'accepted' | 'declined';

export interface PlacementRequest {
  id: string;
  encounterId: string;
  facilityId: string;
  status: PlacementStatus;
  packetSentTs?: string;
  acceptedTs?: string;
  notes?: string;
  facility: Facility;
}

export type TransportStatus = 'requested' | 'scheduled' | 'en_route' | 'departed_unit';

export interface TransportOrder {
  id: string;
  encounterId: string;
  vendor?: string;
  pickupTs?: string;
  status: TransportStatus;
  notes?: string;
}

export type ScoreLabel = 'Green' | 'Yellow' | 'Red';

export interface ScoreBreakdown {
  kind: SignalKind;
  since: string;
  lastUpdatedTs: string;
}

export interface ScoreSnapshot {
  id: string;
  encounterId: string;
  score: number;
  label: ScoreLabel;
  pendingCount: number;
  criticalCount: number;
  computedTs: string;
  breakdown: ScoreBreakdown[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}