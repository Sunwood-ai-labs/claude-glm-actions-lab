/**
 * 確認ダイアログ
 */

import { terminal } from 'terminal-kit';

export interface ConfirmationOptions {
  message: string;
  defaultValue?: boolean;
}

/**
 * 確認ダイアログを表示
 */
export async function confirm(options: ConfirmationOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const { message, defaultValue = false } = options;

    terminal('\n');
    terminal.yellow(`${message} (y/N): `);

    terminal.grabInput({ mouse: true }, async (key: any) => {
      if (key.name === 'y' || key.name === 'Y') {
        terminal('\n');
        resolve(true);
      } else if (key.name === 'enter' && defaultValue) {
        terminal('\n');
        resolve(true);
      } else if (key.name === 'n' || key.name === 'N' || key.name === 'enter' || key.name === 'escape') {
        terminal('\n');
        resolve(false);
      } else if (key.name === 'CTRL_C') {
        terminal('\n');
        process.exit(0);
      }
    });
  });
}
