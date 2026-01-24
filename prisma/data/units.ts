import { Prisma } from "@/generated/prisma";

const unitData: Prisma.UnitCreateInput[] = [
  {
    code: "g/dL",
    displayCode: "g/dL",
    name: "Gram per Deciliter",
    description:
      "Commonly used for hemoglobin, protein, or other concentrations in blood.",
  },
  {
    code: "mg/dL",
    displayCode: "mg/dL",
    name: "Milligram per Deciliter",
    description: "Used for glucose, cholesterol, urea, and similar analytes.",
  },
  {
    code: "mmol/L",
    displayCode: "mmol/L",
    name: "Millimole per Liter",
    description:
      "SI unit for electrolytes, glucose, and many biochemical parameters.",
  },
  {
    code: "pmol/L",
    displayCode: "pmol/L",
    name: "Picomole per Liter",
    description:
      "Unit of concentration commonly used for hormones such as Free T3 and Free T4.",
  },
  {
    code: "umol/L",
    displayCode: "µmol/L",
    name: "Micromole per Liter",
    description: "Used for creatinine, uric acid, bilirubin, etc.",
  },
  {
    code: "g/L",
    displayCode: "g/L",
    name: "Gram per Liter",
    description:
      "Used for total protein, albumin, globulin, and other protein measurements",
  },
  {
    code: "ng/mL",
    displayCode: "ng/mL",
    name: "Nanogram per Milliliter",
    description: "Common in hormone and tumor marker assays.",
  },
  {
    code: "ug/mL",
    displayCode: "µg/mL",
    name: "Microgram per Milliliter",
    description: "Used for drug level measurements or specific assays.",
  },
  {
    code: "u{IU}/mL",
    displayCode: "µIU/mL",
    name: "Micro-International Unit per Liter",
    description: "Used for TSH and other hormone measurements.",
  },
  {
    code: "m{IU}/L",
    displayCode: "mIU/L",
    name: "Milli-International Unit per Liter",
    description: "Used for TSH and other endocrine hormones.",
  },
  {
    code: "{IU}/L",
    displayCode: "IU/L",
    name: "International Unit per Liter",
    description: "Used for enzyme activity (e.g., AST, ALT, ALP, CK).",
  },
  {
    code: "{U}/L",
    displayCode: "U/L",
    name: "Unit per Liter",
    description: "Alternative to IU/L, commonly interchangeable in enzymology.",
  },
  {
    code: "%",
    displayCode: "%",
    name: "Percent",
    description: "Used for differential counts or HbA1c percentage.",
  },
  {
    code: "{ratio}",
    displayCode: "ratio",
    name: "Ratio",
    description:
      "Dimensionless unit used in calculated indexes or ratios (e.g., A/G ratio).",
  },
  {
    code: "{numeric}",
    displayCode: "numeric",
    name: "Numeric",
    description:
      "Dimensionless unit used for numeric measurements without a physical unit (e.g., urine specific gravity, pH).",
  },
  {
    code: "10*3/uL",
    displayCode: "10³/µL",
    name: "10³ Cells per Microliter",
    description: "For WBC, RBC, platelet, or CD4 counts.",
  },
  {
    code: "10*6/uL",
    displayCode: "10⁶/µL",
    name: "10⁶ Cells per Microliter",
    description: "Used for red blood cell counts.",
  },
  {
    code: "10*9/L",
    displayCode: "x10⁹/L",
    name: "10⁹ Cells per Liter",
    description: "SI unit for cell counts (hematology).",
  },
  {
    code: "10*12/L",
    displayCode: "10¹²/L",
    name: "10¹² Cells per Liter",
    description: "Used for red blood cell counts (RBC).",
  },
  {
    code: "pg",
    displayCode: "pg",
    name: "Picogram",
    description: "Used for MCH (mean corpuscular hemoglobin).",
  },
  {
    code: "pg/mL",
    displayCode: "pg/mL",
    name: "Picogram per Milliliter",
    description: "Used for free T3 measurements.",
  },
  {
    code: "fL",
    displayCode: "fL",
    name: "Femtoliter",
    description: "Used for MCV (mean corpuscular volume).",
  },
  {
    code: "ug/dL",
    displayCode: "µg/dL",
    name: "Microgram per Deciliter",
    description: "Used for lead or iron measurements.",
  },
  {
    code: "meq/L",
    displayCode: "mEq/L",
    name: "Milliequivalent per Liter",
    description: "Used for ions like Na⁺, K⁺, Cl⁻, and HCO₃⁻.",
  },
  {
    code: "mosm/kg",
    displayCode: "mOsm/kg",
    name: "Milliosmole per Kilogram",
    description: "Used for osmolality measurement.",
  },
  {
    code: "{CFU}/mL",
    displayCode: "CFU/mL",
    name: "Colony Forming Unit per Milliliter",
    description: "Used in microbiology for bacterial culture quantification.",
  },
  {
    code: "ng/dL",
    displayCode: "ng/dL",
    name: "Nanogram per Deciliter",
    description: "Used for thyroid and steroid hormone tests.",
  },
  {
    code: "{kU}/L",
    displayCode: "kU/L",
    name: "Kilo Unit per Liter",
    description:
      "Used for allergy IgE testing and enzyme activity at higher scale.",
  },
];

export default unitData;
