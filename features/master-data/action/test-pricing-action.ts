"use server";

import z from "zod";

import { auth } from "@/auth";
import {
  getLocalTest,
  getLocalTests,
  getLocalTestGroup,
  getLocalTestGroups,
  saveLocalTestPrices,
  createLocalTestGroup,
  archiveLocalTestGroup,
  markLocalTestOrderable,
  unarchiveLocalTestGroup,
  getSupportedTariffGroups,
  saveLocalTestGroupPrices,
  getLocalTestGroupsByCode,
  markLocalTestNotOrderable,
  markLocalTestGroupOrderable,
  markLocalTestGroupNotOrderable,
} from "../dal/test-pricing-query";
import {
  GetLocalTestActionSchema,
  GetLocalTestsActionSchema,
  GetLocalTestGroupActionSchema,
  GetLocalTestGroupsActionSchema,
  SaveLocalTestPricesActionSchema,
  CreateLocalTestGroupActionSchema,
  ArchiveLocalTestGroupActionSchema,
  MarkLocalTestOrderableActionSchema,
  UnarchiveLocalTestGroupActionSchema,
  SaveLocalTestGroupPricesActionSchema,
  MarkLocalTestNotOrderableActionSchema,
  MarkLocalTestGroupOrderableActionSchema,
  MarkLocalTestGroupNotOrderableActionSchema,
} from "../schema/test-pricing-schema";

// Local Test ------------------------------------------->
export async function getLocalTestsAction(
  payload?: z.input<typeof GetLocalTestsActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    throw new Error("Authorization violations.");
  }

  const parsedData = GetLocalTestsActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await getLocalTests({
    laboratoryId: session.user.laboratoryId,
    count: parsedData.data?.count,
  });

  return {
    success: true,
    message: "Data were fetched successfully.",
    data: queryResponse,
  };
}

export async function getLocalTestAction(
  payload: z.input<typeof GetLocalTestActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = GetLocalTestActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await getLocalTest({
    id: parsedData.data.id,
    priceCount: parsedData.data.priceCount,
  });

  return {
    success: true,
    message: "Data were fetched successfully.",
    data: queryResponse,
  };
}

export async function markLocalTestOrderableAction(
  payload: z.input<typeof MarkLocalTestOrderableActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = MarkLocalTestOrderableActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await markLocalTestOrderable({
    id: parsedData.data.id,
  });

  return {
    success: true,
    message: "Test has been marked as orderable.",
    data: queryResponse,
  };
}

export async function markLocalTestNotOrderableAction(
  payload: z.input<typeof MarkLocalTestNotOrderableActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = MarkLocalTestNotOrderableActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await markLocalTestNotOrderable({
    id: parsedData.data.id,
    reason: parsedData.data.reason,
  });

  return {
    success: true,
    message: "Test has been marked as not orderable.",
    data: queryResponse,
  };
}

export async function saveLocalTestPricesAction(
  payload: z.input<typeof SaveLocalTestPricesActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = SaveLocalTestPricesActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const supportedTariffGroupIds = new Set(
    (await getSupportedTariffGroups()).map(({ id }) => id),
  );

  for (const i of payload.prices) {
    if (!supportedTariffGroupIds.has(i.tariffGroupId)) {
      throw new Error("Invalid data.");
    }
  }

  await saveLocalTestPrices({
    id: parsedData.data.id,
    prices: parsedData.data.prices,
  });

  const queryResponse = await getLocalTest({ id: parsedData.data.id });

  return {
    success: true,
    message: "Test prices have been saved successfully.",
    data: queryResponse,
  };
}
// -------------------------------------------- Local Test

// Local Test Group --------------------------------------
export async function getLocalTestGroupsAction(
  payload?: z.input<typeof GetLocalTestGroupsActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    throw new Error("Authorization violations.");
  }

  const parsedData = GetLocalTestGroupsActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await getLocalTestGroups({
    laboratoryId: session.user.laboratoryId,
    count: parsedData.data?.count,
  });

  return {
    success: true,
    message: "Data were fetched successfully.",
    data: queryResponse,
  };
}

