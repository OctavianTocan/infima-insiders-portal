// --- ASSERTION FUNCTIONS --- //
// Purpose: Provide runtime validation with TypeScript assertion signatures
// WHY: Assertion functions throw errors for invalid data while narrowing types

/**
 * Asserts that a value is not null or undefined
 * @param value - Value to check for existence
 * @param message - Optional custom error message
 * @throws Error if value is null or undefined
 */
export function assertExists<T>(
  value: T,
  message = "Value is null or undefined"
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error(message);
  }
}

/**
 * Asserts that a string is not empty
 * @param value - String to validate
 * @param fieldName - Name of the field for error messaging
 * @throws Error if string is empty or whitespace-only
 */
export function assertNonEmptyString(
  value: string,
  fieldName = "String"
): asserts value is string {
  if (!value || !value.trim()) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Asserts that an array is not empty
 * @param array - Array to validate
 * @param fieldName - Name of the field for error messaging
 * @throws Error if array is empty
 */
export function assertNonEmptyArray<T>(
  array: T[],
  fieldName = "Array"
): asserts array is [T, ...T[]] {
  if (array.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Asserts that a value is a valid Discord user ID format
 * @param value - String to validate as Discord user ID
 * @throws Error if not a valid Discord ID format
 */
export function assertValidDiscordId(value: string): asserts value is string {
  // Discord IDs are snowflakes: 64-bit integers as strings, typically 17-19 digits
  const discordIdPattern = /^\d{17,19}$/;
  if (!discordIdPattern.test(value)) {
    throw new Error(`Invalid Discord ID format: ${value}`);
  }
}

/**
 * Asserts that a value is a valid GitHub username format
 * @param value - String to validate as GitHub username
 * @throws Error if not a valid GitHub username format
 */
export function assertValidGitHubUsername(
  value: string
): asserts value is string {
  // GitHub usernames: 1-39 characters, alphanumeric and hyphens, cannot start/end with hyphen
  const githubUsernamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  if (!githubUsernamePattern.test(value) || value.length > 39) {
    throw new Error(`Invalid GitHub username format: ${value}`);
  }
}

/**
 * Asserts that an HTTP response is successful
 * @param response - Fetch Response object
 * @param operation - Description of the operation for error messaging
 * @throws Error if response is not ok
 */
export function assertSuccessfulResponse(
  response: Response,
  operation = "Request"
): asserts response is Response & { ok: true } {
  if (!response.ok) {
    throw new Error(
      `${operation} failed: ${response.status} ${response.statusText}`
    );
  }
}
