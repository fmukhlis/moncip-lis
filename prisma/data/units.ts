import { Prisma } from "@/generated/prisma";

export const unitsData: Prisma.UnitCreateInput[] = [
  // ---------------------------------------------------------------------------
  // Mass Concentration
  // ---------------------------------------------------------------------------
  {
    code: "g/dL",
    displayName: "g/dL",
    description: "Grams per deciliter.",
  },
  {
    code: "g/L",
    displayName: "g/L",
    description: "Grams per liter.",
  },
  {
    code: "mg/dL",
    displayName: "mg/dL",
    description: "Milligrams per deciliter.",
  },
  {
    code: "mg/L",
    displayName: "mg/L",
    description: "Milligrams per liter.",
  },
  {
    code: "ug/dL",
    displayName: "μg/dL",
    description: "Micrograms per deciliter.",
  },
  {
    code: "ug/L",
    displayName: "μg/L",
    description: "Micrograms per liter.",
  },
  {
    code: "ng/mL",
    displayName: "ng/mL",
    description: "Nanograms per milliliter.",
  },
  {
    code: "pg/mL",
    displayName: "pg/mL",
    description: "Picograms per milliliter.",
  },

  // ---------------------------------------------------------------------------
  // Amount Concentration
  // ---------------------------------------------------------------------------
  {
    code: "mol/L",
    displayName: "mol/L",
    description: "Moles per liter.",
  },
  {
    code: "mmol/L",
    displayName: "mmol/L",
    description: "Millimoles per liter.",
  },
  {
    code: "umol/L",
    displayName: "μmol/L",
    description: "Micromoles per liter.",
  },
  {
    code: "nmol/L",
    displayName: "nmol/L",
    description: "Nanomoles per liter.",
  },
  {
    code: "pmol/L",
    displayName: "pmol/L",
    description: "Picomoles per liter.",
  },
  {
    code: "mEq/L",
    displayName: "mEq/L",
    description: "Milliequivalents per liter.",
  },

  // ---------------------------------------------------------------------------
  // Enzyme / Biological Activity
  // ---------------------------------------------------------------------------
  {
    code: "U/L",
    displayName: "U/L",
    description: "Enzyme units per liter.",
  },
  {
    code: "IU/L",
    displayName: "IU/L",
    description: "International units per liter.",
  },
  {
    code: "IU/mL",
    displayName: "IU/mL",
    description: "International units per milliliter.",
  },
  {
    code: "mIU/L",
    displayName: "mIU/L",
    description: "Milli-international units per liter.",
  },
  {
    code: "uIU/mL",
    displayName: "μIU/mL",
    description: "Micro-international units per milliliter.",
  },

  // ---------------------------------------------------------------------------
  // Cell Count
  // ---------------------------------------------------------------------------
  {
    code: "10*3/uL",
    displayName: "10³/μL",
    description: "Thousands of cells per microliter.",
  },
  {
    code: "10*6/uL",
    displayName: "10⁶/μL",
    description: "Millions of cells per microliter.",
  },
  {
    code: "/uL",
    displayName: "/μL",
    description: "Cells per microliter.",
  },

  // ---------------------------------------------------------------------------
  // Volume
  // ---------------------------------------------------------------------------
  {
    code: "L",
    displayName: "L",
    description: "Liters.",
  },
  {
    code: "dL",
    displayName: "dL",
    description: "Deciliters.",
  },
  {
    code: "mL",
    displayName: "mL",
    description: "Milliliters.",
  },
  {
    code: "uL",
    displayName: "μL",
    description: "Microliters.",
  },
  {
    code: "fL",
    displayName: "fL",
    description: "Femtoliters.",
  },

  // ---------------------------------------------------------------------------
  // Mass
  // ---------------------------------------------------------------------------
  {
    code: "pg",
    displayName: "pg",
    description: "Picograms.",
  },

  // ---------------------------------------------------------------------------
  // Time
  // ---------------------------------------------------------------------------
  {
    code: "s",
    displayName: "s",
    description: "Seconds.",
  },
  {
    code: "min",
    displayName: "min",
    description: "Minutes.",
  },
  {
    code: "h",
    displayName: "h",
    description: "Hours.",
  },

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  {
    code: "mg/24h",
    displayName: "mg/24 h",
    description: "Milligrams per 24 hours.",
  },
  {
    code: "mL/min",
    displayName: "mL/min",
    description: "Milliliters per minute.",
  },
  {
    code: "mL/min/1.73m²",
    displayName: "mL/min/1.73 m²",
    description:
      "Milliliters per minute normalized to 1.73 square meters of body surface area.",
  },
  {
    code: "mOsm/kg",
    displayName: "mOsm/kg",
    description: "Milliosmoles per kilogram.",
  },

  // ---------------------------------------------------------------------------
  // Pressure
  // ---------------------------------------------------------------------------
  {
    code: "mmHg",
    displayName: "mmHg",
    description: "Millimeters of mercury.",
  },
  {
    code: "kPa",
    displayName: "kPa",
    description: "Kilopascals.",
  },

  // ---------------------------------------------------------------------------
  // Percentage
  // ---------------------------------------------------------------------------
  {
    code: "%",
    displayName: "%",
    description: "Percentage.",
  },

  // ---------------------------------------------------------------------------
  // Dimensionless
  // ---------------------------------------------------------------------------
  {
    code: "ratio",
    displayName: "Ratio",
    description: "Dimensionless ratio.",
  },
  {
    code: "index",
    displayName: "Index",
    description: "Dimensionless index.",
  },
  {
    code: "COI",
    displayName: "COI",
    description: "Cut-off index.",
  },
  {
    code: "titer",
    displayName: "Titer",
    description: "Antibody titer.",
  },

  // ---------------------------------------------------------------------------
  // Molecular
  // ---------------------------------------------------------------------------
  {
    code: "copies/mL",
    displayName: "copies/mL",
    description: "Copies per milliliter.",
  },
  {
    code: "copies/uL",
    displayName: "copies/μL",
    description: "Copies per microliter.",
  },

  // ---------------------------------------------------------------------------
  // Immunology
  // ---------------------------------------------------------------------------
  {
    code: "AU/mL",
    displayName: "AU/mL",
    description: "Arbitrary units per milliliter.",
  },
  {
    code: "BAU/mL",
    displayName: "BAU/mL",
    description: "Binding antibody units per milliliter.",
  },
  {
    code: "kU/L",
    displayName: "kU/L",
    description: "Kilo units per liter.",
  },
] as const;
