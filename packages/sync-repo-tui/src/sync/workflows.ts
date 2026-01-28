/**
 * Workflows同期
 */

import * as path from 'path';
import { directoryExists, findFiles, copyFile, createTempDir, removeTempDir } from '../utils/file';
import { cloneRepo, hasChanges, addFiles, commit, push } from './git';
import { WORKFLOW_SOURCE_PATH, GIT_USER_NAME, GIT_USER_EMAIL, WORKFLOW_COMMIT_MESSAGE } from '../config/constants';
import { GitError } from '../utils/error';

export interface WorkflowSyncResult {
  repo: string;
  success: boolean;
  synced: string[];
  error?: string;
}

/**
 * Workflowsを同期
 */
export async function syncWorkflows(
  projectRoot: string,
  targetRepo: string
): Promise<WorkflowSyncResult> {
  const result: WorkflowSyncResult = {
    repo: targetRepo,
    success: false,
    synced: []
  };

  const tempDir = createTempDir();

  try {
    const workflowSource = path.join(projectRoot, WORKFLOW_SOURCE_PATH);

    // ソースディレクトリのチェック
    if (!directoryExists(workflowSource)) {
      throw new GitError(`ワークフローソースディレクトリが見つかりません: ${workflowSource}`);
    }

    // ワークフローファイルを取得（disabledフォルダを除外）
    const workflowFiles = findFiles(
      workflowSource,
      /\.(yml|yaml)$/,
      [/\/disabled\//]
    );

    if (workflowFiles.length === 0) {
      result.success = true;
      return result;
    }

    // ターゲットリポジトリをクローン
    const targetDir = path.join(tempDir, 'target');
    await cloneRepo(targetRepo, targetDir);

    // ターゲットのワークフローディレクトリを作成
    const targetWorkflowDir = path.join(targetDir, '.github', 'workflows');
    if (!directoryExists(targetWorkflowDir)) {
      require('fs').mkdirSync(targetWorkflowDir, { recursive: true });
    }

    // ワークフローファイルをコピー
    for (const file of workflowFiles) {
      const filename = path.basename(file);
      const targetFile = path.join(targetWorkflowDir, filename);
      copyFile(file, targetFile);
      result.synced.push(filename);
    }

    // 変更をコミットしてプッシュ
    if (await hasChanges(targetDir)) {
      await addFiles(targetDir, ['.github/workflows/']);
      await commit(targetDir, WORKFLOW_COMMIT_MESSAGE, GIT_USER_NAME, GIT_USER_EMAIL);
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
 * 複数リポジトリにWorkflowsを同期
 */
export async function syncWorkflowsToRepos(
  projectRoot: string,
  repos: string[]
): Promise<WorkflowSyncResult[]> {
  const results: WorkflowSyncResult[] = [];

  for (const repo of repos) {
    const result = await syncWorkflows(projectRoot, repo);
    results.push(result);
  }

  return results;
}
