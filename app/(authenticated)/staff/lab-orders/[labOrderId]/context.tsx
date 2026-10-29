"use client";

import { createContext, useContext, useState } from "react";

interface LabOrderDetailContext {
  createSpecimenDialogTrigger: HTMLButtonElement | null;
  cancelSpecimenDialogTrigger: HTMLButtonElement | null;
  reassignSpecimenDialogTrigger: HTMLButtonElement | null;
  collectSpecimenDialogTrigger: HTMLButtonElement | null;
  receiveSpecimenDialogTrigger: HTMLButtonElement | null;

  setCreateSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setCancelSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setReassignSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setCollectSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
  setReceiveSpecimenDialogTrigger: (value: HTMLButtonElement) => void;
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

  const [
    cancelSpecimenDialogActiveTrigger,
    setCancelSpecimenDialogActiveTrigger,
  ] = useState<HTMLButtonElement | null>(null);

  const [
    reassignSpecimenDialogActiveTrigger,
    setReassignSpecimenDialogActiveTrigger,
  ] = useState<HTMLButtonElement | null>(null);

  const [
    collectSpecimenDialogActiveTrigger,
    setCollectSpecimenDialogActiveTrigger,
  ] = useState<HTMLButtonElement | null>(null);

  const [
    receiveSpecimenDialogActiveTrigger,
    setReceiveSpecimenDialogActiveTrigger,
  ] = useState<HTMLButtonElement | null>(null);

  return (
    <LabOrderDetailContext.Provider
      value={{
        createSpecimenDialogTrigger: createSpecimenDialogActiveTrigger,
        cancelSpecimenDialogTrigger: cancelSpecimenDialogActiveTrigger,
        reassignSpecimenDialogTrigger: reassignSpecimenDialogActiveTrigger,
        collectSpecimenDialogTrigger: collectSpecimenDialogActiveTrigger,
        receiveSpecimenDialogTrigger: receiveSpecimenDialogActiveTrigger,

        setCreateSpecimenDialogTrigger: setCreateSpecimenDialogActiveTrigger,
        setCancelSpecimenDialogTrigger: setCancelSpecimenDialogActiveTrigger,
        setReassignSpecimenDialogTrigger:
          setReassignSpecimenDialogActiveTrigger,
        setCollectSpecimenDialogTrigger: setCollectSpecimenDialogActiveTrigger,
        setReceiveSpecimenDialogTrigger: setReceiveSpecimenDialogActiveTrigger,
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
