import { toast } from "sonner";

/**
 * API error response shape from our error utilities
 */
interface ApiErrorResponse {
  error: string;
  code?: string;
  userMessage?: string;
  details?: string;
}

/**
 * Show an error toast with user-friendly message
 */
export function showError(error: unknown, fallbackMessage = "Something went wrong") {
  let message = fallbackMessage;

  if (error instanceof Response) {
    // Will be handled by showApiError
    message = fallbackMessage;
  } else if (error instanceof Error) {
    message = error.message || fallbackMessage;
  } else if (typeof error === "string") {
    message = error;
  }

  toast.error(message);
}

/**
 * Parse API error response and show user-friendly toast
 */
export async function showApiError(
  response: Response,
  fallbackMessage = "Request failed"
) {
  try {
    const data: ApiErrorResponse = await response.json();
    const message = data.userMessage || data.error || fallbackMessage;
    toast.error(message);
    return data;
  } catch {
    toast.error(fallbackMessage);
    return null;
  }
}

/**
 * Helper to handle fetch errors consistently
 */
export async function handleApiResponse<T>(
  response: Response,
  errorMessage = "Request failed"
): Promise<T> {
  if (!response.ok) {
    const data = await showApiError(response, errorMessage);
    throw new Error(data?.userMessage || data?.error || errorMessage);
  }
  return response.json();
}

/**
 * Show a success toast
 */
export function showSuccess(message: string) {
  toast.success(message);
}

/**
 * Show an info toast
 */
export function showInfo(message: string) {
  toast.info(message);
}

/**
 * Show a warning toast
 */
export function showWarning(message: string) {
  toast.warning(message);
}
