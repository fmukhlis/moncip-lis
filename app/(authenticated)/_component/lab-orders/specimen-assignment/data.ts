import {
  LabOrderStatus,
  PatientSex,
  LabOrderPriority,
  LisPerformableType,
  LabOrderItemStatus,
  SpecimenStatus,
} from "@/generated/prisma";

/**
 * UI-only projection of an order-level worklist row.
 *
 * Mirrors `LabOrder` -> `LabOrderItem` -> `LabOrderItemSpecimen` -> `Specimen`
 * -> `SpecimenType`, which is everything the specimen assignment worklist needs
 * to render a card. Replace `SPECIMEN_ASSIGNMENT_ORDERS` with
 * `useGetLabOrdersActionQuery` once the worklist is wired to the server.
 */

export type SpecimenAssignmentSpecimenType = {
  id: string;
  displayName: string;
};

export type SpecimenAssignmentSpecimen = {
  id: string;
  no: string;
  status: SpecimenStatus;
  specimenType: SpecimenAssignmentSpecimenType;
};

export type SpecimenAssignmentOrderItem = {
  id: string;
  status: LabOrderItemStatus;
  priority: LabOrderPriority | null;
  performable: {
    id: string;
    displayName: string;
    type: LisPerformableType;
    specimenTypes: {
      isDefault: boolean;
      specimenType: SpecimenAssignmentSpecimenType;
    }[];
  };
  specimens: {
    id: string;
    /** `null` means the specimen is still actively assigned to this item. */
    endedAt: string | null;
    specimen: SpecimenAssignmentSpecimen;
  }[];
};

export type SpecimenAssignmentOrder = {
  id: string;
  no: string;
  status: LabOrderStatus;
  priority: LabOrderPriority;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    mrn: string | null;
    dateOfBirth: string;
    sex: PatientSex;
  };
  items: SpecimenAssignmentOrderItem[];
};

export const PATIENT_SEX_LABEL = {
  MALE: "Male",
  FEMALE: "Female",
  UNKNOWN: "Unknown",
} as Record<keyof typeof PatientSex, string>;

const EDTA: SpecimenAssignmentSpecimenType = {
  id: "cm0spectype00000000000001",
  displayName: "EDTA Whole Blood",
};
const SERUM: SpecimenAssignmentSpecimenType = {
  id: "cm0spectype00000000000002",
  displayName: "Serum",
};
const CITRATE: SpecimenAssignmentSpecimenType = {
  id: "cm0spectype00000000000003",
  displayName: "Sodium Citrate",
};
const FLUORIDE: SpecimenAssignmentSpecimenType = {
  id: "cm0spectype00000000000004",
  displayName: "Sodium Fluoride",
};
const URINE: SpecimenAssignmentSpecimenType = {
  id: "cm0spectype00000000000005",
  displayName: "Urine",
};
const URINE_STERILE: SpecimenAssignmentSpecimenType = {
  id: "cm0spectype00000000000006",
  displayName: "Urine (Sterile)",
};

function createItem({
  id,
  displayName,
  specimenTypes,
  type = LisPerformableType.SINGLE,
  priority = null,
  status = LabOrderItemStatus.OPEN,
  assignedSpecimen,
  endedSpecimen,
}: {
  id: string;
  displayName: string;
  specimenTypes: {
    specimenType: SpecimenAssignmentSpecimenType;
    isDefault?: boolean;
  }[];
  type?: LisPerformableType;
  priority?: LabOrderPriority | null;
  status?: LabOrderItemStatus;
  assignedSpecimen?: SpecimenAssignmentSpecimen;
  endedSpecimen?: SpecimenAssignmentSpecimen;
}): SpecimenAssignmentOrderItem {
  const specimens: SpecimenAssignmentOrderItem["specimens"] = [];

  if (endedSpecimen) {
    specimens.push({
      id: `${id}prevs`,
      endedAt: "2026-11-02T21:10:00.000Z",
      specimen: endedSpecimen,
    });
  }

  if (assignedSpecimen) {
    specimens.push({
      id: `${id}activ`,
      endedAt: null,
      specimen: assignedSpecimen,
    });
  }

  return {
    id,
    status,
    priority,
    performable: {
      id: `${id}perf`,
      displayName,
      type,
      specimenTypes: specimenTypes.map(({ specimenType, isDefault }) => ({
        isDefault: isDefault ?? false,
        specimenType,
      })),
    },
    specimens,
  };
}

/**
 * Worklist rows: an order is listed while at least one non-cancelled item has
 * no active specimen assignment. Every row is `ORDERED`; orders that moved on
 * to processing are no longer part of the worklist.
 */
