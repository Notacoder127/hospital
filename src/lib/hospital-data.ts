export type ReportStatus = "Normal" | "Needs Follow-up" | "Critical";

export interface Report {
  id: string;
  patientId: string;
  type: string;
  date: string;
  summary: string;
  status: ReportStatus;
}

export interface HospitalPatient {
  id: string;
  name: string;
  phone: string;
  address: string;
  emergencyContact: { name: string; phone: string };
  lastReportDate: string;
  latestStatus: ReportStatus;
}

export interface EmergencyAlert {
  id: string;
  patientId: string;
  patientName: string;
  reportType: string;
  triggeredAt: string;
  address: string;
  nearestHospital: { name: string; distanceKm: number; mapsUrl: string };
  log: { timestamp: string; message: string }[];
}

export const hospitalInfo = {
  name: "Bay Medical Center",
  staff: "Dr. Anjali Rao",
};

export const hospitalPatients: HospitalPatient[] = [
  {
    id: "p1",
    name: "Eleanor Whitaker",
    phone: "+1 (415) 555-0142",
    address: "248 Linden Ave, San Francisco, CA",
    emergencyContact: { name: "Margaret Whitaker", phone: "+1 (415) 555-0188" },
    lastReportDate: "2026-06-12",
    latestStatus: "Critical",
  },
  {
    id: "p2",
    name: "Robert Chen",
    phone: "+1 (415) 555-0199",
    address: "1820 Fillmore St, San Francisco, CA",
    emergencyContact: { name: "Lily Chen", phone: "+1 (415) 555-0201" },
    lastReportDate: "2026-06-10",
    latestStatus: "Needs Follow-up",
  },
  {
    id: "p3",
    name: "Maria Gonzalez",
    phone: "+1 (415) 555-0166",
    address: "55 Valencia St, San Francisco, CA",
    emergencyContact: { name: "Carlos Gonzalez", phone: "+1 (415) 555-0177" },
    lastReportDate: "2026-06-08",
    latestStatus: "Normal",
  },
  {
    id: "p4",
    name: "James O'Connor",
    phone: "+1 (415) 555-0122",
    address: "910 Irving St, San Francisco, CA",
    emergencyContact: { name: "Sarah O'Connor", phone: "+1 (415) 555-0133" },
    lastReportDate: "2026-06-05",
    latestStatus: "Normal",
  },
  {
    id: "p5",
    name: "Aiko Tanaka",
    phone: "+1 (415) 555-0144",
    address: "300 Post St, San Francisco, CA",
    emergencyContact: { name: "Kenji Tanaka", phone: "+1 (415) 555-0155" },
    lastReportDate: "2026-06-02",
    latestStatus: "Needs Follow-up",
  },
];

export const emergencyAlerts: EmergencyAlert[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Eleanor Whitaker",
    reportType: "Cardiac enzyme panel",
    triggeredAt: "2026-06-12T14:22:00",
    address: "248 Linden Ave, San Francisco, CA",
    nearestHospital: {
      name: "UCSF Medical Center",
      distanceKm: 2.4,
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=UCSF+Medical+Center+San+Francisco",
    },
    log: [
      { timestamp: "2026-06-12T14:22:00", message: "Critical report uploaded by Dr. Rao" },
      { timestamp: "2026-06-12T14:22:08", message: "SMS sent to patient (+1 415-555-0142)" },
      { timestamp: "2026-06-12T14:22:09", message: "Voice call placed to emergency contact" },
      { timestamp: "2026-06-12T14:22:30", message: "Emergency services notified — handoff to 911" },
    ],
  },
];

export const statusColor: Record<ReportStatus, string> = {
  Normal: "bg-[oklch(0.92_0.08_155)] text-[oklch(0.32_0.1_155)] border-[oklch(0.7_0.12_155)]",
  "Needs Follow-up":
    "bg-[oklch(0.94_0.1_80)] text-[oklch(0.35_0.1_70)] border-[oklch(0.75_0.14_75)]",
  Critical: "bg-emergency/15 text-emergency border-emergency/40",
};
