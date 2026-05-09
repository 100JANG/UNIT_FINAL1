// UI-level classification of ApiError, derived from
// docs/backend-contract/03_ERROR_HANDLING_CONTRACT.md.
//
// IMPORTANT — separation of concerns:
//   - Token invalidation (clear stored sessionToken on AUTH_INVALID / AUTH_EXPIRED)
//     is performed by apiClient as a side effect of the response handler. UI code
//     does NOT need to call clearSessionToken() itself.
//   - This module returns only an ErrorKind that the UI can use to pick a state
//     (login screen, toast, inline form error, etc).
//
// AUTH policy summary (per spec):
//   AUTH_REQUIRED  -> no header was sent (or auth-required path). UI: prompt login.
//                     Token clear: not needed.
//   AUTH_INVALID   -> token was rejected. UI: prompt login.
//                     Token clear: yes (handled by apiClient).
//   AUTH_EXPIRED   -> token TTL elapsed. UI: prompt re-auth (refresh-token flow is
//                     not yet wired — see docs/integration/03_*.md TODO).
//                     Token clear: yes (handled by apiClient).
//
// FEATURE_RESERVED   -> "준비 중" placeholder. Do NOT call reserved endpoints
//                       intentionally; treat it as an error of last resort.
// VALIDATION_FAILED  -> form-field errors via ApiError.validationFields.
// BUSINESS_RULE_VIOLATION -> guided empty state (e.g. Feed school/department
//                       missing -> profile prompt).

import { ApiError } from './apiTypes';

export type ErrorKind =
  | 'auth-required'      // AUTH_REQUIRED, AUTH_INVALID  -> login screen
  | 'auth-expired'       // AUTH_EXPIRED                 -> re-auth prompt
  | 'forbidden'          // FORBIDDEN, USER_SUSPENDED    -> "권한이 없습니다"
  | 'not-found'          // NOT_FOUND                    -> empty / back
  | 'validation'         // VALIDATION_FAILED            -> form-field errors
  | 'business-rule'      // BUSINESS_RULE_VIOLATION etc. -> guided empty state
  | 'reserved'           // FEATURE_RESERVED             -> "준비 중" placeholder
  | 'rate-limit'         // RATE_LIMIT_EXCEEDED          -> retry-later toast
  | 'server'             // INTERNAL_ERROR, SERVICE_*    -> retry toast
  | 'network'            // NETWORK_ERROR                -> retry toast
  | 'unknown';

export function classifyError(err: unknown): ErrorKind {
  if (!(err instanceof ApiError)) return 'unknown';
  switch (err.code) {
    case 'AUTH_REQUIRED':
    case 'AUTH_INVALID':
      return 'auth-required';
    case 'AUTH_EXPIRED':
      return 'auth-expired';
    case 'FORBIDDEN':
    case 'USER_SUSPENDED':
      return 'forbidden';
    case 'NOT_FOUND':
      return 'not-found';
    case 'VALIDATION_FAILED':
      return 'validation';
    case 'BUSINESS_RULE_VIOLATION':
    case 'REVIEW_QUOTA_REQUIRED':
    case 'JURY_NOT_AUTHORIZED':
    case 'JURY_ALREADY_VOTED':
    case 'JURY_WINDOW_CLOSED':
    case 'REPORT_DUPLICATE':
      return 'business-rule';
    case 'FEATURE_RESERVED':
      return 'reserved';
    case 'RATE_LIMIT_EXCEEDED':
      return 'rate-limit';
    case 'INTERNAL_ERROR':
    case 'SERVICE_UNAVAILABLE':
      return 'server';
    case 'NETWORK_ERROR':
      return 'network';
    default:
      return 'unknown';
  }
}

/** True if the UI should send the user to the login screen (or refresh flow). */
export function requiresLoginRedirect(kind: ErrorKind): boolean {
  return kind === 'auth-required' || kind === 'auth-expired';
}

/** Pulls a human-friendly message off any error, defaulting to a generic one. */
export function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했습니다';
}
