/**
 * API utilities — error handling, response parsing, etc.
 */

import type { ApiError } from '@botstackhq/shared-types';

/** Format API errors for display to users. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: unknown }).message as string;
  }

  return 'An unexpected error occurred. Please try again.';
}

/** Parse API error response for user-friendly messaging. */
export function parseApiError(error: ApiError | null | undefined): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    INVALID_EMAIL: 'Please enter a valid email address',
    USER_ALREADY_EXISTS: 'This email is already invited or a team member',
    INVALID_ROLE: 'Invalid role selected',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
    NOT_FOUND: 'The requested resource was not found',
    WORKSPACE_NOT_FOUND: 'Workspace not found',
    INVALID_REQUEST: 'Invalid request. Please check your input.',
  };

  return errorMessages[error.code] || error.message || 'An error occurred';
}
