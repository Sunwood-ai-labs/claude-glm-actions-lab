/**
 * メインメニュー画面
 */

import { terminal } from 'terminal-kit';

export type MenuMode = 'single' | 'org' | null;

/**
 * 同期モードを選択
 */
export async function selectMode(): Promise<MenuMode> {
  return new Promise((resolve) => {
    terminal('\n');
    terminal.bold('同期モードを選択してください:\n');
    terminal('\n');
    terminal('  1) 単一リポジトリ\n');
    terminal('  2) 組織内の全リポジトリ（除外リスト適用）\n');
    terminal('\n');

    terminal.grabInput({ mouse: true }, async (key: any) => {
      if (key.name === '1') {
        terminal('\n');
        terminal.grabInput(false);
        resolve('single');
      } else if (key.name === '2') {
        terminal('\n');
        terminal.grabInput(false);
        resolve('org');
      } else if (key.name === 'escape' || key.name === 'CTRL_C') {
        terminal('\n');
        process.exit(0);
      }
    });
  });
}

/**
 * 起動画面を表示
 */
export function showWelcomeScreen(): void {
  terminal('\n');
  terminal.cyan.bold('╔═══════════════════════════════════════════════════════════════╗\n');
  terminal.cyan.bold('║                                                               ║\n');
  terminal.cyan.bold('║   GitHub リポジトリ同期ツール                                  ║\n');
  terminal.cyan.bold('║   Sync Workflows and Agents                                   ║\n');
  terminal.cyan.bold('║                                                               ║\n');
  terminal.cyan.bold('╚═══════════════════════════════════════════════════════════════╝\n');
  terminal('\n');
}
