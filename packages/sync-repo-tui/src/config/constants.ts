/**
 * アプリケーション定数
 */

export const APP_NAME = 'GitHub Repository Sync TUI';
export const APP_VERSION = '1.0.0';

// デフォルト値
export const DEFAULT_TARGET_REPO = 'Sunwood-ai-labs/claude-glm-actions-lab-sandbox';
export const DEFAULT_TARGET_ORG = 'Sunwood-ai-labs';
export const DEFAULT_EXCLUDED_REPOS = ['claude-glm-actions-lab-sandbox'];

// パス
export const WORKFLOW_SOURCE_PATH = '.github/workflows';
export const AGENTS_SOURCE_PATH = '.claude/agents';

// Git設定
export const GIT_USER_NAME = 'Claude Code';
export const GIT_USER_EMAIL = 'noreply@anthropic.com';

// コミットメッセージ
export const WORKFLOW_COMMIT_MESSAGE = `🤖 ci(sync): sync workflows from claude-glm-actions-lab

Co-Authored-By: Claude <noreply@anthropic.com>`;

export const AGENTS_COMMIT_MESSAGE = `🤖 chore(agents): sync agents from claude-glm-actions-lab

Co-Authored-By: Claude <noreply@anthropic.com>`;

// TUIカラー
export const COLORS = {
  green: 'GREEN',
  yellow: 'YELLOW',
  red: 'RED',
  blue: 'BLUE',
  cyan: 'CYAN',
  bright: 'BRIGHT_WHITE'
} as const;

// 同期項目
export type SyncItemType = 'workflows' | 'agents';

export const SYNC_ITEMS = {
  workflows: 'Workflows',
  agents: 'Agents'
} as const;
