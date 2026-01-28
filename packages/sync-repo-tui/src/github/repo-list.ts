/**
 * リポジトリリスト取得
 */

import { execa } from 'execa';
import { GitHubError, AuthenticationError } from '../utils/error';

export interface Repository {
  name: string;
  fullName: string;
}

/**
 * ghコマンドがインストールされているかチェック
 */
export async function checkGhInstalled(): Promise<boolean> {
  try {
    await execa('gh', ['--version'], { reject: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * GitHub認証チェック
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    await execa('gh', ['auth', 'status'], { reject: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * 組織内のリポジトリを取得
 */
export async function getOrgRepos(org: string, excludedRepos: string[] = []): Promise<string[]> {
  try {
    const { stdout } = await execa('gh', [
      'repo',
      'list',
      org,
      '--limit',
      '1000'
    ], { reject: true });

    const repos: string[] = [];
    const lines = stdout.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // 出力形式: "RepoName    Description"
      const repoName = line.split('\t')[0]?.trim();
      if (repoName) {
        const fullName = `${org}/${repoName}`;

        // 除外リストチェック
        const isExcluded = excludedRepos.some(exclude => {
          const excludeTrimmed = exclude.trim();
          return fullName === `${org}/${excludeTrimmed}` || fullName === excludeTrimmed;
        });

        if (!isExcluded) {
          repos.push(fullName);
        }
      }
    }

    return repos;
  } catch (error) {
    if (error instanceof Error) {
      throw new GitHubError(`リポジトリ取得失敗: ${error.message}`);
    }
    throw new GitHubError('リポジトリ取得失敗');
  }
}

/**
 * GitHub初期チェック
 */
export async function performGitHubChecks(): Promise<void> {
  const isInstalled = await checkGhInstalled();
  if (!isInstalled) {
    throw new GitHubError('ghコマンドがインストールされていません。https://cli.github.com/ からインストールしてください');
  }

  const isAuthenticated = await checkAuthStatus();
  if (!isAuthenticated) {
    throw new AuthenticationError('GitHubにログインしていません。gh auth login でログインしてください');
  }
}
