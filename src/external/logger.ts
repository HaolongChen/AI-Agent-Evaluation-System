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
      if (typeof arg === 'object' || arg instanceof Error && arg !== null) {
        try {
          if(arg instanceof Error) {
            return JSON.stringify({
              name: arg.name,
              message: arg.message,
              stack: arg.stack,
            }, null, 2);
          }
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
      `\n[INFO] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}\n`
    );
  },
  error: (message: string, ...args: unknown[]) => {
    const caller = getCallerInfo();
    const formattedArgs = args.length > 0 ? '\n' + formatArgs(args) : '';
    console.error(
      `\n[ERROR] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}\n`
    );
  },
  warn: (message: string, ...args: unknown[]) => { // TODO: add color for logging in console
    const caller = getCallerInfo();
    const formattedArgs = args.length > 0 ? '\n' + formatArgs(args) : '';
    console.warn(
      `\n[WARN] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}\n`
    ); // TODO: add color
  },
  debug: (message: string, ...args: unknown[]) => {
    if (NODE_ENV === 'development') {
      const caller = getCallerInfo();
      const formattedArgs = args.length > 0 ? '\n' + formatArgs(args) : '';
      console.debug(
        `\n[DEBUG] ${new Date().toISOString()} ${caller} - ${message}${formattedArgs}\n`
      );
    }
  },
};
