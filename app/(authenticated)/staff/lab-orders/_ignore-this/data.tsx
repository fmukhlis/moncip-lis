// UI-only prototype: static mock data + pure helpers. No backend logic.

export type Priority = "STAT" | "URGENT" | "ROUTINE";
export type AssignmentStatus = "UNASSIGNED" | "ASSIGNED";
// Audit metadata only. Never a lifecycle status.
export type AssignmentMethod = "AUTOMATIC" | "MANUAL";

export interface SpecimenType {
  id: string;
  name: string;
  container: string;
  available: boolean;
  unavailableReason?: string;
}

export interface Performable {
  id: string;
  name: string;
  type: "SINGLE" | "PANEL";
  supportedSpecimenTypeIds: string[];
  defaultSpecimenTypeId: string | null;
}

export interface LabOrderItem {
  id: string;
  orderNo: string;
  patient: { name: string; mrn: string };
  performableId: string;
  priority: Priority;
  orderedAt: string; // local ISO, no timezone
  status: AssignmentStatus;
  assignment?: {
    specimenTypeId: string;
    specimenId: string;
    method: AssignmentMethod;
    assignedAt: string;
  };
  /** Prototype only: first save attempt fails, to demo the error state. */
  flakyOnce?: boolean;
}

export interface Specimen {
  id: string;
  typeId: string;
  mrn: string;
  orderNo: string;
  createdAt: string;
}

export type SpecimenChoice =
  | { kind: "existing"; id: string }
  | { kind: "new"; groupKey?: string };

export interface AssignmentPlan {
  itemId: string;
  typeId: string;
  method: AssignmentMethod;
  specimen: SpecimenChoice;
}

export const TODAY = "2026-11-03";

export const PRIORITY_RANK: Record<Priority, number> = {
  STAT: 0,
  URGENT: 1,
  ROUTINE: 2,
};

export const SPECIMEN_TYPES: Record<string, SpecimenType> = {
  edta: {
    id: "edta",
    name: "EDTA Whole Blood",
    container: "Lavender-top tube",
    available: true,
  },
  serum: {
    id: "serum",
    name: "Serum",
    container: "Gold-top SST tube",
    available: true,
  },
  citrate: {
    id: "citrate",
    name: "Sodium Citrate Plasma",
    container: "Light-blue-top tube",
    available: true,
  },
  fluoride: {
    id: "fluoride",
    name: "Fluoride Plasma",
    container: "Grey-top tube",
    available: true,
  },
  heparin: {
    id: "heparin",
    name: "Heparin Plasma",
    container: "Green-top tube",
    available: false,
    unavailableReason: "Tube stock depleted",
  },
  urine: {
    id: "urine",
    name: "Urine (Random)",
    container: "Urine cup",
    available: true,
  },
  urineSterile: {
    id: "urineSterile",
    name: "Urine (Midstream, Sterile)",
    container: "Sterile container",
    available: true,
  },
};

export const PERFORMABLES: Record<string, Performable> = {
  cbc: {
    id: "cbc",
    name: "Complete Blood Count",
    type: "PANEL",
    supportedSpecimenTypeIds: ["edta"],
    defaultSpecimenTypeId: "edta",
  },
  hba1c: {
    id: "hba1c",
    name: "HbA1c",
    type: "SINGLE",
    supportedSpecimenTypeIds: ["edta"],
    defaultSpecimenTypeId: "edta",
  },
  pbs: {
    id: "pbs",
    name: "Peripheral Blood Smear",
    type: "SINGLE",
    supportedSpecimenTypeIds: ["edta"],
    defaultSpecimenTypeId: "edta",
  },
  ua: {
    id: "ua",
    name: "Urinalysis (Complete)",
    type: "PANEL",
    supportedSpecimenTypeIds: ["urine"],
    defaultSpecimenTypeId: "urine",
  },
  uc: {
    id: "uc",
    name: "Urine Culture",
    type: "SINGLE",
    supportedSpecimenTypeIds: ["urineSterile"],
    defaultSpecimenTypeId: "urineSterile",
  },
  glu: {
    id: "glu",
    name: "Fasting Blood Glucose",
    type: "SINGLE",
    supportedSpecimenTypeIds: ["fluoride", "serum"],
    defaultSpecimenTypeId: "fluoride",
  },
  lipid: {
    id: "lipid",
    name: "Lipid Profile",
    type: "PANEL",
    supportedSpecimenTypeIds: ["serum", "heparin"],
    defaultSpecimenTypeId: "serum",
  },
  // No default configured -> automatic assignment is not possible.
  lft: {
    id: "lft",
    name: "Liver Function Panel",
    type: "PANEL",
    supportedSpecimenTypeIds: ["serum", "heparin"],
    defaultSpecimenTypeId: null,
  },
  crea: {
    id: "crea",
    name: "Creatinine",
    type: "SINGLE",
    supportedSpecimenTypeIds: ["serum", "heparin"],
    defaultSpecimenTypeId: "serum",
  },
  // Default exists but its tube is unavailable -> automatic assignment fails.
  elec: {
    id: "elec",
    name: "Electrolytes (Na, K, Cl)",
    type: "PANEL",
    supportedSpecimenTypeIds: ["heparin", "serum"],
    defaultSpecimenTypeId: "heparin",
  },
  pt: {
    id: "pt",
    name: "PT / INR",
    type: "SINGLE",
    supportedSpecimenTypeIds: ["citrate"],
    defaultSpecimenTypeId: "citrate",
  },
};

