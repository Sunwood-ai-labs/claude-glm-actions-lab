/**
 * 設定管理
 */

import * as path from 'path';
import { loadEnv, checkEnvExists } from './env.js';
import {
  DEFAULT_TARGET_REPO,
  DEFAULT_TARGET_ORG,
  DEFAULT_EXCLUDED_REPOS,
  type SyncItemType
} from './constants.js';

export interface SyncOptions {
  workflows: boolean;
  agents: boolean;
}

export interface Config {
  // プロジェクトルート
  projectRoot: string;

  // ターゲット
  targetRepo: string;
  targetOrg: string;
  excludedRepos: string[];

  // 同期オプション
  syncOptions: SyncOptions;

  // モード
  mode: 'single' | 'org';
}

/**
 * 設定を初期化
 */
export function createConfig(projectRoot: string): Config {
  const env = loadEnv(projectRoot);

  // 除外リストをパース
  const excludedRepos = env.EXCLUDED_REPOS
    ? env.EXCLUDED_REPOS.split(',').map(r => r.trim())
    : [...DEFAULT_EXCLUDED_REPOS];

  return {
    projectRoot,
    targetRepo: env.TARGET_REPO || DEFAULT_TARGET_REPO,
    targetOrg: env.TARGET_ORG || DEFAULT_TARGET_ORG,
    excludedRepos,
    syncOptions: {
      workflows: true,
      agents: true
    },
    mode: 'single'
  };
}

/**
 * 同期オプションをトグル
 */
export function toggleSyncOption(config: Config, item: SyncItemType): Config {
  return {
    ...config,
    syncOptions: {
      ...config.syncOptions,
      [item]: !config.syncOptions[item]
    }
  };
}

/**
 * 少なくとも1つの同期項目が有効かチェック
 */
export function hasEnabledSyncItem(config: Config): boolean {
  return Object.values(config.syncOptions).some(v => v);
}
