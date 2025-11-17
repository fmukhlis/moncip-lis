"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/hooks";
import { saveLocalTestsAction } from "@/features/master-data/action";
import { SaveLocalTestsSchema } from "@/features/master-data/schema";

export default function LocalTestSelectionForm() {
  const selectedMasterLabTests = useAppSelector(
    (state) => state.testAvailability.selectedMasterLabTests,
  );
  const isDirty = useAppSelector((state) => state.testAvailability.isDirty);

  const { setValue, formState, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(SaveLocalTestsSchema),
  });

  const onSubmit = async (data: z.infer<typeof SaveLocalTestsSchema>) => {
    const response = await saveLocalTestsAction(data);

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  React.useEffect(() => {
    setValue(
      "labTestCodes",
      selectedMasterLabTests.map(({ code }) => code),
    );
  }, [setValue, selectedMasterLabTests]);

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        {formState.errors.labTestCodes && (
          <FieldError
            errors={[formState.errors.labTestCodes]}
            className="text-center"
          />
        )}
        <Button
          size={"lg"}
          type="submit"
          variant={"default"}
          disabled={
            !selectedMasterLabTests.length || !isDirty || formState.isSubmitting
          }
          className="w-full font-semibold"
        >
          {formState.isSubmitting ? (
            <Spinner className="size-5" />
          ) : (
            `Save ${selectedMasterLabTests.length} Test(s)`
          )}
        </Button>
      </div>
    </form>
  );
}
