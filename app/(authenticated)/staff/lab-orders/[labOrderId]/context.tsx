"use client";

import { createContext, useContext, useState } from "react";

interface LabOrderDetailContext {
  editSpecimenDialogTrigger: HTMLButtonElement | null;
  createSpecimenDialogTrigger: HTMLButtonElement | null;
  cancelSpecimenDialogTrigger: HTMLButtonElement | null;

  setEditSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setCreateSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setCancelSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
}

const LabOrderDetailContext = createContext<LabOrderDetailContext | undefined>(
  undefined,
);

export function LabOrderDetailProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    createSpecimenDialogActiveTrigger,
    setCreateSpecimenDialogActiveTrigger,
  ] = useState<HTMLButtonElement | null>(null);

  const [editSpecimenDialogActiveTrigger, setEditSpecimenDialogActiveTrigger] =
    useState<HTMLButtonElement | null>(null);

  const [
    cancelSpecimenDialogActiveTrigger,
    setCancelSpecimenDialogActiveTrigger,
  ] = useState<HTMLButtonElement | null>(null);

  return (
    <LabOrderDetailContext.Provider
      value={{
        editSpecimenDialogTrigger: editSpecimenDialogActiveTrigger,
        cancelSpecimenDialogTrigger: cancelSpecimenDialogActiveTrigger,
        createSpecimenDialogTrigger: createSpecimenDialogActiveTrigger,

        setEditSpecimenDialogTrigger: setEditSpecimenDialogActiveTrigger,
        setCancelSpecimenDialogTrigger: setCancelSpecimenDialogActiveTrigger,
        setCreateSpecimenDialogTrigger: setCreateSpecimenDialogActiveTrigger,
      }}
    >
      {children}
    </LabOrderDetailContext.Provider>
  );
}

export function useLabOrderDetailContext() {
  const context = useContext(LabOrderDetailContext);
  if (!context) {
    throw new Error(
      "useLabOrderDetailContext must be used within a LabOrderDetailProvider",
    );
  }
  return context;
}
