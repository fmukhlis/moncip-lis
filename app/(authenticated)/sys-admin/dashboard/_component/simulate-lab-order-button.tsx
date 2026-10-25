"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { CreateInboundIntegrationEventSchema } from "@/features/inbound-integration-event/inbound-integration-event.schema";

export default function SimulateLabOrderButton() {
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);

    const payload = {
      messageId: "ABCDE7",
      eventType: "CLINICAL_ORDER_CREATED",
      idempotencyKey: "ABC-DE-7",
      patient: {
        id: "PAT124",
        mrn: "MRN124",
        sex: "MALE",
        name: "Bob",
        phone: "1234567890",
        address: "123 Main St, Anytown, USA",
        dateOfBirth: "1998-01-01",
      },
      encounter: {
        id: "ENC125",
        no: "ENC-125",
        type: "INPATIENT",
        status: "Active",
      },
      orderingProvider: { id: "OP123", name: "dr. Alice" },
      order: {
        id: "ORD126",
        no: "ORD-126",
        status: "ORDERED",
        priority: "ROUTINE",
        orderedAt: new Date().toISOString(),
        sourceSystem: "his",
      },
      items: [
        {
          id: "ITEM129",
          priority: "ROUTINE",
          sortOrder: 1,
          orderableId: "HIS-CAT-GLU",
        },
        {
          id: "ITEM130",
          priority: "ROUTINE",
          sortOrder: 2,
          orderableId: "HIS-CAT-CBC",
        },
      ],
    } satisfies z.input<
      typeof CreateInboundIntegrationEventSchema
    >["requestPayload"];

    try {
      const response = await fetch("/api/integration/his/lab-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer moncip_monc_b85b9646ca15e59feecd4913acd941e7b585cf85c92658703a8dbc70fe971cd4",
        },
        body: JSON.stringify(payload),
      });

      await response.json();

      if (response.ok) {
        alert(`Sukses`);
      } else {
        alert(`Gagal`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={handleSimulate}>
      {loading ? (
        <>
          <Spinner /> Loading...
        </>
      ) : (
        <>Simulate Lab Order !</>
      )}
    </Button>
  );
}
