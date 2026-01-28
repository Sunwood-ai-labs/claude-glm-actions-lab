/**
 * エントリーポイント
 */

import * as path from 'path';
import { runTUI } from './tui';
import { parseCLIArgs } from './cli';

async function main() {
  const args = process.argv.slice(2);
  const cliOptions = parseCLIArgs(args);

  // プロジェクトルートを取得（デフォルトは親ディレクトリ）
  const projectRoot = cliOptions.projectRoot || path.resolve(__dirname, '../../..');

  await runTUI({ projectRoot });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
