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

function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    const caller = getCallerInfo();
    const formattedArgs = args.length > 0 ? '\n' + formatArgs(args) : '';
    console.log(
      `[INFO] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}`
    );
  },
  error: (message: string, ...args: unknown[]) => {
    const caller = getCallerInfo();
    const formattedArgs = args.length > 0 ? '\n' + formatArgs(args) : '';
    console.error(
      `[ERROR] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}`
    );
  },
  warn: (message: string, ...args: unknown[]) => {
    const caller = getCallerInfo();
    const formattedArgs = args.length > 0 ? '\n' + formatArgs(args) : '';
    console.warn(
      `[WARN] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}`
    );
  },
  debug: (message: string, ...args: unknown[]) => {
    if (NODE_ENV === 'development') {
      const caller = getCallerInfo();
      const formattedArgs = args.length > 0 ? '\n' + formatArgs(args) : '';
      console.debug(
        `[DEBUG] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}`
      );
    }
  },
};
