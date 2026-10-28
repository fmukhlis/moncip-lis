"use client";

import { createContext, useContext, useState } from "react";

interface LabOrderDetailContext {
  editSpecimenDialogTrigger: HTMLButtonElement | null;
  createSpecimenDialogTrigger: HTMLButtonElement | null;
  cancelSpecimenDialogTrigger: HTMLButtonElement | null;
  collectSpecimenDialogTrigger: HTMLButtonElement | null;

  setEditSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setCreateSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setCancelSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setCollectSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
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

  const [
    collectSpecimenDialogActiveTrigger,
    setCollectSpecimenDialogActiveTrigger,
  ] = useState<HTMLButtonElement | null>(null);

  return (
    <LabOrderDetailContext.Provider
      value={{
        editSpecimenDialogTrigger: editSpecimenDialogActiveTrigger,
        cancelSpecimenDialogTrigger: cancelSpecimenDialogActiveTrigger,
        createSpecimenDialogTrigger: createSpecimenDialogActiveTrigger,
        collectSpecimenDialogTrigger: collectSpecimenDialogActiveTrigger,

        setEditSpecimenDialogTrigger: setEditSpecimenDialogActiveTrigger,
        setCancelSpecimenDialogTrigger: setCancelSpecimenDialogActiveTrigger,
        setCreateSpecimenDialogTrigger: setCreateSpecimenDialogActiveTrigger,
        setCollectSpecimenDialogTrigger: setCollectSpecimenDialogActiveTrigger,
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