export const SPECIMEN_ASSIGNMENT_ORDERS: SpecimenAssignmentOrder[] = [
  {
    id: "cm0order000000000000001",
    no: "LO-20261103-0012",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.STAT,
    createdAt: "2026-11-03T02:14:00.000Z",
    patient: {
      id: "cm0patient000000000000001",
      name: "Budi Santoso",
      mrn: "RM-004821",
      dateOfBirth: "1987-04-12T00:00:00.000Z",
      sex: PatientSex.MALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000001",
        displayName: "Complete Blood Count",
        priority: LabOrderPriority.STAT,
        type: LisPerformableType.PANEL,
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000002",
        displayName: "HbA1c",
        priority: LabOrderPriority.STAT,
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000003",
        displayName: "Reticulocyte Count",
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000004",
        displayName: "Peripheral Blood Smear",
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
      }),
    ],
  },
  {
    id: "cm0order000000000000002",
    no: "LO-20261103-0011",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.URGENT,
    createdAt: "2026-11-03T01:52:00.000Z",
    patient: {
      id: "cm0patient000000000000002",
      name: "Siti Rahmawati",
      mrn: "RM-004818",
      dateOfBirth: "1992-09-03T00:00:00.000Z",
      sex: PatientSex.FEMALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000005",
        displayName: "Complete Blood Count",
        priority: LabOrderPriority.URGENT,
        type: LisPerformableType.PANEL,
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
        assignedSpecimen: {
          id: "cm0specimen000000000000001",
          no: "SP-20261103-0031",
          status: SpecimenStatus.PENDING,
          specimenType: EDTA,
        },
      }),
      createItem({
        id: "cm0item0000000000000006",
        displayName: "HbA1c",
        priority: LabOrderPriority.URGENT,
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
        assignedSpecimen: {
          id: "cm0specimen000000000000002",
          no: "SP-20261103-0032",
          status: SpecimenStatus.PENDING,
          specimenType: EDTA,
        },
      }),
      createItem({
        id: "cm0item0000000000000007",
        displayName: "Urinalysis",
        type: LisPerformableType.PANEL,
        specimenTypes: [{ specimenType: URINE, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000008",
        displayName: "Urine Culture",
        specimenTypes: [
          { specimenType: URINE, isDefault: true },
          { specimenType: URINE_STERILE },
        ],
      }),
    ],
  },
  {
    id: "cm0order000000000000003",
    no: "LO-20261103-0010",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.ROUTINE,
    createdAt: "2026-11-03T01:31:00.000Z",
    patient: {
      id: "cm0patient000000000000003",
      name: "Ahmad Fauzi",
      mrn: "RM-004809",
      dateOfBirth: "1975-01-28T00:00:00.000Z",
      sex: PatientSex.MALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000009",
        displayName: "Fasting Blood Glucose",
        specimenTypes: [{ specimenType: FLUORIDE, isDefault: true }],
        assignedSpecimen: {
          id: "cm0specimen000000000000003",
          no: "SP-20261103-0033",
          status: SpecimenStatus.PENDING,
          specimenType: FLUORIDE,
        },
      }),
      createItem({
        id: "cm0item0000000000000010",
        displayName: "Lipid Profile",
        priority: LabOrderPriority.ROUTINE,
        type: LisPerformableType.PANEL,
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000011",
        displayName: "Liver Function Test",
        priority: LabOrderPriority.ROUTINE,
        type: LisPerformableType.PANEL,
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
      }),
    ],
  },
  {
    id: "cm0order000000000000004",
    no: "LO-20261103-0009",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.ROUTINE,
    createdAt: "2026-11-03T01:05:00.000Z",
    patient: {
      id: "cm0patient000000000000004",
      name: "Dewi Lestari",
      mrn: "RM-004804",
      dateOfBirth: "2000-06-17T00:00:00.000Z",
      sex: PatientSex.FEMALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000012",
        displayName: "Urinalysis",
        type: LisPerformableType.PANEL,
        specimenTypes: [{ specimenType: URINE, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000013",
        displayName: "Urine Culture",
        specimenTypes: [
          { specimenType: URINE, isDefault: true },
          { specimenType: URINE_STERILE },
        ],
      }),
    ],
  },
  {
    id: "cm0order000000000000005",
    no: "LO-20261103-0008",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.URGENT,
    createdAt: "2026-11-03T00:48:00.000Z",
    patient: {
      id: "cm0patient000000000000005",
      name: "Maya Putri",
      mrn: "RM-004799",
      dateOfBirth: "1989-12-05T00:00:00.000Z",
      sex: PatientSex.FEMALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000014",
        displayName: "Creatinine",
        priority: LabOrderPriority.URGENT,
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
        assignedSpecimen: {
          id: "cm0specimen000000000000004",
          no: "SP-20261103-0035",
          status: SpecimenStatus.PENDING,
          specimenType: SERUM,
        },
      }),
      createItem({
        id: "cm0item0000000000000015",
        displayName: "Electrolytes",
        type: LisPerformableType.PANEL,
        status: LabOrderItemStatus.CANCELLED,
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000016",
        displayName: "PT/INR",
        priority: LabOrderPriority.URGENT,
        specimenTypes: [{ specimenType: CITRATE, isDefault: true }],
      }),
    ],
  },
  {
    id: "cm0order000000000000006",
    no: "LO-20261103-0007",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.ROUTINE,
    createdAt: "2026-11-03T00:22:00.000Z",
    patient: {
      id: "cm0patient000000000000006",
      name: "I Made Wirawan",
      mrn: "RM-004790",
      dateOfBirth: "1968-03-21T00:00:00.000Z",
      sex: PatientSex.MALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000017",
        displayName: "Complete Blood Count",
        type: LisPerformableType.PANEL,
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
        assignedSpecimen: {
          id: "cm0specimen000000000000005",
          no: "SP-20261103-0036",
          status: SpecimenStatus.PENDING,
          specimenType: EDTA,
        },
      }),
      createItem({
        id: "cm0item0000000000000018",
        displayName: "Erythrocyte Sedimentation Rate",
        priority: LabOrderPriority.ROUTINE,
        specimenTypes: [{ specimenType: EDTA, isDefault: true }],
      }),
    ],
  },
  {
    id: "cm0order000000000000007",
    no: "LO-20261103-0006",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.STAT,
    createdAt: "2026-11-03T00:07:00.000Z",
    patient: {
      id: "cm0patient000000000000007",
      name: "Rina Marlina",
      mrn: "RM-004787",
      dateOfBirth: "1995-08-30T00:00:00.000Z",
      sex: PatientSex.FEMALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000019",
        displayName: "Troponin I",
        priority: LabOrderPriority.STAT,
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
      }),
    ],
  },
  {
    id: "cm0order000000000000008",
    no: "LO-20261102-0005",
    status: LabOrderStatus.ORDERED,
    priority: LabOrderPriority.ROUTINE,
    createdAt: "2026-11-02T23:41:00.000Z",
    patient: {
      id: "cm0patient000000000000008",
      name: "Yohanes Pratama",
      mrn: "RM-004781",
      dateOfBirth: "1982-11-11T00:00:00.000Z",
      sex: PatientSex.MALE,
    },
    items: [
      createItem({
        id: "cm0item0000000000000020",
        displayName: "Urea",
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
        assignedSpecimen: {
          id: "cm0specimen000000000000006",
          no: "SP-20261103-0028",
          status: SpecimenStatus.PENDING,
          specimenType: SERUM,
        },
      }),
      createItem({
        id: "cm0item0000000000000021",
        displayName: "Creatinine",
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
        assignedSpecimen: {
          id: "cm0specimen000000000000007",
          no: "SP-20261103-0029",
          status: SpecimenStatus.PENDING,
          specimenType: SERUM,
        },
      }),
      createItem({
        id: "cm0item0000000000000022",
        displayName: "Uric Acid",
        priority: LabOrderPriority.ROUTINE,
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000023",
        displayName: "Total Protein",
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
      }),
      createItem({
        id: "cm0item0000000000000024",
        displayName: "Albumin",
        priority: LabOrderPriority.ROUTINE,
        specimenTypes: [{ specimenType: SERUM, isDefault: true }],
        endedSpecimen: {
          id: "cm0specimen000000000000008",
          no: "SP-20261103-0027",
          status: SpecimenStatus.REJECTED,
          specimenType: SERUM,
        },
      }),
    ],
  },
];

/** The specimen that is currently assigned to an order item, if any. */
export function getActiveSpecimenAssignment(
  item: SpecimenAssignmentOrderItem,
): SpecimenAssignmentOrderItem["specimens"][number] | undefined {
  return item.specimens.find(({ endedAt }) => !endedAt);
}

/** Items that count towards the progress, i.e. cancelled items excluded. */
export function getEligibleItems(
  order: SpecimenAssignmentOrder,
): SpecimenAssignmentOrderItem[] {
  return order.items.filter(
    ({ status }) => status !== LabOrderItemStatus.CANCELLED,
  );
}

export function getOrderProgress(order: SpecimenAssignmentOrder) {
  const eligibleItems = getEligibleItems(order);
  const assigned = eligibleItems.filter((item) =>
    getActiveSpecimenAssignment(item),
  ).length;
  const total = eligibleItems.length;

  return {
    assigned,
    total,
    percentage: total === 0 ? 0 : Math.round((assigned / total) * 100),
  };
}
