import { Prisma } from "@/generated/prisma";

const categoryData: Prisma.CategoryCreateInput[] = [
  {
    code: "CLINICAL_CHEMISTRY",
    name: "Clinical Chemistry",
    description:
      "Covers general biochemical testing such as enzymes, electrolytes, metabolites, and proteins.",
  },
  {
    code: "HEMATOLOGY",
    name: "Hematology",
    description:
      "Covers blood cell analysis including RBC, WBC, hemoglobin, platelets, and cell indices.",
  },
  {
    code: "IMMUNOLOGY",
    name: "Immunology",
    description:
      "Includes antibody/antigen tests such as CRP, ANA, rheumatoid factor, and other immune markers.",
  },
  {
    code: "SEROLOGY",
    name: "Serology",
    description:
      "Includes infectious disease screening such as HBsAg, HIV, and Dengue serology.",
  },
  {
    code: "MICROBIOLOGY",
    name: "Microbiology",
    description:
      "Covers microbial culture, sensitivity testing, and microscopic identification.",
  },
  {
    code: "URINALYSIS",
    name: "Urinalysis",
    description:
      "Covers physical, chemical, and microscopic analysis of urine specimens.",
  },
  {
    code: "FECAL_PARASITOLOGY",
    name: "Fecal / Parasitology",
    description:
      "Covers stool testing for parasites, occult blood, and microscopic analysis.",
  },
  {
    code: "ENDOCRINOLOGY",
    name: "Endocrinology",
    description:
      "Covers hormonal assays including TSH, FT3, FT4, insulin, and related tests.",
  },
  {
    code: "TOXICOLOGY",
    name: "Toxicology",
    description:
      "Covers testing for toxic substances, drugs, and chemical exposure in biological samples.",
  },
  {
    code: "COAGULATION",
    name: "Coagulation",
    description:
      "Covers hemostasis testing such as PT, aPTT, and INR for clotting function.",
  },
];

export default categoryData;
