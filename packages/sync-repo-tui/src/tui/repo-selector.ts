/**
 * リポジトリ選択画面
 */

import { terminal } from 'terminal-kit';

export interface RepoSelectorOptions {
  message: string;
  defaultValue: string;
}

/**
 * リポジトリ名を入力
 */
export async function inputRepo(options: RepoSelectorOptions): Promise<string> {
  return new Promise((resolve) => {
    const { message, defaultValue } = options;

    terminal('\n');
    terminal.cyan(`${message}\n`);
    terminal.yellow(`(現在: ${defaultValue})\n`);
    terminal.yellow('別の値を入力するか、Enterキーで確定: ');

    let input = '';

    terminal.grabInput({ mouse: true }, async (key: any, data: any) => {
      if (key.name === 'enter') {
        terminal('\n');
        resolve(input.trim() || defaultValue);
      } else if (key.name === 'backspace') {
        if (input.length > 0) {
          input = input.slice(0, -1);
          terminal.eraseLine();
          terminal.moveTo.column(1);
          terminal.yellow(`別の値を入力するか、Enterキーで確定: ${input}`);
        }
      } else if (key.name === 'escape' || key.name === 'CTRL_C') {
        terminal('\n');
        process.exit(0);
      } else if (key === 'ENTER' || key === 'CTRL_C') {
        // 既に処理済み
      } else if (data && data.length === 1 && /[a-zA-Z0-9\/\-]/.test(data)) {
        input += data;
        terminal.eraseLine();
        terminal.moveTo.column(1);
        terminal.yellow(`別の値を入力するか、Enterキーで確定: ${input}`);
      }
    });
  });
}
