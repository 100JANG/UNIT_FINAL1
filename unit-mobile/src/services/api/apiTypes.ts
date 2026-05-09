// Shared API envelope + cursor-page types.
// Single source of truth: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §0
// and docs/backend-contract/06_PAGINATION_CONTRACT.md.

export type ApiResponseSuccess<T> = {
  code: 'SUCCESS';
  message: string;
  result: T;
};

export type ApiResponseError = {
  code: string;
  message: string;
  result: unknown;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export type CursorPage<T> = {
  items: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    total?: number | null;
  };
};

export type ValidationFieldError = { field: string; reason: string };

export class ApiError extends Error {
  public readonly code: string;
  public readonly result: unknown;
  public readonly status?: number;

  constructor(args: { code: string; message: string; result: unknown; status?: number }) {
    super(args.message);
    this.name = 'ApiError';
    this.code = args.code;
    this.result = args.result;
    this.status = args.status;
  }

  /** True for VALIDATION_FAILED with a fields[] payload. */
  get validationFields(): ValidationFieldError[] | null {
    if (this.code !== 'VALIDATION_FAILED') return null;
    const r = this.result as { fields?: ValidationFieldError[] } | null;
    return r?.fields ?? null;
  }
}
