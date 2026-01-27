/**
 * エラーハンドリング
 */

export class SyncError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SyncError';
  }
}

export class ConfigError extends SyncError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

export class GitError extends SyncError {
  constructor(message: string) {
    super(message, 'GIT_ERROR');
    this.name = 'GitError';
  }
}

export class GitHubError extends SyncError {
  constructor(message: string) {
    super(message, 'GITHUB_ERROR');
    this.name = 'GitHubError';
  }
}

export class AuthenticationError extends SyncError {
  constructor(message: string = 'GitHub認証に失敗しました') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * エラーをユーザーフレンドリーなメッセージに変換
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof SyncError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '不明なエラーが発生しました';
}
