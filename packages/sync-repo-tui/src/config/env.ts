/**
 * .envファイル読み込み
 */

import * as fs from 'fs';
import * as path from 'path';
import { config as dotenvConfig } from 'dotenv';

export interface EnvConfig {
  TARGET_REPO?: string;
  TARGET_ORG?: string;
  EXCLUDED_REPOS?: string;
}

/**
 * .envファイルから設定を読み込む
 */
export function loadEnv(projectRoot: string): EnvConfig {
  const envPath = path.join(projectRoot, '.env');

  if (!fs.existsSync(envPath)) {
    return {};
  }

  // dotenvでパース
  const parsed = dotenvConfig({ path: envPath }).parsed || {};

  return {
    TARGET_REPO: parsed.TARGET_REPO,
    TARGET_ORG: parsed.TARGET_ORG,
    EXCLUDED_REPOS: parsed.EXCLUDED_REPOS
  };
}

/**
 * .envファイルが存在するかチェック
 */
export function checkEnvExists(projectRoot: string): boolean {
  const envPath = path.join(projectRoot, '.env');
  return fs.existsSync(envPath);
}
