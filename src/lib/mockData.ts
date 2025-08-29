// Mock data for the discharge orchestration system
import { Patient, Encounter, Signal, Task, Facility, PlacementRequest, TransportOrder, ScoreSnapshot, User } from '@/types';

export const mockUsers: User[] = [
  { id: '1', email: 'dr.smith@hospital.com', name: 'Dr. Sarah Smith', role: 'doctor' },
  { id: '2', email: 'jane.doe@hospital.com', name: 'Jane Doe', role: 'case_manager' },
  { id: '3', email: 'bob.nurse@hospital.com', name: 'Bob Johnson', role: 'nurse' },
  { id: '4', email: 'admin@hospital.com', name: 'System Admin', role: 'admin' },
];

export const mockFacilities: Facility[] = [
  { id: '1', name: 'Sunrise Manor SNF', kind: 'SNF', distanceMi: 2.5, capacityStatus: 'open', contactEmail: 'intake@sunrisemanor.com' },
  { id: '2', name: 'Compassionate Care Home Health', kind: 'HomeHealth', distanceMi: 0.8, capacityStatus: 'limited', contactEmail: 'referrals@cchealth.com' },
  { id: '3', name: 'Premier Rehabilitation Center', kind: 'Rehab', distanceMi: 4.2, capacityStatus: 'open', contactEmail: 'admissions@premierrehab.com' },
  { id: '4', name: 'Peaceful Paths Hospice', kind: 'Hospice', distanceMi: 1.9, capacityStatus: 'full', contactEmail: 'coordinator@peacefulpaths.org' },
  { id: '5', name: 'Golden Years SNF', kind: 'SNF', distanceMi: 6.1, capacityStatus: 'limited', contactEmail: 'placement@goldenyears.com' },
  { id: '6', name: 'Recovery Plus Rehab', kind: 'Rehab', distanceMi: 3.7, capacityStatus: 'open', contactEmail: 'intake@recoveryplus.com' },
];

const mockPatients: Patient[] = [
  { id: '1', mrnExt: 'MRN123456', name: 'Margaret Chen', dob: '1942-03-15', sex: 'F', payer: 'Medicare', unit: 'Gen Med', room: '312A', service: 'Hospitalist', admitTs: '2025-08-27T14:30:00Z', losDays: 2 },
  { id: '2', mrnExt: 'MRN234567', name: 'Robert Williams', dob: '1938-07-22', sex: 'M', payer: 'Medicare', unit: 'Post-Op', room: '205B', service: 'Surgery', admitTs: '2025-08-25T09:15:00Z', losDays: 4 },
  { id: '3', mrnExt: 'MRN345678', name: 'Linda Rodriguez', dob: '1955-11-08', sex: 'F', payer: 'Medicaid', unit: 'Gen Med', room: '418C', service: 'Hospitalist', admitTs: '2025-08-24T16:45:00Z', losDays: 5 },
  { id: '4', mrnExt: 'MRN456789', name: 'James Thompson', dob: '1965-02-14', sex: 'M', payer: 'Blue Cross', unit: 'Post-Op', room: '301A', service: 'Cardiology', admitTs: '2025-08-28T11:20:00Z', losDays: 1 },
  { id: '5', mrnExt: 'MRN567890', name: 'Mary Johnson', dob: '1950-09-30', sex: 'F', payer: 'Medicare', unit: 'Gen Med', room: '220B', service: 'Hospitalist', admitTs: '2025-08-22T08:00:00Z', losDays: 7 },
  { id: '6', mrnExt: 'MRN678901', name: 'David Lee', dob: '1960-05-18', sex: 'M', payer: 'Aetna', unit: 'Post-Op', room: '415A', service: 'Orthopedics', admitTs: '2025-08-26T13:30:00Z', losDays: 3 },
  { id: '7', mrnExt: 'MRN789012', name: 'Patricia Brown', dob: '1945-12-03', sex: 'F', payer: 'Medicare', unit: 'Gen Med', room: '325C', service: 'Internal Medicine', admitTs: '2025-08-23T10:15:00Z', losDays: 6 },
  { id: '8', mrnExt: 'MRN890123', name: 'Michael Davis', dob: '1952-08-27', sex: 'M', payer: 'United Health', unit: 'Post-Op', room: '202A', service: 'Surgery', admitTs: '2025-08-27T15:45:00Z', losDays: 2 },
];

// Helper function to compute readiness score
export function computeReadinessScore(signals: Signal[]): { score: number; label: 'Green' | 'Yellow' | 'Red'; pendingCount: number; criticalCount: number } {
  const pendingSignals = signals.filter(s => s.status === 'pending');
  const pendingCount = pendingSignals.length;
  const criticalCount = pendingSignals.filter(s => s.kind === 'insurance').length;

  if (criticalCount > 0 || pendingCount >= 3) {
    return { score: 25, label: 'Red', pendingCount, criticalCount };
  } else if (pendingCount >= 1) {
    return { score: 60, label: 'Yellow', pendingCount, criticalCount };
  } else {
    return { score: 95, label: 'Green', pendingCount, criticalCount };
  }
}

