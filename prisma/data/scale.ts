import { Prisma } from "@/generated/prisma";

const scaleData: Prisma.ScaleCreateInput[] = [
  {
    code: "QUANTITATIVE",
    abbreviation: "Qn",
    name: "Quantitative",
    description:
      "The result of the test is a numeric value that relates to a continuous numeric scale. Reported either as an integer, a ratio, a real number, or a range. The test result value may optionally contain a relational operator from the set {<=, <, >, >=}. Valid values for a quantitative test are of the form “7”, “-7”, “7.4”, “-7.4”, “7.8912”, “0.125”, “<10”, “<10.15”, “>12000”, 1-10, 1:256.",
  },
  {
    code: "SEMI_QUANTITATIVE",
    abbreviation: "SemiQn",
    name: "Semi-Quantitative",
    description:
      "Semi-quantitative results are identified as being within buckets or discrete ranges of possible values usually with lower and upper numeric boundaries. Measurement is not on a continuous numeric scale. Examples include mass or molar concentrations detected by chromogenic changes on a test strip. The changes in color indicate intervals of concentration, such as 2, 4, 8, and 12 mg/dL of urobilinogen. Titers are another example of discrete values reported serially e.g. 1:8, 1:16 but not all values sequentially are reported. The true concentration may have been 1:9, but the measurement of 1:8 implies a true measure between 1:8 and 1:16.",
  },
  {
    code: "ORDINAL",
    abbreviation: "Ord",
    name: "Ordinal",
    description:
      "Ordered categorical responses, e.g., 1+, 2+, 3+; positive, negative; reactive, indeterminate, nonreactive. (Previously named SQ)",
  },
  {
    code: "QUANTITATIVE_OR_ORDINAL",
    abbreviation: "OrdQn",
    name: "Quantitative or Ordinal",
    description:
      "Test can be reported as either Ord or Qn, e.g., an antimicrobial susceptibility that can be reported as resistant, intermediate, susceptible or as the mm diameter of the inhibition zone. (Previously named SQN) We discourage the use of OrdQn in other circumstances.",
  },
  {
    code: "NOMINAL",
    abbreviation: "Nom",
    name: "Nominal",
    description:
      "Nominal or categorical responses that do not have a natural ordering. (e.g., names of bacteria, reported as answers, categories of appearance that do not have a natural ordering, such as, yellow, clear, bloody. (Previously named QL).",
  },
  {
    code: "NARRATIVE",
    abbreviation: "Nar",
    name: "Narrative",
    description:
      "Text narrative, such as the description of a microscopic part of a surgical papule test.",
  },
  {
    code: "MULTI",
    abbreviation: "Multi",
    name: "“Multi”",
    description:
      "Many separate results structured as one text “glob”, and reported as one observation, with or without imbedded display formatting.",
  },
  {
    code: "DOCUMENT",
    abbreviation: "Doc",
    name: "Document",
    description:
      "A document that could be in many formats (XML, narrative, etc.).",
  },
  {
    code: "SET",
    abbreviation: "Set",
    name: "Set",
    description: "Used for clinical attachments.",
  },
];

export default scaleData;
