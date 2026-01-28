/**
 * TUIメインコントローラー
 */

import { terminal } from 'terminal-kit';
import { showWelcomeScreen, selectMode, type MenuMode } from './main-menu';
import { inputRepo } from './repo-selector';
import { selectSyncOptions, displaySyncOptions } from './sync-options';
import { confirm } from './confirmation';
import { InlineProgress } from './progress';
import { createConfig, hasEnabledSyncItem } from '../config';
import { performGitHubChecks, getOrgRepos } from '../github';
import { syncToRepos, getSyncSummary } from '../sync';
import { ConfigError, AuthenticationError } from '../utils/error';
import { checkEnvExists } from '../config/env';
import * as fs from 'fs';
import * as path from 'path';

export interface TUIOptions {
  projectRoot: string;
}

/**
 * TUIを実行
 */
export async function runTUI(options: TUIOptions): Promise<void> {
  const { projectRoot } = options;

  try {
    // 起動画面
    showWelcomeScreen();

    // .envチェック
    if (!checkEnvExists(projectRoot)) {
      terminal.yellow('警告: .env ファイルが見つかりません\n');
      terminal('.env.example から .env を作成しますか？\n');

      const shouldCreate = await confirm({
        message: '.envを作成しますか？'
      });

      if (shouldCreate) {
        const envExample = path.join(projectRoot, '.env.example');
        const envPath = path.join(projectRoot, '.env');

        // .env.example の存在確認
        if (!fs.existsSync(envExample)) {
          terminal.red('エラー: .env.example が見つかりません\n');
          process.exit(1);
        }

        fs.copyFileSync(envExample, envPath);
        terminal.green('.env を作成しました\n');
        terminal('編集してから再実行してください\n');
        process.exit(0);
      } else {
        terminal.red('エラー: .env が必要です\n');
        process.exit(1);
      }
    }

    // GitHubチェック
    const progress = new InlineProgress('GitHub認証チェック');
    progress.show();

    try {
      await performGitHubChecks();
      progress.success();
    } catch (error) {
      progress.error();
      if (error instanceof AuthenticationError) {
        terminal.red(error.message + '\n');
        process.exit(1);
      }
      throw error;
    }

    // 設定初期化
    const config = createConfig(projectRoot);

    // モード選択
    const mode = await selectMode();
    if (!mode) {
      process.exit(0);
    }
    config.mode = mode;

    let targetRepos: string[] = [];

    if (mode === 'single') {
      // 単一リポジトリモード
      terminal('\n');
      terminal.cyan(`ターゲットリポジトリ: ${config.targetRepo}\n`);

      const shouldChange = await confirm({
        message: '別のリポジトリを指定しますか？',
        defaultValue: false
      });

      if (shouldChange) {
        config.targetRepo = await inputRepo({
          message: 'リポジトリ (例: org/repo):',
          defaultValue: config.targetRepo
        });
      }

      targetRepos = [config.targetRepo];
    } else {
      // 組織モード
      terminal('\n');
      terminal.cyan(`ターゲット組織: ${config.targetOrg}\n`);

      const shouldChangeOrg = await confirm({
        message: '別の組織を指定しますか？',
        defaultValue: false
      });

      if (shouldChangeOrg) {
        const inputOrg = await inputRepo({
          message: '組織名:',
          defaultValue: config.targetOrg
        });
        config.targetOrg = inputOrg;
      }

      // 除外リスト
      terminal('\n');
      terminal.yellow(`除外リスト: ${config.excludedRepos.join(', ')}\n`);

      const shouldAddExclude = await confirm({
        message: '除外リストを追加しますか？',
        defaultValue: false
      });

      if (shouldAddExclude) {
        // 簡易実装: 追加はスキップ（または別途実装）
      }

      // 組織のリポジトリを取得
      terminal('\n');
      const fetchProgress = new InlineProgress(`組織 ${config.targetOrg} のリポジトリを取得中`);
      fetchProgress.show();

      try {
        targetRepos = await getOrgRepos(config.targetOrg, config.excludedRepos);
        fetchProgress.success();
      } catch (error) {
        fetchProgress.error();
        throw error;
      }

      if (targetRepos.length === 0) {
        terminal.red('エラー: 有効なリポジトリが見つかりませんでした\n');
        process.exit(1);
      }

      terminal('\n');
      terminal.green(`対象リポジトリ (${targetRepos.length} 件):\n`);
      for (const repo of targetRepos) {
        terminal(`  - ${repo}\n`);
      }

      terminal('\n');
      const shouldContinue = await confirm({
        message: '続行しますか？',
        defaultValue: false
      });

      if (!shouldContinue) {
        terminal('キャンセルしました\n');
        process.exit(0);
      }
    }

    // 同期オプション選択
    config.syncOptions = await selectSyncOptions(config.syncOptions);
    displaySyncOptions(config.syncOptions);

    if (!hasEnabledSyncItem(config)) {
      terminal.red('エラー: 同期項目が選択されていません\n');
      process.exit(1);
    }

    // 確認
    const shouldSync = await confirm({
      message: '同期を実行しますか？',
      defaultValue: false
    });

    if (!shouldSync) {
      terminal('キャンセルしました\n');
      process.exit(0);
    }

    terminal('\n');

    // 同期実行
    const syncResult = await syncToRepos(projectRoot, targetRepos, config.syncOptions);
    const summary = getSyncSummary(syncResult);

    // 結果表示
    terminal('\n');
    terminal.bold('=== 同期結果 ===\n');
    terminal('\n');

    for (const detail of summary.details) {
      if (detail.startsWith('✓')) {
        terminal.green(`${detail}\n`);
      } else {
        terminal.red(`${detail}\n`);
      }
    }

    terminal('\n');
    terminal.bold(`合計: ${summary.successCount}/${summary.totalRepos} 成功\n`);

    if (summary.failCount > 0) {
      terminal.red(`${summary.failCount} 件失敗\n`);
    }

    terminal('\n');
    terminal.green.bold('=== 完了 ===\n');
    terminal('\n');

  } catch (error) {
    terminal('\n');
    terminal.red('エラーが発生しました\n');

    if (error instanceof Error) {
      terminal.red(`${error.message}\n`);
    }

    process.exit(1);
  } finally {
    terminal.grabInput(false);
  }

  process.exit(0);
}
