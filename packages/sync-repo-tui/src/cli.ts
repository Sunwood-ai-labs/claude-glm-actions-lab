/**
 * CLI引数パーサー
 */

export interface CLIOptions {
  projectRoot?: string;
}

/**
 * CLI引数をパース
 */
export function parseCLIArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--project-root' && args[i + 1]) {
      options.projectRoot = args[i + 1];
      i++;
    }
  }

  return options;
}
