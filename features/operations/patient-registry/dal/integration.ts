"use server";

import z from "zod";

import { GetHISPatientsParamsSchema } from "../schema";

const DATA = {
  source: "SIMRS X",
  generated_at: new Date().toISOString(),
  patients: [
    {
      id: "HIS-00012345",
      medical_record_number: "RM-2024-000789",
      nik: "3175091208900001",
      name: "Andi Pratama",
      gender: "M",
      date_of_birth: "1990-08-12",
      place_of_birth: "Jakarta",
      blood_type: "O",
      phone: "081234567890",
      email: "andi.pratama@example.com",
      address: {
        street: "Jl. Melati No. 12",
        city: "Jakarta Timur",
        province: "DKI Jakarta",
        postal_code: "13450",
      },
      created_at: "2026-01-25T08:15:00+07:00",
      status: "ACTIVE",
    },
    {
      id: "HIS-00012346",
      medical_record_number: "RM-2023-000456",
      nik: "3273015507850002",
      name: "Siti Aisyah",
      gender: "F",
      date_of_birth: "1985-07-15",
      place_of_birth: "Bandung",
      blood_type: "A",
      phone: "082198765432",
      email: null,
      address: {
        street: "Jl. Kenanga No. 5",
        city: "Bandung",
        province: "Jawa Barat",
        postal_code: "40123",
      },
      created_at: "2026-01-24T14:30:00+07:00",
      status: "ACTIVE",
    },
    {
      id: "HIS-00012347",
      medical_record_number: "RM-2022-001122",
      nik: null,
      name: "Budi Santoso",
      gender: "M",
      date_of_birth: "1972-11-03",
      place_of_birth: "Surabaya",
      blood_type: "B",
      phone: "085677889900",
      email: "budi.santoso@example.com",
      address: {
        street: "Jl. Mawar No. 21",
        city: "Surabaya",
        province: "Jawa Timur",
        postal_code: "60234",
      },
      created_at: "2026-01-23T10:05:00+07:00",
      status: "INACTIVE",
    },
  ],
};

export async function getPatientsFromHIS(
  payload?: z.infer<typeof GetHISPatientsParamsSchema>,
) {
  const parsedData = GetHISPatientsParamsSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  /**
   * IMPLEMENTATION STRATEGY:
   * - Dummy data (current)
   * - HIS API
   * - Direct DB access (if vendor gives DB)
   *
   * Route handler must not care which one is used.
   */

  return {
    ...DATA,
    patients: DATA.patients
      .filter(
        ({ id }) =>
          !parsedData.data || // No payload = returns all (no filtering)
          !parsedData.data.patientId || // No patientId = returns all (no filtering)
          id === parsedData.data.patientId,
      )
      .slice(0, parsedData.data?.count), // Limit result
  };
}
