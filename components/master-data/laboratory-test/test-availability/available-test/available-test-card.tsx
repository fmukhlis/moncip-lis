import React from "react";
import AvailableTestList from "./available-test-list";

import { testAvailabilityColumns } from "../columns";
import {
  getLocalTestsAction,
  getMasterTestCategoriesDeepAction,
} from "@/features/master-data/action";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default async function AvailableTestCard() {
  const masterTestCategoriesDeep = await getMasterTestCategoriesDeepAction();
  const localTests = await getLocalTestsAction();

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 5000);
  });

  return (
    <div className="basis-[450px] flex-2 min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Availabile Tests</CardTitle>
          <CardDescription>
            Browse and select tests from the global catalog to add to your
            laboratory.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <AvailableTestList
            data={masterTestCategoriesDeep.data}
            columns={testAvailabilityColumns}
            selectedTests={localTests.data ? localTests.data.labTests : []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
