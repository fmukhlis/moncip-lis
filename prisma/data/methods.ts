import { Prisma } from "@/generated/prisma";

const methodData: Prisma.MethodCreateInput[] = [
  {
    code: "AGGLUTINATION",
    abbreviation: "Aggl",
    name: "Agglutination",
  },
  {
    code: "CELL_BINDING_ASSAY_IMMUNOFLUORESCENT_ASSAY",
    abbreviation: "CBA IFA",
    name: "Cell binding assay immunofluorescent assay",
    description:
      "Cell binding assays are performed using cells that are engineered to only express the antigen of interest, which increases their specificity compared to traditional immunofluorescent assays.",
  },
  {
    code: "COAGULATION_ASSAY",
    abbreviation: "Coag",
    name: "Coagulation Assay",
    description:
      "To distinguish coagulation assays based on clotting methods that test function/activity from Immune methods that detect the presence of clotting factors and may or may not be functional assays.",
  },
  {
    code: "COMPLEMENT_DEPENDENT_CYTOTOXICITY",
    abbreviation: "CDC",
    name: "Complement-dependent Cytotoxicity",
  },
  {
    code: "COMPLEMENT_FIXATION",
    abbreviation: "Comp fix",
    name: "Complement Fixation",
  },
  {
    code: "CYTOLOGY_STAIN",
    abbreviation: "Cyto stain",
    name: "Cytology Stain",
    description:
      "The staining method used for pap smears, fine needle aspirates and other cell stains.",
  },
  {
    code: "DNA_NUCLEIC_ACID_PROBE",
    abbreviation: "Probe",
    name: "DNA Nucleic Acid Probe",
  },
  {
    code: "CHROMOGENIC_ENZYMATIC_ASSAY",
    abbreviation: "Chromo",
    name: "Chromogenic/Enzymatic Assay",
    description:
      "To distinguish coagulation assays based on chromogenic (enzymatic) activity.",
  },
  {
    code: "IMMUNOASSAY",
    abbreviation: "IA",
    name: "Immunoassay",
    description:
      "Encompasses all immunoassays with a few exceptions, including Immune Blot and Immune Fluorescence, which were created based on historic usage.",
  },
  {
    code: "FLOCCULATION_ASSAY",
    abbreviation: "Floc",
    name: "Flocculation Assay",
  },
  {
    code: "HEMAGGLUTINATION_INHIBITION",
    abbreviation: "HAI",
    name: "Hemagglutination Inhibition",
  },
  {
    code: "HEMAGGLUTINATION",
    abbreviation: "HA",
    name: "Hemagglutination",
    description: "Encompasses direct and indirect.",
  },
  {
    code: "IMMUNE_BLOT",
    abbreviation: "IB",
    name: "Immune Blot",
    description:
      "Applies to techniques that include electrophoretic or chromatographic separation such that position (size) of the band is part of the assessment.",
  },
  {
    code: "IMMUNE_FLUORESCENCE",
    abbreviation: "IF",
    name: "Immune Fluorescence",
    description:
      "Encompasses DFA, IFA, FA. Usually applies to cells and smears examined microscopically so that both the “where” and the “what” can be assessed, but can also be used on fluids in a way similar to ELISA. Does not include Cell binding assays.",
  },
  {
    code: "LATEX_AGGLUTINATION",
    abbreviation: "LA",
    name: "Latex Agglutination",
  },
  {
    code: "LEUKOCYTE_HISTAMINE_RELEASE",
    abbreviation: "LHR",
    name: "Leukocyte Histamine Release",
  },
  {
    code: "LINE_BLOT",
    abbreviation: "Line blot",
    name: "Line blot",
    description:
      "A membrane strip pre-coated with a specific set of antigens in parallel lines that are incubated with antibodies in order to detect the targets of interest.",
  },
  {
    code: "MINIMUM_INHIBITORY_CONCENTRATION",
    abbreviation: "MIC",
    name: "Minimum Inhibitory Concentration",
    description: "Antibiotic susceptibilities.",
  },
  {
    code: "MINIMUM_LETHAL_CONCENTRATION",
    abbreviation: "MLC",
    name: "Minimum Lethal Concentration",
    description: "Also called MBC (minimum bactericidal concentration).",
  },
  {
    code: "MOLECULAR_GENETICS",
    abbreviation: "Molgen",
    name: "Molecular Genetics",
    description:
      "General class of methods used to detect genetic attributes on a molecular basis including RFL, PCR and other methods.",
  },
  {
    code: "VIRUS_NEUTRALIZATION",
    abbreviation: "Neut",
    name: "Virus Neutralization",
    description:
      "Virus neutralization tests, which traditionally relies on live-virus based assays.",
  },
  {
    code: "PSEUDOVIRUS_NEUTRALIZATION",
    abbreviation: "pVNT",
    name: "Pseudovirus Neutralization",
    description: "Pseudovirus-based neutralization tests",
  },
  {
    code: "RADIOIMMUNOASSAY",
    abbreviation: "RIA",
    name: "Radioimmunoassay",
  },
  {
    code: "RAPID_PLASMA_REAGIN",
    abbreviation: "RPR",
    name: "Rapid Plasma Reagin",
    description:
      "Microscopic flocculation test, using cardiolipin-lecithin-cholesterol antigen with carbon particles.",
  },
  {
    code: "SERUM_BACTERIAL_TITER",
    abbreviation: "SBT",
    name: "Serum Bacterial Titer ",
    description:
      "Determines the serum dilution that is capable of killing microorganisms.",
  },
  {
    code: "VERTICAL_AUTO_PROFILE",
    abbreviation: "VAP",
    name: "Vertical Auto Profile",
    description: "Developed by Atherotech, Inc.",
  },
  {
    code: "VISUAL_COUNT",
    abbreviation: "VC",
    name: "Visual Count",
  },
  {
    code: "VENEREAL_DISEASE_RESEARCH_LABORATORY",
    abbreviation: "VDRL",
    name: "Venereal Disease Research Laboratory",
    description: "Microscopic flocculation test",
  },
];

export default methodData;