const PATIENTS = {
  budi: { name: "Budi Santoso", mrn: "RM-004821" },
  siti: { name: "Siti Rahmawati", mrn: "RM-003377" },
  ahmad: { name: "Ahmad Fauzi", mrn: "RM-005102" },
  dewi: { name: "Dewi Lestari", mrn: "RM-002984" },
  made: { name: "I Made Wirawan", mrn: "RM-004455" },
  rina: { name: "Rina Marlina", mrn: "RM-001872" },
  yohanes: { name: "Yohanes Pratama", mrn: "RM-005390" },
  aisyah: { name: "Nur Aisyah", mrn: "RM-003911" },
  hendra: { name: "Hendra Gunawan", mrn: "RM-002245" },
  maya: { name: "Maya Putri", mrn: "RM-004100" },
  agus: { name: "Agus Setiawan", mrn: "RM-001530" },
};

let seq = 0;
function mk(
  orderNo: string,
  patient: keyof typeof PATIENTS,
  performableId: string,
  priority: Priority,
  time: string,
  extra: Partial<LabOrderItem> = {},
): LabOrderItem {
  const date = `${orderNo.slice(3, 7)}-${orderNo.slice(7, 9)}-${orderNo.slice(9, 11)}`;
  return {
    id: `LOI-${String(++seq).padStart(4, "0")}`,
    orderNo,
    patient: PATIENTS[patient],
    performableId,
    priority,
    orderedAt: `${date}T${time}:00`,
    status: "UNASSIGNED",
    ...extra,
  };
}

const assigned = (
  specimenTypeId: string,
  specimenId: string,
  method: AssignmentMethod,
  time: string,
) => ({
  status: "ASSIGNED" as const,
  assignment: {
    specimenTypeId,
    specimenId,
    method,
    assignedAt: `${TODAY}T${time}:00`,
  },
});

export const SEED_ITEMS: LabOrderItem[] = [
  mk("LO-20261103-0012", "budi", "cbc", "STAT", "07:42"),
  mk("LO-20261103-0012", "budi", "elec", "STAT", "07:42"),
  mk("LO-20261103-0012", "budi", "crea", "STAT", "07:42"),
  mk("LO-20261103-0011", "siti", "cbc", "URGENT", "07:30"),
  mk("LO-20261103-0011", "siti", "hba1c", "URGENT", "07:30"),
  mk("LO-20261103-0011", "siti", "pbs", "URGENT", "07:30"),
  mk("LO-20261103-0011", "siti", "ua", "URGENT", "07:30"),
  mk("LO-20261103-0010", "ahmad", "glu", "ROUTINE", "07:05"),
  mk("LO-20261103-0010", "ahmad", "lipid", "ROUTINE", "07:05"),
  mk("LO-20261103-0010", "ahmad", "lft", "ROUTINE", "07:05"),
  mk("LO-20261103-0009", "dewi", "ua", "ROUTINE", "06:50"),
  mk("LO-20261103-0009", "dewi", "uc", "ROUTINE", "06:50"),
  mk("LO-20261103-0008", "made", "pt", "URGENT", "06:40"),
  mk("LO-20261103-0008", "made", "crea", "URGENT", "06:40"),
  mk("LO-20261103-0007", "rina", "cbc", "ROUTINE", "06:15"),
  mk("LO-20261103-0007", "rina", "hba1c", "ROUTINE", "06:15", {
    flakyOnce: true,
  }),
  mk("LO-20261103-0006", "yohanes", "cbc", "STAT", "05:58"),
  mk("LO-20261103-0006", "yohanes", "pt", "STAT", "05:58"),
  mk("LO-20261103-0006", "yohanes", "elec", "STAT", "05:58"),
  mk("LO-20261102-0087", "aisyah", "lipid", "ROUTINE", "16:20"),
  mk("LO-20261102-0087", "aisyah", "glu", "ROUTINE", "16:20"),
  mk("LO-20261102-0084", "hendra", "lft", "ROUTINE", "14:05"),
  mk("LO-20261102-0084", "hendra", "crea", "ROUTINE", "14:05"),
  // Already assigned today
  mk(
    "LO-20261103-0005",
    "maya",
    "cbc",
    "ROUTINE",
    "05:30",
    assigned("edta", "SPC-261103-004", "AUTOMATIC", "05:41"),
  ),
  mk(
    "LO-20261103-0005",
    "maya",
    "ua",
    "ROUTINE",
    "05:30",
    assigned("urine", "SPC-261103-005", "AUTOMATIC", "05:41"),
  ),
  mk(
    "LO-20261103-0004",
    "agus",
    "glu",
    "ROUTINE",
    "05:10",
    assigned("fluoride", "SPC-261103-003", "MANUAL", "05:22"),
  ),
  mk(
    "LO-20261103-0003",
    "ahmad",
    "crea",
    "ROUTINE",
    "04:55",
    assigned("serum", "SPC-261103-006", "AUTOMATIC", "05:12"),
  ),
];

