import { z } from "zod";

export interface PaginationMeta {
  page: number;
  total: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta | null;
}

// ─── Schemas ───────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export function isPaginated(input: z.infer<typeof PaginationSchema>): boolean {
  return input.page !== undefined || input.pageSize !== undefined;
}

export function resolvePagination(input: z.infer<typeof PaginationSchema>): {
  page: number;
  pageSize: number;
} {
  return {
    page: input.page ?? DEFAULT_PAGE,
    pageSize: input.pageSize ?? DEFAULT_PAGE_SIZE,
  };
}

export function buildPrismaPage(
  page: number,
  pageSize: number,
): {
  skip: number;
  take: number;
} {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    total,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
