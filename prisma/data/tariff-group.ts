import { Prisma } from "@/generated/prisma";

const tariffGroupData: Prisma.TariffGroupCreateInput[] = [
  {
    code: "REGULAR",
    name: "Regular",
    description: "Standard pricing for general patients",
  },
  {
    code: "BPJS",
    name: "BPJS",
    description: "Government insurance pricing",
  },
  {
    code: "CORPORATE",
    name: "Corporate",
    description: "Corporate or company contract pricing",
  },
];

export default tariffGroupData;
