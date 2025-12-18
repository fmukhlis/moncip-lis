"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { setIsDirty } from "@/features/master-data/test-availability-slice";
import { FieldError } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveLocalTestsAction } from "@/features/master-data/action/test-availability-action";
import { SaveLocalTestsActionSchema } from "@/features/master-data/schema/test-availability-schema";
import { useAppDispatch, useAppSelector } from "@/hooks";

export default function LocalTestSelectionForm() {
  const selectedMasterLabTests = useAppSelector(
    (state) => state.testAvailability.selectedMasterLabTests,
  );

  const isDirty = useAppSelector((state) => state.testAvailability.isDirty);

  const dispatch = useAppDispatch();

  const { setValue, formState, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(SaveLocalTestsActionSchema),
  });

  const onSubmit = async (data: z.infer<typeof SaveLocalTestsActionSchema>) => {
    const response = await saveLocalTestsAction(data);

    if (response.success) {
      toast.success(response.message);
      dispatch(setIsDirty(false));
    } else {
      toast.error(response.message);
    }
  };

  React.useEffect(() => {
    setValue(
      "labTestIds",
      selectedMasterLabTests.map(({ id }) => id),
    );
  }, [setValue, selectedMasterLabTests]);

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        {formState.errors.labTestIds && (
          <FieldError
            errors={[formState.errors.labTestIds]}
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
