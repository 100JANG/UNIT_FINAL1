// Thin fetch-based API client.
// - Reads base URL from EXPO_PUBLIC_API_BASE_URL (no hardcoded URLs).
// - Sends `Authorization: Bearer <sessionToken>` when a token is set.
// - Unwraps `{ code, message, result }` envelopes; throws ApiError on non-SUCCESS.
//
// Callers receive `result` directly — never raw response bodies. Do not use
// response.data / response.result on the call site; the unwrap happens here.

import { ApiError, type ApiResponse } from './apiTypes';
import { clearSessionToken, getSessionToken } from '../auth/sessionToken';

const BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '') ||
  'http://localhost:8080/v1';

type Query = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, query?: Query): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}${normalized}`;
  if (!query) return url;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${url}?${qs}` : url;
}

type RequestOptions = {
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
  /** Override or remove the Authorization header for unauthenticated endpoints. */
  auth?: boolean;
};

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  if (opts.auth !== false) {
    const token = await getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (e) {
    // Network failure (no response). Surface as a synthetic ApiError so call sites
    // have a uniform error shape.
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: e instanceof Error ? e.message : '네트워크 오류가 발생했습니다',
      result: null,
    });
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: '서버 응답을 해석할 수 없습니다',
      result: null,
      status: res.status,
    });
  }

  if (!payload || typeof payload !== 'object' || !('code' in payload)) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: '서버 응답이 envelope 형식이 아닙니다',
      result: null,
      status: res.status,
    });
  }

  if (payload.code !== 'SUCCESS') {
    // Token-invalidation policy:
    //   AUTH_INVALID  -> server rejected the token outright (forged/wrong issuer)
    //   AUTH_EXPIRED  -> token TTL elapsed
    // Both mean the persisted token must be discarded so subsequent requests
    // don't keep sending a known-bad header. AUTH_REQUIRED means there was no
    // header to begin with, so no clear is needed.
    if (payload.code === 'AUTH_INVALID' || payload.code === 'AUTH_EXPIRED') {
      void clearSessionToken();
    }
    throw new ApiError({
      code: payload.code,
      message: payload.message,
      result: payload.result,
      status: res.status,
    });
  }

  return payload.result as T;
}

export const apiClient = {
  get: <T>(path: string, opts: Omit<RequestOptions, 'body'> = {}) =>
    request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'body'> = {}) =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'body'> = {}) =>
    request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts: Omit<RequestOptions, 'body'> = {}) =>
    request<T>('DELETE', path, opts),
};

export const __apiBaseUrlForDebug = BASE_URL;
