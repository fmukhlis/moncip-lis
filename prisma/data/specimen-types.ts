import { Prisma } from "@/generated/prisma";

export const specimenTypeData: Prisma.SpecimenTypeCreateInput[] = [
  {
    code: "WB_EDTA",
    displayName: "EDTA Whole Blood",
    description:
      "Whole blood collected in an EDTA anticoagulant tube. Commonly used for hematology tests such as CBC, HbA1c, and blood film preparation.",
  },
  {
    code: "WB_HEPARIN",
    displayName: "Heparin Whole Blood",
    description:
      "Whole blood collected in a heparin anticoagulant tube. Commonly used for blood gas analysis and selected point-of-care testing.",
  },
  {
    code: "SERUM",
    displayName: "Serum",
    description:
      "The liquid portion of blood obtained after clotting. Commonly used for clinical chemistry, immunology, endocrinology, and serology tests.",
  },
  {
    code: "PLASMA_HEPARIN",
    displayName: "Heparin Plasma",
    description:
      "Plasma collected in a heparin anticoagulant tube. Used for selected chemistry and emergency laboratory testing.",
  },
  {
    code: "PLASMA_CITRATE",
    displayName: "Citrated Plasma",
    description:
      "Plasma collected in a sodium citrate anticoagulant tube. Primarily used for coagulation studies such as PT, INR, APTT, and D-dimer.",
  },
  {
    code: "PLASMA_EDTA",
    displayName: "EDTA Plasma",
    description:
      "Plasma collected in an EDTA anticoagulant tube. Used for selected molecular, immunology, and specialized laboratory examinations.",
  },
  {
    code: "URINE",
    displayName: "Urine",
    description:
      "Urine specimen used for urinalysis, urine chemistry, microbiology, and other urine-based laboratory examinations.",
  },
  {
    code: "STOOL",
    displayName: "Stool",
    description:
      "Fecal specimen used for parasitology, occult blood testing, stool culture, and gastrointestinal investigations.",
  },
  {
    code: "SPUTUM",
    displayName: "Sputum",
    description:
      "Respiratory specimen expectorated from the lower respiratory tract. Used for microbiology, tuberculosis, cytology, and molecular testing.",
  },
  {
    code: "CSF",
    displayName: "Cerebrospinal Fluid",
    description:
      "Cerebrospinal fluid collected by lumbar puncture for chemistry, hematology, microbiology, immunology, and molecular examinations.",
  },
  {
    code: "NP_SWAB",
    displayName: "Nasopharyngeal Swab",
    description:
      "Swab specimen collected from the nasopharynx for respiratory pathogen detection using molecular or microbiological methods.",
  },
  {
    code: "OP_SWAB",
    displayName: "Oropharyngeal Swab",
    description:
      "Swab specimen collected from the oropharynx for respiratory pathogen detection and selected microbiological examinations.",
  },
  {
    code: "WOUND_SWAB",
    displayName: "Wound Swab",
    description:
      "Swab specimen collected from wounds or ulcers for microbiological culture and antimicrobial susceptibility testing.",
  },
  {
    code: "BLOOD",
    displayName: "Blood",
    description:
      "Whole blood specimen without specifying an anticoagulant. Typically used when the collection method or downstream workflow determines the final processing.",
  },
];
