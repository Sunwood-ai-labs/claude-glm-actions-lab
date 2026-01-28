/**
 * 同期ロジックのエントリーポイント
 */

import { syncWorkflowsToRepos, type WorkflowSyncResult } from './workflows.js';
import { syncAgentsToRepos, type AgentSyncResult } from './agents.js';
import type { SyncOptions } from '../config/index.js';

export interface SyncResult {
  workflows?: WorkflowSyncResult[];
  agents?: AgentSyncResult[];
}

/**
 * リポジトリに同期を実行
 */
export async function syncToRepos(
  projectRoot: string,
  repos: string[],
  syncOptions: SyncOptions
): Promise<SyncResult> {
  const result: SyncResult = {};

  if (syncOptions.workflows) {
    result.workflows = await syncWorkflowsToRepos(projectRoot, repos);
  }

  if (syncOptions.agents) {
    result.agents = await syncAgentsToRepos(projectRoot, repos);
  }

  return result;
}

/**
 * 同期結果のサマリーを取得
 */
export function getSyncSummary(result: SyncResult): {
  totalRepos: number;
  successCount: number;
  failCount: number;
  details: string[];
} {
  const details: string[] = [];
  let totalRepos = 0;
  let successCount = 0;
  let failCount = 0;

  if (result.workflows) {
    for (const r of result.workflows) {
      totalRepos++;
      if (r.success) {
        successCount++;
        details.push(`✓ ${r.repo}: Workflows (${r.synced.length} files)`);
      } else {
        failCount++;
        details.push(`✗ ${r.repo}: ${r.error || 'Failed'}`);
      }
    }
  }

  if (result.agents) {
    for (const r of result.agents) {
      totalRepos++;
      if (r.success) {
        successCount++;
        details.push(`✓ ${r.repo}: Agents (${r.synced.length} files)`);
      } else {
        failCount++;
        details.push(`✗ ${r.repo}: ${r.error || 'Failed'}`);
      }
    }
  }

  return { totalRepos, successCount, failCount, details };
}
