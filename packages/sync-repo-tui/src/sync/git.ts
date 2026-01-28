/**
 * Git操作ラッパー
 */

import { execa } from 'execa';
import { GitError } from '../utils/error.js';

/**
 * Gitコマンドを実行
 */
async function execGit(args: string[], cwd?: string): Promise<string> {
  try {
    const { stdout } = await execa('git', args, {
      cwd,
      reject: true
    });
    return stdout;
  } catch (error) {
    if (error instanceof Error) {
      throw new GitError(`Gitコマンド失敗: ${error.message}`);
    }
    throw new GitError('Gitコマンド失敗');
  }
}

/**
 * リポジトリをクローン
 */
export async function cloneRepo(repo: string, targetDir: string): Promise<void> {
  await execGit(['clone', repo, targetDir]);
}

/**
 * Gitのステータスを確認
 */
export async function getStatus(repoPath: string): Promise<string> {
  return execGit(['status', '--porcelain'], repoPath);
}

/**
 * ファイルをステージング
 */
export async function addFiles(repoPath: string, files: string[]): Promise<void> {
  await execGit(['add', ...files], repoPath);
}

/**
 * コミットを作成
 */
export async function commit(
  repoPath: string,
  message: string,
  userName: string,
  userEmail: string
): Promise<void> {
  // ユーザー設定
  await execGit(['config', 'user.name', userName], repoPath);
  await execGit(['config', 'user.email', userEmail], repoPath);

  // コミット
  await execGit(['commit', '-m', message], repoPath);
}

/**
 * プッシュ
 */
export async function push(repoPath: string, branch: string = 'main'): Promise<void> {
  try {
    await execGit(['push', 'origin', branch], repoPath);
  } catch (error) {
    // mainブランチが存在しない場合、HEADをプッシュ
    await execGit(['push', 'origin', 'HEAD'], repoPath);
  }
}

/**
 * 変更があるかチェック
 */
export async function hasChanges(repoPath: string): Promise<boolean> {
  const status = await getStatus(repoPath);
  return status.trim().length > 0;
}
