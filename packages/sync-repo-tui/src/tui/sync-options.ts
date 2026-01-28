/**
 * 同期オプション選択画面
 */

import { terminal } from 'terminal-kit';
import type { SyncOptions } from '../config';

export interface SyncOptionsResult {
  workflows: boolean;
  agents: boolean;
}

/**
 * 同期オプションを選択
 */
export async function selectSyncOptions(defaultOptions: SyncOptions): Promise<SyncOptions> {
  return new Promise((resolve) => {
    let options = { ...defaultOptions };

    const render = () => {
      terminal('\n');
      terminal.bold('同期項目をON/OFFで選択してください:\n');
      terminal('\n');

      // Workflows
      if (options.workflows) {
        terminal.green('  [1] Workflows: ON\n');
      } else {
        terminal.red('  [1] Workflows: OFF\n');
      }

      // Agents
      if (options.agents) {
        terminal.green('  [2] Agents: ON\n');
      } else {
        terminal.red('  [2] Agents: OFF\n');
      }

      terminal('\n');
      terminal.yellow('番号を入力してON/OFFを切り替えてください（ Enter で確定）:\n');
    };

    render();

    terminal.grabInput({ mouse: true }, async (key: any) => {
      if (key.name === '1') {
        options.workflows = !options.workflows;
        terminal.eraseDisplay();
        terminal.moveTo(1, 1);
        render();
      } else if (key.name === '2') {
        options.agents = !options.agents;
        terminal.eraseDisplay();
        terminal.moveTo(1, 1);
        render();
      } else if (key.name === 'enter') {
        terminal('\n');
        terminal.grabInput(false); // 入力を無効化
        resolve(options);
      } else if (key.name === 'escape' || key.name === 'CTRL_C') {
        terminal('\n');
        process.exit(0);
      }
    });
  });
}

/**
 * 選択された同期項目を表示
 */
export function displaySyncOptions(options: SyncOptions): void {
  terminal('\n');
  terminal.cyan('選択された同期項目:\n');

  if (options.workflows) {
    terminal.green('  ✓ Workflows\n');
  }

  if (options.agents) {
    terminal.green('  ✓ Agents\n');
  }

  terminal('\n');
}
