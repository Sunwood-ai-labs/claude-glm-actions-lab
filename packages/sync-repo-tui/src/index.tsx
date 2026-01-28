/**
 * エントリーポイント (ink版)
 */

import React from 'react';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { render } from 'ink';
import { TUIApp } from './tui/index.js';
import { parseCLIArgs } from './cli.js';

// ES モジュールで __dirname を使う
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  const cliOptions = parseCLIArgs(args);

  // プロジェクトルートを取得（デフォルトは親ディレクトリ）
  const projectRoot = cliOptions.projectRoot || path.resolve(__dirname, '../../..');

  // ink で TUI をレンダリング
  const { unmount, waitUntilExit } = render(React.createElement(TUIApp, { projectRoot }));

  // 終了待機
  await waitUntilExit();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
