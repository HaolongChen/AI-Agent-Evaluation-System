export function assertNotNull<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error('Found unexpected null value');
  }
  return value;
}

export const getError = (errorMessage: string, result: unknown) => {
  const error = new Error(errorMessage);
  (error as unknown as { result: unknown }).result = result;
  throw error;
};
