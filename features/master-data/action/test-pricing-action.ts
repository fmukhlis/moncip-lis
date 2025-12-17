"use server";

import z from "zod";

import { auth } from "@/auth";
import {
  saveLocalTestPrices,
  createLocalTestGroup,
  archiveLocalTestGroup,
  getLocalTestGroupById,
  getLocalTestsWithPrices,
  unarchiveLocalTestGroup,
  getSupportedTariffGroups,
  saveLocalTestGroupPrices,
  getLocalTestGroupsByCode,
  getLocalTestGroupsWithPrices,
} from "../dal/test-pricing-query";
import {
  SaveLocalTestPricesActionSchema,
  CreateLocalTestGroupActionSchema,
  UpdateLocalTestGroupActionSchema,
  ArchiveLocalTestGroupActionSchema,
  GetLocalTestsWithPricesActionSchema,
  UnarchiveLocalTestGroupActionSchema,
  SaveLocalTestGroupPricesActionSchema,
  GetLocalTestGroupsWithPricesActionSchema,
} from "../schema/test-pricing-schema";

export async function getLocalTestsWithPricesAction(
  payload: z.input<typeof GetLocalTestsWithPricesActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const parsedData = GetLocalTestsWithPricesActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: [],
    };
  }

  const queryResponse = await getLocalTestsWithPrices({
    laboratoryId: session.user.laboratoryId,
    count: parsedData.data.count,
  });

  return {
    success: true,
    message: "Data was fetched successfully.",
    data: queryResponse,
  };
}

export async function saveLocalTestPricesAction(
  payload: z.input<typeof SaveLocalTestPricesActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    return {
      success: false,
      message: "Authorization violations.",
      data: 0,
    };
  }

  const parsedData = SaveLocalTestPricesActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: 0,
    };
  }

  const supportedTariffGroupIds = new Set(
    (await getSupportedTariffGroups()).map(({ id }) => id),
  );

  for (const i of payload.prices) {
    if (!supportedTariffGroupIds.has(i.tariffGroupId)) {
      return {
        success: false,
        message: "Invalid data.",
        data: 0,
      };
    }
  }

  const queryResponse = await saveLocalTestPrices({
    laboratoriesOnLabTestsId: parsedData.data.laboratoriesOnLabTestsId,
    prices: parsedData.data.prices,
  });

  return {
    success: true,
    message: "Test pricing were saved successfully.",
    data: queryResponse,
  };
}

export async function createLocalTestGroupAction(
  payload: z.input<typeof CreateLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: null,
    };
  }

  const parsedData = CreateLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: null,
    };
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
    message: "Panel was created successfully.",
    data: queryResponse,
  };
}

export async function updateLocalTestGroupAction(
  payload: z.input<typeof UpdateLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: null,
    };
  }

  const parsedData = UpdateLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: null,
    };
  }

  await archiveLocalTestGroup({
    labTestGroupId: parsedData.data.labTestGroupId,
  });

  const queryResponse = await createLocalTestGroup({
    code: parsedData.data.code,
    name: parsedData.data.name,
    description: parsedData.data.description,
    laboratoryId: session.user.laboratoryId,
    laboratoriesOnLabTestsIds: parsedData.data.laboratoriesOnLabTestsIds,
  });

  return {
    success: true,
    message: "Panel was updated successfully.",
    data: queryResponse,
  };
}

export async function archiveLocalTestGroupAction(
  payload: z.input<typeof ArchiveLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: null,
    };
  }

  const parsedData = ArchiveLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: null,
    };
  }

  await archiveLocalTestGroup({
    labTestGroupId: parsedData.data.labTestGroupId,
  });

  return {
    success: true,
    message: "Panel was archived successfully.",
    data: null,
  };
}

export async function unarchiveLocalTestGroupAction(
  payload: z.input<typeof UnarchiveLocalTestGroupActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: null,
    };
  }

  const parsedData = UnarchiveLocalTestGroupActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: null,
    };
  }

  const localTestGroup = await getLocalTestGroupById({
    id: parsedData.data.labTestGroupId,
  });

  if (!localTestGroup) {
    return {
      success: false,
      message: "Nonexistent test panel.",
      data: null,
    };
  }

  const localTestGroupsWithSameCode = await getLocalTestGroupsByCode({
    code: localTestGroup.code,
  });

  if (localTestGroupsWithSameCode.length >= 1) {
    return {
      success: false,
      message: "The code conflicts with another test panel.",
      data: null,
    };
  }

  await unarchiveLocalTestGroup({
    labTestGroupId: parsedData.data.labTestGroupId,
  });

  return {
    success: true,
    message: "Panel was unarchived successfully.",
    data: null,
  };
}

export async function getLocalTestGroupsWithPricesAction(
  payload: z.input<typeof GetLocalTestGroupsWithPricesActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }
  const parsedData =
    GetLocalTestGroupsWithPricesActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: [],
    };
  }

  const queryResponse = await getLocalTestGroupsWithPrices({
    laboratoryId: session.user.laboratoryId,
    count: parsedData.data.count,
  });

  return {
    success: true,
    message: "Data was fetched successfully.",
    data: queryResponse,
  };
}

export async function saveLocalTestGroupPricesAction(
  payload: z.input<typeof SaveLocalTestGroupPricesActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    return {
      success: false,
      message: "Authorization violations.",
      data: 0,
    };
  }

  const parsedData = SaveLocalTestGroupPricesActionSchema.safeParse(payload);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: 0,
    };
  }

  const supportedTariffGroupIds = new Set(
    (await getSupportedTariffGroups()).map(({ id }) => id),
  );

  for (const i of payload.prices) {
    if (!supportedTariffGroupIds.has(i.tariffGroupId)) {
      return {
        success: false,
        message: "Invalid data.",
        data: 0,
      };
    }
  }

  const queryResponse = await saveLocalTestGroupPrices(parsedData.data);

  return {
    success: true,
    message: "Panel pricing were saved successfully.",
    data: queryResponse,
  };
}

export async function getSupportedTariffGroupsAction() {
  const session = await auth();

  if (!session || !session.user) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const queryResponse = await getSupportedTariffGroups();

  return {
    success: true,
    message: "Data was fetched successfully.",
    data: queryResponse,
  };
}
