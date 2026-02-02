"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputGroupAddon } from "../ui/input-group";
import { UserRoundSearch } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { CreateLocalPatientHISForm } from "@/features/operations/patient-registry/schema";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxLabel,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxContent,
  ComboboxSeparator,
  ComboboxCollection,
} from "../ui/combobox";
import {
  useGetLocalPatientsActionQuery,
  useLazyGetPatientsFromHISActionQuery,
  useCreateLocalPatientHISActionMutation,
} from "@/features/operations/patient-registry/api/patient";

type PatientItemProps = {
  id: string;
  name: string;
  gender: "M" | "F";
  address: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
};

const GENDER_LABEL = {
  M: "Male",
  F: "Female",
} as const;

export default function AddPatientAutomaticForm() {
  // RTK Query
  const {
    data: localPatientsActionData,
    isFetching: localPatientsActionIsFetching,
  } = useGetLocalPatientsActionQuery({});
  const [
    getPatientsFromHISAction,
    {
      data: patientsFromHISActionData,
      isFetching: patientsFromHISActionIsFetching,
    },
  ] = useLazyGetPatientsFromHISActionQuery();
  const [createLocalPatientHISAction, { isLoading }] =
    useCreateLocalPatientHISActionMutation();

  // React Hook Form
  const { control, handleSubmit, watch, reset } = useForm({
    resolver: zodResolver(CreateLocalPatientHISForm),
    defaultValues: { externalSystemId: "" },
  });
  const onSubmit = async (data: z.infer<typeof CreateLocalPatientHISForm>) => {
    try {
      const response = await createLocalPatientHISAction(data).unwrap();
      toast.success(response.message);
      reset({ externalSystemId: "" });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };
  const externalSystemId = watch("externalSystemId");

  const groupedPatients = React.useMemo(() => {
    const localPatientExternalSystemIds = new Set(
      localPatientsActionData?.data
        .filter(({ externalSystemId }) => !!externalSystemId)
        .map(({ externalSystemId }) => externalSystemId),
    );
    const patientsFromHIS = patientsFromHISActionData?.data.patients ?? [];

    const grouped = [
      {
        value: "Unregistered" as const,
        items: [] as PatientItemProps[],
      },
      {
        value: "Already Registered" as const,
        items: [] as PatientItemProps[],
      },
    ];

    for (const patientFromHIS of patientsFromHIS) {
      if (localPatientExternalSystemIds.has(patientFromHIS.id)) {
        grouped.at(1)?.items.push({
          id: patientFromHIS.id,
          name: patientFromHIS.name,
          gender: patientFromHIS.gender as "M" | "F",
          address: `${patientFromHIS.address.street}, ${patientFromHIS.address.city}, ${patientFromHIS.address.province} ${patientFromHIS.address.postal_code}`,
          dateOfBirth: patientFromHIS.date_of_birth,
          medicalRecordNumber: patientFromHIS.medical_record_number,
        });
      } else {
        grouped.at(0)?.items.push({
          id: patientFromHIS.id,
          name: patientFromHIS.name,
          gender: patientFromHIS.gender as "M" | "F",
          address: `${patientFromHIS.address.street}, ${patientFromHIS.address.city}, ${patientFromHIS.address.province} ${patientFromHIS.address.postal_code}`,
          dateOfBirth: patientFromHIS.date_of_birth,
          medicalRecordNumber: patientFromHIS.medical_record_number,
        });
      }
    }

    return grouped;
  }, [localPatientsActionData?.data, patientsFromHISActionData?.data]);

  const debouncedGetPatientsFromHISAction = useDebouncedCallback(
    async (nameOrMrn) => {
      await getPatientsFromHISAction({
        count: 5,
        ...(nameOrMrn ? { nameOrMrn } : {}),
      });
    },
    1000,
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="px-1 gap-3">
        <Field className="gap-2 col-span-1">
          <FieldLabel htmlFor="add-patient-automatic-external-system-id">
            Select patient from HIS
          </FieldLabel>
          <Controller
            name="externalSystemId"
            render={({ field: { value, onChange } }) => {
              // Ensure the component is controlled and prevent selecting an already registered patient
              const selectedPatient =
                groupedPatients.at(0)?.items.find(({ id }) => id === value) ??
                null;

              return (
                <Combobox
                  items={groupedPatients}
                  value={selectedPatient}
                  autoHighlight
                  onValueChange={(val) => {
                    onChange(val?.id);
                  }}
                  itemToStringLabel={(
                    item: (typeof groupedPatients)[number]["items"][number],
                  ) => `[${item.medicalRecordNumber}] - ${item.name}`}
                  isItemEqualToValue={(itemValue, selectedValue) =>
                    itemValue.id === selectedValue?.id
                  }
                >
                  <ComboboxInput
                    id="add-patient-automatic-external-system-id"
                    onChange={(e) => {
                      debouncedGetPatientsFromHISAction(e.target.value);
                    }}
                    required
                    showClear
                    placeholder="Search by MRN or patient name..."
                  >
                    <InputGroupAddon>
                      <UserRoundSearch />
                    </InputGroupAddon>
                  </ComboboxInput>
                  <ComboboxContent align="center">
                    <ComboboxEmpty>
                      <div className="flex items-center gap-2">
                        {localPatientsActionIsFetching ||
                        patientsFromHISActionIsFetching ? (
                          <>
                            <Spinner className="mt-0.5" />
                            Loading...
                          </>
                        ) : (
                          <>No results found.</>
                        )}
                      </div>
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(group: (typeof groupedPatients)[number]) => (
                        <ComboboxGroup key={group.value} items={group.items}>
                          <ComboboxLabel>{group.value}</ComboboxLabel>
                          <ComboboxCollection>
                            {(
                              item: (typeof groupedPatients)[number]["items"][number],
                            ) => (
                              <ComboboxItem
                                key={item.id}
                                value={item}
                                disabled={group.value === "Already Registered"}
                                className="relative"
                              >
                                <div className="flex flex-col rounded gap-1">
                                  <div className="font-medium">
                                    [{item.medicalRecordNumber}] - {item.name}
                                  </div>
                                  <div className="font-normal">
                                    {GENDER_LABEL[item.gender]},{" "}
                                    {item.dateOfBirth}
                                  </div>
                                  <div className="text-muted-foreground font-normal">
                                    {item.address}
                                  </div>
                                </div>
                              </ComboboxItem>
                            )}
                          </ComboboxCollection>
                          <ComboboxSeparator />
                        </ComboboxGroup>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              );
            }}
            control={control}
          />
        </Field>
        <Field className="col-span-1">
          <Button type="submit" disabled={!externalSystemId || isLoading}>
            {isLoading ? <Spinner className="size-5" /> : "Add Patient"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
