import {
  PaginationSchema,
  buildPaginationMeta,
  buildPrismaPage,
  isPaginated,
  resolvePagination,
} from "../pagination";

describe("isPaginated", () => {
  it("reports whether the caller asked for a page or a page size", () => {
    expect(isPaginated({})).toBe(false);
    expect(isPaginated({ page: 1 })).toBe(true);
    expect(isPaginated({ pageSize: 20 })).toBe(true);
    expect(isPaginated({ page: 2, pageSize: 50 })).toBe(true);
  });
});

describe("resolvePagination", () => {
  it("falls back to the first page of twenty", () => {
    expect(resolvePagination({})).toEqual({ page: 1, pageSize: 20 });
  });

  it("keeps the values supplied by the caller", () => {
    expect(resolvePagination({ page: 4, pageSize: 5 })).toEqual({
      page: 4,
      pageSize: 5,
    });
  });

  it("resolves page and page size independently", () => {
    expect(resolvePagination({ page: 3 })).toEqual({ page: 3, pageSize: 20 });
    expect(resolvePagination({ pageSize: 10 })).toEqual({
      page: 1,
      pageSize: 10,
    });
  });
});

describe("buildPrismaPage", () => {
  it.each([
    [1, 20, 0],
    [2, 20, 20],
    [3, 20, 40],
    [5, 10, 40],
  ])("skips the rows before page %s of %s", (page, pageSize, skip) => {
    expect(buildPrismaPage(page, pageSize)).toEqual({ skip, take: pageSize });
  });
});

describe("buildPaginationMeta", () => {
  it("reports a single empty page when there are no rows", () => {
    expect(buildPaginationMeta(0, 1, 20)).toEqual({
      page: 1,
      total: 0,
      pageSize: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("rounds a partial page up", () => {
    expect(buildPaginationMeta(41, 3, 20)).toEqual({
      page: 3,
      total: 41,
      pageSize: 20,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it("does not add a page when the total divides evenly", () => {
    expect(buildPaginationMeta(40, 1, 20).totalPages).toBe(2);
  });

  it("offers a next page until the last one is reached", () => {
    expect(buildPaginationMeta(41, 1, 20)).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(buildPaginationMeta(41, 2, 20)).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("keeps a page past the end navigable backwards", () => {
    expect(buildPaginationMeta(5, 9, 20)).toMatchObject({
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });
});

describe("PaginationSchema", () => {
  it("coerces query-string numbers", () => {
    expect(PaginationSchema.parse({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
    });
  });

  it("keeps the fields optional", () => {
    expect(PaginationSchema.parse({})).toEqual({});
  });

  it.each([0, -1, 0.5])("rejects page %j", (page) => {
    expect(PaginationSchema.safeParse({ page }).success).toBe(false);
  });

  it.each([0, -5, 101, 1.5])("rejects page size %j", (pageSize) => {
    expect(PaginationSchema.safeParse({ pageSize }).success).toBe(false);
  });

  it.each([1, 100])("accepts page size %j", (pageSize) => {
    expect(PaginationSchema.safeParse({ pageSize }).success).toBe(true);
  });
});