export async function getLocalTestGroupAction(
  payload: z.input<typeof GetLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = GetLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await getLocalTestGroup({
    id: parsedData.data.id,
    priceCount: parsedData.data.priceCount,
  });

  return {
    success: true,
    message: "Data were fetched successfully.",
    data: queryResponse,
  };
}

export async function createLocalTestGroupAction(
  payload: z.input<typeof CreateLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    throw new Error("Authorization violations.");
  }

  const parsedData = CreateLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await createLocalTestGroup({
    code: parsedData.data.code,
    name: parsedData.data.name,
    description: parsedData.data.description,
    laboratoryId: session.user.laboratoryId,
    laboratoriesOnLabTestsIds: parsedData.data.laboratoriesOnLabTestsIds,
  });

  return {
    success: true,
    message: "Panel has been created successfully.",
    data: queryResponse,
  };
}

export async function archiveLocalTestGroupAction(
  payload: z.input<typeof ArchiveLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = ArchiveLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  await archiveLocalTestGroup({
    labTestGroupId: parsedData.data.labTestGroupId,
  });

  return {
    success: true,
    message: "Panel has been archived successfully.",
    data: null,
  };
}

export async function unarchiveLocalTestGroupAction(
  payload: z.input<typeof UnarchiveLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = UnarchiveLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  // This is needed to ensure the code column remains unique for active local test groups
  const localTestGroup = await getLocalTestGroup({
    id: parsedData.data.labTestGroupId,
  });
  if (localTestGroup) {
    const localTestGroupsWithSameCode = await getLocalTestGroupsByCode({
      code: localTestGroup.code,
    });
    if (localTestGroupsWithSameCode.length >= 1) {
      throw new Error("The code conflicts with another test panel.");
    }
  }
  // We let prisma throw an error if the local test group is not found

  await unarchiveLocalTestGroup({
    labTestGroupId: parsedData.data.labTestGroupId,
  });

  return {
    success: true,
    message: "Panel has been unarchived successfully.",
    data: null,
  };
}

export async function markLocalTestGroupOrderableAction(
  payload: z.input<typeof MarkLocalTestGroupOrderableActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = MarkLocalTestGroupOrderableActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await markLocalTestGroupOrderable({
    id: parsedData.data.id,
  });

  return {
    success: true,
    message: "Panel has been marked as orderable.",
    data: queryResponse,
  };
}

export async function markLocalTestGroupNotOrderableAction(
  payload: z.input<typeof MarkLocalTestGroupNotOrderableActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData =
    MarkLocalTestGroupNotOrderableActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const queryResponse = await markLocalTestGroupNotOrderable({
    id: parsedData.data.id,
    reason: parsedData.data.reason,
  });

  return {
    success: true,
    message: "Panel has been marked as not orderable.",
    data: queryResponse,
  };
}

export async function saveLocalTestGroupPricesAction(
  payload: z.input<typeof SaveLocalTestGroupPricesActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const parsedData = SaveLocalTestGroupPricesActionSchema.safeParse(payload);

  if (!parsedData.success) {
    throw new Error("Invalid data.");
  }

  const supportedTariffGroupIds = new Set(
    (await getSupportedTariffGroups()).map(({ id }) => id),
  );

  for (const i of payload.prices) {
    if (!supportedTariffGroupIds.has(i.tariffGroupId)) {
      throw new Error("Invalid data.");
    }
  }

  const queryResponse = await saveLocalTestGroupPrices(parsedData.data);

  return {
    success: true,
    message: "Panel prices have been saved successfully.",
    data: queryResponse,
  };
}
// -------------------------------------- Local Test Group

// Tariff Group ------------------------------------------
export async function getSupportedTariffGroupsAction() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Authorization violations.");
  }

  const queryResponse = await getSupportedTariffGroups();

  return {
    success: true,
    message: "Data were fetched successfully.",
    data: queryResponse,
  };
}
// ------------------------------------------ Tariff Group
