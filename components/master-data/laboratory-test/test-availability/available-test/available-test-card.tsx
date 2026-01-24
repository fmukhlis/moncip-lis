import React from "react";
import AvailableTestList from "./available-test-list";

import { testAvailabilityColumns } from "../columns";
import {
  getLocalTestsAction,
  getTestCategoriesWithTestsAction,
} from "@/features/master-data/action/test-availability-action";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default async function AvailableTestCard() {
  const testCategoriesWithTests = await getTestCategoriesWithTestsAction();
  const localTests = await getLocalTestsAction();

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
            data={testCategoriesWithTests.data}
            columns={testAvailabilityColumns}
            selectedTests={
              localTests.data
                ? localTests.data.map(({ labTest }) => labTest)
                : []
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
