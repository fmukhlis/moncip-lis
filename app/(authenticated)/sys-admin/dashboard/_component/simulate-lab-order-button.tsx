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
      messageId: "MSG_1",
      eventType: "CLINICAL_ORDER_CREATED",
      idempotencyKey: "KEY_1",
      patient: {
        id: "PAT_1",
        mrn: "MRN_1",
        sex: "MALE",
        name: "Bob",
        phone: "081234567890",
        address: "123 Main St, Anytown, USA",
        dateOfBirth: "1998-01-06",
      },
      encounter: {
        id: "ENC_1",
        no: "ENC-001",
        type: "INPATIENT",
        status: "Active",
      },
      orderingProvider: { id: "OP_123", name: "dr. Alice" },
      order: {
        id: "ORD_1",
        no: "ORD-1",
        status: "ORDERED",
        priority: "ROUTINE",
        orderedAt: new Date().toISOString(),
        sourceSystem: "his",
      },
      items: [
        {
          id: "ITEM_1",
          priority: "ROUTINE",
          sortOrder: 1,
          orderableId: "HIS-CAT-GLU",
        },
        {
          id: "ITEM_2",
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
            "Bearer moncip_monc_f8c35f25241bcc9bdfcb718e4c07622a1a4ea2425995d45a4f27696c5d5cd805",
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
