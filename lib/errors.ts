/**
 * Centralized error handling utilities
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "STRUDEL_SYNTAX_ERROR"
  | "AI_ERROR"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

interface ErrorDetails {
  message: string;
  userMessage: string;
  status: number;
}

const ERROR_MAP: Record<ErrorCode, ErrorDetails> = {
  UNAUTHORIZED: {
    message: "Authentication required",
    userMessage: "Please sign in to continue.",
    status: 401,
  },
  FORBIDDEN: {
    message: "Access denied",
    userMessage: "You don't have permission to do this.",
    status: 403,
  },
  NOT_FOUND: {
    message: "Resource not found",
    userMessage: "The item you're looking for doesn't exist or has been removed.",
    status: 404,
  },
  BAD_REQUEST: {
    message: "Invalid request",
    userMessage: "Something was wrong with your request. Please try again.",
    status: 400,
  },
  VALIDATION_ERROR: {
    message: "Validation failed",
    userMessage: "Please check your input and try again.",
    status: 400,
  },
  RATE_LIMITED: {
    message: "Too many requests",
    userMessage: "You're doing that too often. Please wait a moment and try again.",
    status: 429,
  },
  STRUDEL_SYNTAX_ERROR: {
    message: "Strudel syntax error",
    userMessage: "There's an error in your code. Check the syntax and try again.",
    status: 400,
  },
  AI_ERROR: {
    message: "AI service error",
    userMessage: "The AI assistant is having trouble right now. Please try again.",
    status: 503,
  },
  DATABASE_ERROR: {
    message: "Database error",
    userMessage: "We're having trouble saving your data. Please try again.",
    status: 500,
  },
  NETWORK_ERROR: {
    message: "Network error",
    userMessage: "Connection problem. Please check your internet and try again.",
    status: 503,
  },
  UNKNOWN_ERROR: {
    message: "Unknown error",
    userMessage: "Something went wrong. Please try again.",
    status: 500,
  },
};

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  userMessage: string;
  details?: string;

  constructor(code: ErrorCode, details?: string) {
    const errorDetails = ERROR_MAP[code];
    super(errorDetails.message);
    this.name = "AppError";
    this.code = code;
    this.status = errorDetails.status;
    this.userMessage = errorDetails.userMessage;
    this.details = details;
  }
}

/**
 * Create a JSON error response
 */
export function errorResponse(
  code: ErrorCode,
  details?: string
): Response {
  const errorDetails = ERROR_MAP[code];
  return Response.json(
    {
      error: errorDetails.message,
      code,
      userMessage: errorDetails.userMessage,
      details,
    },
    { status: errorDetails.status }
  );
}

/**
 * Handle unknown errors and convert to AppError
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();

    if (message.includes("unauthorized") || message.includes("unauthenticated")) {
      return new AppError("UNAUTHORIZED", error.message);
    }
    if (message.includes("forbidden") || message.includes("permission")) {
      return new AppError("FORBIDDEN", error.message);
    }
    if (message.includes("not found")) {
      return new AppError("NOT_FOUND", error.message);
    }
    if (message.includes("rate limit") || message.includes("too many")) {
      return new AppError("RATE_LIMITED", error.message);
    }
    if (message.includes("syntax") || message.includes("parse")) {
      return new AppError("STRUDEL_SYNTAX_ERROR", error.message);
    }
    if (message.includes("database") || message.includes("sql") || message.includes("postgres")) {
      return new AppError("DATABASE_ERROR", error.message);
    }
    if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
      return new AppError("NETWORK_ERROR", error.message);
    }
    if (message.includes("openai") || message.includes("ai") || message.includes("model")) {
      return new AppError("AI_ERROR", error.message);
    }

    return new AppError("UNKNOWN_ERROR", error.message);
  }

  return new AppError("UNKNOWN_ERROR", String(error));
}

/**
 * Catch-all error handler for API routes
 */
export function apiErrorHandler(error: unknown): Response {
  const appError = handleError(error);
  console.error(`[${appError.code}] ${appError.message}:`, appError.details);
  return errorResponse(appError.code, appError.details);
}

/**
 * Get user-friendly message for display in UI
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    const appError = handleError(error);
    return appError.userMessage;
  }

  return ERROR_MAP.UNKNOWN_ERROR.userMessage;
}