// Mock encounters with varied signal statuses
export const mockEncounters: Encounter[] = [
  {
    id: '1',
    patientId: '1',
    status: 'active',
    startedDischargeTs: '2025-08-29T08:00:00Z',
    patient: mockPatients[0],
    signals: [
      { id: 's1', encounterId: '1', kind: 'insurance', status: 'pending', lastUpdatedTs: '2025-08-29T08:00:00Z' },
      { id: 's2', encounterId: '1', kind: 'pharmacy', status: 'complete', lastUpdatedTs: '2025-08-29T09:30:00Z' },
      { id: 's3', encounterId: '1', kind: 'education', status: 'pending', lastUpdatedTs: '2025-08-29T08:15:00Z' },
      { id: 's4', encounterId: '1', kind: 'placement', status: 'pending', lastUpdatedTs: '2025-08-29T08:30:00Z' },
    ],
    tasks: [
      { id: 't1', encounterId: '1', type: 'Insurance Authorization', ownerRole: 'case_manager', status: 'in_progress', priority: 1, dueTs: '2025-08-29T16:00:00Z' },
      { id: 't2', encounterId: '1', type: 'Patient Education', ownerRole: 'nurse', status: 'open', priority: 2, dueTs: '2025-08-29T14:00:00Z' },
    ],
    placements: [
      { id: 'p1', encounterId: '1', facilityId: '1', status: 'sent', packetSentTs: '2025-08-29T09:00:00Z', facility: mockFacilities[0] },
    ],
    transportOrders: [],
    scoreSnapshots: [],
  },
  {
    id: '2',
    patientId: '2',
    status: 'active',
    startedDischargeTs: '2025-08-29T06:30:00Z',
    patient: mockPatients[1],
    signals: [
      { id: 's5', encounterId: '2', kind: 'labs', status: 'complete', lastUpdatedTs: '2025-08-29T07:00:00Z' },
      { id: 's6', encounterId: '2', kind: 'pharmacy', status: 'complete', lastUpdatedTs: '2025-08-29T08:00:00Z' },
      { id: 's7', encounterId: '2', kind: 'education', status: 'complete', lastUpdatedTs: '2025-08-29T09:00:00Z' },
      { id: 's8', encounterId: '2', kind: 'transport', status: 'complete', lastUpdatedTs: '2025-08-29T10:00:00Z' },
    ],
    tasks: [
      { id: 't3', encounterId: '2', type: 'Discharge Summary', ownerRole: 'doctor', status: 'complete', priority: 1, completedTs: '2025-08-29T09:30:00Z' },
    ],
    placements: [],
    transportOrders: [
      { id: 'to1', encounterId: '2', vendor: 'MedTransport Inc', pickupTs: '2025-08-29T14:00:00Z', status: 'scheduled' },
    ],
    scoreSnapshots: [],
  },
  {
    id: '3',
    patientId: '3',
    status: 'active',
    startedDischargeTs: '2025-08-29T07:15:00Z',
    patient: mockPatients[2],
    signals: [
      { id: 's9', encounterId: '3', kind: 'pharmacy', status: 'pending', lastUpdatedTs: '2025-08-29T07:15:00Z' },
      { id: 's10', encounterId: '3', kind: 'education', status: 'pending', lastUpdatedTs: '2025-08-29T07:30:00Z' },
      { id: 's11', encounterId: '3', kind: 'labs', status: 'complete', lastUpdatedTs: '2025-08-29T08:00:00Z' },
    ],
    tasks: [
      { id: 't4', encounterId: '3', type: 'Medication Reconciliation', ownerRole: 'nurse', status: 'open', priority: 1, dueTs: '2025-08-29T15:00:00Z' },
      { id: 't5', encounterId: '3', type: 'Follow-up Appointment', ownerRole: 'case_manager', status: 'open', priority: 2, dueTs: '2025-08-30T09:00:00Z' },
    ],
    placements: [],
    transportOrders: [],
    scoreSnapshots: [],
  },
  {
    id: '4',
    patientId: '4',
    status: 'active',
    patient: mockPatients[3],
    signals: [
      { id: 's12', encounterId: '4', kind: 'labs', status: 'complete', lastUpdatedTs: '2025-08-29T06:00:00Z' },
      { id: 's13', encounterId: '4', kind: 'imaging', status: 'complete', lastUpdatedTs: '2025-08-29T07:00:00Z' },
    ],
    tasks: [],
    placements: [],
    transportOrders: [],
    scoreSnapshots: [],
  },
  // Additional encounters for variety
  ...mockPatients.slice(4).map((patient, index) => ({
    id: `${index + 5}`,
    patientId: patient.id,
    status: 'active' as const,
    patient,
    signals: index % 2 === 0 ? [
      { id: `s${14 + index * 2}`, encounterId: `${index + 5}`, kind: 'pharmacy' as const, status: 'pending' as const, lastUpdatedTs: '2025-08-29T08:00:00Z' },
    ] : [
      { id: `s${14 + index * 2}`, encounterId: `${index + 5}`, kind: 'labs' as const, status: 'complete' as const, lastUpdatedTs: '2025-08-29T07:00:00Z' },
      { id: `s${15 + index * 2}`, encounterId: `${index + 5}`, kind: 'education' as const, status: 'complete' as const, lastUpdatedTs: '2025-08-29T08:00:00Z' },
    ],
    tasks: [],
    placements: [],
    transportOrders: [],
    scoreSnapshots: [],
  })),
];

// Add computed scores to encounters
mockEncounters.forEach(encounter => {
  const score = computeReadinessScore(encounter.signals);
  encounter.scoreSnapshots = [{
    id: `ss${encounter.id}`,
    encounterId: encounter.id,
    ...score,
    computedTs: new Date().toISOString(),
    breakdown: encounter.signals
      .filter(s => s.status === 'pending')
      .map(s => ({
        kind: s.kind,
        since: s.lastUpdatedTs,
        lastUpdatedTs: s.lastUpdatedTs,
      })),
  }];
});