export const SEED_SPECIMENS: Specimen[] = [
  {
    id: "SPC-261103-003",
    typeId: "fluoride",
    mrn: "RM-001530",
    orderNo: "LO-20261103-0004",
    createdAt: `${TODAY}T05:22:00`,
  },
  {
    id: "SPC-261103-004",
    typeId: "edta",
    mrn: "RM-004100",
    orderNo: "LO-20261103-0005",
    createdAt: `${TODAY}T05:41:00`,
  },
  {
    id: "SPC-261103-005",
    typeId: "urine",
    mrn: "RM-004100",
    orderNo: "LO-20261103-0005",
    createdAt: `${TODAY}T05:41:00`,
  },
  // Ahmad Fauzi already has a serum specimen from an earlier order today -> reuse candidate for Lipid Profile.
  {
    id: "SPC-261103-006",
    typeId: "serum",
    mrn: "RM-005102",
    orderNo: "LO-20261103-0003",
    createdAt: `${TODAY}T05:12:00`,
  },
];

export type AutoCheck =
  | { ok: true; typeId: string }
  | { ok: false; reason: string };

/** Simulated validation of the configured default specimen type. */
export function getAutoCheck(item: LabOrderItem): AutoCheck {
  const perf = PERFORMABLES[item.performableId];
  const defId = perf.defaultSpecimenTypeId;
  if (!defId) {
    return {
      ok: false,
      reason: `No default specimen type is configured for ${perf.name}. Select a specimen type manually.`,
    };
  }
  const type = SPECIMEN_TYPES[defId];
  if (!perf.supportedSpecimenTypeIds.includes(defId)) {
    return {
      ok: false,
      reason: `The configured default (${type.name}) is not a supported specimen type for ${perf.name}.`,
    };
  }
  if (!type.available) {
    return {
      ok: false,
      reason: `The default specimen type ${type.name} is currently unavailable (${type.unavailableReason}). Select another supported type.`,
    };
  }
  return { ok: true, typeId: defId };
}

export function buildBulkPlan(items: LabOrderItem[], specimens: Specimen[]) {
  const rows: { item: LabOrderItem; plan: AssignmentPlan; reuseId?: string }[] =
    [];
  const skipped: { item: LabOrderItem; reason: string }[] = [];
  const newGroups = new Map<string, number>();

  for (const item of items) {
    const check = getAutoCheck(item);
    if (!check.ok) {
      skipped.push({ item, reason: check.reason });
      continue;
    }
    const existing = specimens.find(
      (s) => s.mrn === item.patient.mrn && s.typeId === check.typeId,
    );
    const groupKey = `${item.orderNo}:${check.typeId}`; // one new specimen per order + type
    if (!existing) newGroups.set(groupKey, (newGroups.get(groupKey) ?? 0) + 1);
    rows.push({
      item,
      reuseId: existing?.id,
      plan: {
        itemId: item.id,
        typeId: check.typeId,
        method: "AUTOMATIC",
        specimen: existing
          ? { kind: "existing", id: existing.id }
          : { kind: "new", groupKey },
      },
    });
  }
  return { rows, skipped, newGroups };
}
