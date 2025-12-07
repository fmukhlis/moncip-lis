import ReferenceRangesTable from "./reference-ranges-table";

import { referenceRangesColumns } from "./columns";
import { getLocalTestsWithReferenceRangesAction } from "@/features/master-data/action/reference-ranges-action";

export default async function ReferenceRangesTableWrapper() {
  const localTestsWithReferenceRanges =
    await getLocalTestsWithReferenceRangesAction();

  await new Promise((r) => {
    setTimeout(r, 3000);
  });

  return (
    <ReferenceRangesTable
      data={localTestsWithReferenceRanges.data}
      columns={referenceRangesColumns}
    />
  );
}
