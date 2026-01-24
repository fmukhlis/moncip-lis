import LocalTestSelectionForm from "./local-test-selection-form";
import SelectedTestList from "./selected-test-list";

import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function SelectedTestsCard() {
  return (
    <div className="basis-[225px] flex-1 min-w-0 sticky top-[calc(var(--header-height)+calc(var(--spacing)*4))] h-[385px]">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Selected Tests</CardTitle>
          <CardDescription>
            Tests currently available in your laboratory.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <SelectedTestList />
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-auto">
          <LocalTestSelectionForm />
        </CardFooter>
      </Card>
    </div>
  );
}
