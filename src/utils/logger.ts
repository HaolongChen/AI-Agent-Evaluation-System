import { NODE_ENV } from '../config/env.ts';

function getCallerInfo(): string {
  const stack = new Error().stack;
  if (!stack) return '';

  const lines = stack.split('\n');
  // Skip first 3 lines: Error, getCallerInfo, and the logger method itself
  const callerLine = lines[3];
  if (!callerLine) return '';

  // Extract file path and line number from stack trace
  const match =
    callerLine.match(/\((.+):(\d+):(\d+)\)/) ||
    callerLine.match(/at (.+):(\d+):(\d+)/);
  if (match) {
    const filePath = match[1];
    const lineNumber = match[2];
    // Extract just the filename from the full path
    const fileName = filePath?.split('/').pop() || filePath;
    return `[${fileName}:${lineNumber}]`;
  }

  return '';
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    const caller = getCallerInfo();
    console.log(
      `[INFO] ${new Date().toISOString()} ${caller} - ${message}`,
      ...args
    );
  },
  error: (message: string, ...args: unknown[]) => {
    const caller = getCallerInfo();
    console.error(
      `[ERROR] ${new Date().toISOString()} ${caller} - ${message}`,
      ...args
    );
  },
  warn: (message: string, ...args: unknown[]) => {
    const caller = getCallerInfo();
    console.warn(
      `[WARN] ${new Date().toISOString()} ${caller} - ${message}`,
      ...args
    );
  },
  debug: (message: string, ...args: unknown[]) => {
    if (NODE_ENV === 'development') {
      const caller = getCallerInfo();
      console.debug(
        `[DEBUG] ${new Date().toISOString()} ${caller} - ${message}`,
        ...args
      );
    }
  },
};
