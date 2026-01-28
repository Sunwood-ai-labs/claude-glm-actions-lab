/**
 * Agents同期
 */

import * as path from 'path';
import * as fs from 'fs';
import { directoryExists, findFiles, copyFile, createTempDir, removeTempDir } from '../utils/file.js';
import { cloneRepo, hasChanges, addFiles, commit, push } from './git.js';
import { AGENTS_SOURCE_PATH, GIT_USER_NAME, GIT_USER_EMAIL, AGENTS_COMMIT_MESSAGE } from '../config/constants.js';
import { GitError } from '../utils/error.js';

export interface AgentSyncResult {
  repo: string;
  success: boolean;
  synced: string[];
  error?: string;
}

/**
 * Agentsを同期
 */
export async function syncAgents(
  projectRoot: string,
  targetRepo: string
): Promise<AgentSyncResult> {
  const result: AgentSyncResult = {
    repo: targetRepo,
    success: false,
    synced: []
  };

  const tempDir = createTempDir();

  try {
    const agentsSource = path.join(projectRoot, AGENTS_SOURCE_PATH);

    // ソースディレクトリのチェック
    if (!directoryExists(agentsSource)) {
      throw new GitError(`エージェントソースディレクトリが見つかりません: ${agentsSource}`);
    }

    // エージェントファイルを取得
    const agentFiles = findFiles(
      agentsSource,
      /\.(md|json|yml|yaml)$/
    );

    if (agentFiles.length === 0) {
      result.success = true;
      return result;
    }

    // ターゲットリポジトリをクローン
    const targetDir = path.join(tempDir, 'target');
    await cloneRepo(targetRepo, targetDir);

    // ターゲットのエージェントディレクトリを作成
    const targetAgentsDir = path.join(targetDir, '.claude', 'agents');

    // エージェントファイルをコピー（ディレクトリ構造を維持）
    for (const file of agentFiles) {
      const relPath = path.relative(agentsSource, file);
      const targetFile = path.join(targetAgentsDir, relPath);
      const fileDir = path.dirname(targetFile);

      // ディレクトリを作成
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      copyFile(file, targetFile);
      result.synced.push(relPath);
    }

    // 変更をコミットしてプッシュ
    if (await hasChanges(targetDir)) {
      await addFiles(targetDir, ['.claude/agents/']);
      await commit(targetDir, AGENTS_COMMIT_MESSAGE, GIT_USER_NAME, GIT_USER_EMAIL);
      await push(targetDir);
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : '不明なエラー';
  } finally {
    removeTempDir(tempDir);
  }

  return result;
}

/**
 * 複数リポジトリにAgentsを同期
 */
export async function syncAgentsToRepos(
  projectRoot: string,
  repos: string[]
): Promise<AgentSyncResult[]> {
  const results: AgentSyncResult[] = [];

  for (const repo of repos) {
    const result = await syncAgents(projectRoot, repo);
    results.push(result);
  }

  return results;
}
