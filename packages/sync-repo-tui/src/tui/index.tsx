/**
 * TUIメインコントローラー (ink版)
 *
 * ink は一度の render で完結する必要があるため、
 * 全体を一つの React アプリケーションとして設計する
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { checkEnvExists } from '../config/env.js';
import { createConfig, hasEnabledSyncItem, type Config } from '../config/index.js';
import { performGitHubChecks, getOrgRepos } from '../github/index.js';
import { syncToRepos, getSyncSummary } from '../sync/index.js';
import { AuthenticationError } from '../utils/error.js';
import * as fs from 'fs';
import * as path from 'path';

export interface TUIOptions {
  projectRoot: string;
}

// ステートタイプ
type AppState =
  | { type: 'loading' }
  | { type: 'envCheck'; hasEnv: boolean }
  | { type: 'githubCheck' }
  | { type: 'modeSelect' }
  | { type: 'repoConfirm'; mode: 'single' | 'org'; config: Config }
  | { type: 'repoInput'; mode: 'single' | 'org'; config: Config }
  | { type: 'orgRepoList'; config: Config; repos: string[] }
  | { type: 'syncOptions'; config: Config; repos: string[] }
  | { type: 'finalConfirm'; config: Config; repos: string[] }
  | { type: 'syncing'; config: Config; repos: string[] }
  | { type: 'done'; summary: any }
  | { type: 'error'; message: string };

export const TUIApp: React.FC<TUIOptions> = ({ projectRoot }) => {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({ type: 'loading' });
  const [config, setConfig] = useState<Config | null>(null);
  const [repos, setRepos] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // 初期化
  useEffect(() => {
    const init = async () => {
      // .envチェック
      const hasEnv = checkEnvExists(projectRoot);
      setState({ type: 'envCheck', hasEnv });

      if (!hasEnv) {
        return;
      }

      // GitHubチェック
      setState({ type: 'githubCheck' });
      try {
        await performGitHubChecks();
        const cfg = createConfig(projectRoot);
        setConfig(cfg);
        setState({ type: 'modeSelect' });
      } catch (error) {
        if (error instanceof AuthenticationError) {
          setState({ type: 'error', message: error.message });
        } else {
          setState({ type: 'error', message: String(error) });
        }
      }
    };

    init();
  }, [projectRoot]);

  // キー入力ハンドリング
  useInput((input: string, key: any) => {
    // Ctrl+C で終了
    if (key.ctrl && input === 'c') {
      exit();
    }

    // ローディング/エラー時は何もしない
    if (state.type === 'loading' || state.type === 'githubCheck' || state.type === 'error') {
      return;
    }

    // envCheck
    if (state.type === 'envCheck' && !state.hasEnv) {
      if (key.return) {
        exit();
      }
      return;
    }

    // modeSelect
    if (state.type === 'modeSelect') {
      if (input === '1') {
        setState({ type: 'repoConfirm', mode: 'single', config: config! });
      } else if (input === '2') {
        setState({ type: 'repoConfirm', mode: 'org', config: config! });
      } else if (key.escape || input === 'q') {
        exit();
      }
      return;
    }

    // repoConfirm
    if (state.type === 'repoConfirm') {
      if (input === 'y' || input === 'Y') {
        setState({ type: 'repoInput', mode: state.mode, config: state.config });
      } else if (input === 'n' || input === 'N' || key.return || key.escape) {
        if (state.mode === 'single') {
          setRepos([state.config.targetRepo]);
          setState({ type: 'syncOptions', config: state.config, repos: [state.config.targetRepo] });
        } else {
          // 組織モードの場合はリポジトリを取得
          fetchOrgRepos(state.config);
        }
      }
      return;
    }

    // repoInput
    if (state.type === 'repoInput') {
      if (key.return) {
        const value = inputValue.trim() || (state.mode === 'single' ? state.config.targetRepo : state.config.targetOrg);
        if (state.mode === 'single') {
          const newConfig = { ...state.config, targetRepo: value };
          setConfig(newConfig);
          setRepos([value]);
          setState({ type: 'syncOptions', config: newConfig, repos: [value] });
        } else {
          const newConfig = { ...state.config, targetOrg: value };
          setConfig(newConfig);
          fetchOrgRepos(newConfig);
        }
        setInputValue('');
      } else if (key.backspace || key.delete) {
        setInputValue((prev: string) => prev.slice(0, -1));
      } else if (key.escape) {
        setState({ type: 'modeSelect' });
        setInputValue('');
      } else if (input && /^[a-zA-Z0-9\/\-]$/.test(input)) {
        setInputValue((prev: string) => prev + input);
      }
      return;
    }

    // orgRepoList
    if (state.type === 'orgRepoList') {
      if (input === 'y' || input === 'Y') {
        setState({ type: 'syncOptions', config: state.config, repos: state.repos });
      } else if (input === 'n' || input === 'N' || key.return || key.escape) {
        exit();
      }
      return;
    }

    // syncOptions
    if (state.type === 'syncOptions') {
      if (input === '1') {
        const newConfig = { ...state.config, syncOptions: { ...state.config.syncOptions, workflows: !state.config.syncOptions.workflows } };
        setConfig(newConfig);
        setState({ ...state, config: newConfig });
      } else if (input === '2') {
        const newConfig = { ...state.config, syncOptions: { ...state.config.syncOptions, agents: !state.config.syncOptions.agents } };
        setConfig(newConfig);
        setState({ ...state, config: newConfig });
      } else if (key.return) {
        if (hasEnabledSyncItem(state.config)) {
          setState({ type: 'finalConfirm', config: state.config, repos: state.repos });
        }
      } else if (key.escape) {
        exit();
      }
      return;
    }

    // finalConfirm
    if (state.type === 'finalConfirm') {
      if (input === 'y' || input === 'Y') {
        // 同期実行
        executeSync(state.config, state.repos);
      } else if (input === 'n' || input === 'N' || key.return || key.escape) {
        exit();
      }
      return;
    }
  });

  // 組織のリポジトリを取得
  const fetchOrgRepos = useCallback(async (cfg: Config) => {
    try {
      const orgRepos = await getOrgRepos(cfg.targetOrg, cfg.excludedRepos);
      if (orgRepos.length === 0) {
        setState({ type: 'error', message: '有効なリポジトリが見つかりませんでした' });
      } else {
        setRepos(orgRepos);
        setState({ type: 'orgRepoList', config: cfg, repos: orgRepos });
      }
    } catch (error) {
      setState({ type: 'error', message: String(error) });
    }
  }, []);

  // 同期を実行
  const executeSync = useCallback(async (cfg: Config, targetRepos: string[]) => {
    setState({ type: 'syncing', config: cfg, repos: targetRepos });
    try {
      const syncResult = await syncToRepos(projectRoot, targetRepos, cfg.syncOptions);
      const summary = getSyncSummary(syncResult);
      setState({ type: 'done', summary });
    } catch (error) {
      setState({ type: 'error', message: String(error) });
    }
  }, [projectRoot]);

  // レンダリング
  return (
    <Box flexDirection="column" paddingY={1}>
      {renderState(state, inputValue)}
    </Box>
  );
};

// ステートに応じたレンダリング
const renderState = (state: AppState, inputValue: string) => {
  // .envがない場合
  if (state.type === 'envCheck' && !state.hasEnv) {
    return (
      <Box borderStyle="single" borderColor="yellow" paddingX={2} paddingY={1}>
        <Box flexDirection="column">
          <Text color="yellow">警告: .env ファイルが見つかりません</Text>
          <Text>.env.example から .env を作成して、編集してください</Text>
          <Text dimColor>Enter で終了</Text>
        </Box>
      </Box>
    );
  }

  // ローディング
  if (state.type === 'loading' || state.type === 'githubCheck') {
    return (
      <Box>
        <Text dimColor>GitHub認証チェック中...</Text>
      </Box>
    );
  }

  // エラー
  if (state.type === 'error') {
    return (
      <Box borderStyle="single" borderColor="red" paddingX={2} paddingY={1}>
        <Box flexDirection="column">
          <Text color="red">エラー: {state.message}</Text>
          <Text dimColor>Ctrl+C で終了</Text>
        </Box>
      </Box>
    );
  }

  // モード選択
  if (state.type === 'modeSelect') {
    return (
      <>
        <Box borderStyle="double" borderColor="cyan" paddingX={2} paddingY={1} marginBottom={1}>
          <Box flexDirection="column">
            <Text color="cyan" bold> GitHub リポジトリ同期ツール</Text>
            <Text color="cyan" bold> Sync Workflows and Agents </Text>
          </Box>
        </Box>
        <Box borderStyle="single" borderColor="white" paddingX={2} paddingY={1}>
          <Box flexDirection="column">
            <Text bold> 同期モードを選択してください:</Text>
            <Text></Text>
            <Text> [1] 単一リポジトリ</Text>
            <Text> [2] 組織内の全リポジトリ（除外リスト適用）</Text>
            <Text></Text>
            <Text dimColor> 終了: Ctrl+C または q</Text>
          </Box>
        </Box>
      </>
    );
  }

  // リポジトリ確認
  if (state.type === 'repoConfirm') {
    const target = state.mode === 'single' ? state.config.targetRepo : state.config.targetOrg;
    const label = state.mode === 'single' ? 'リポジトリ' : '組織';
    return (
      <Box borderStyle="single" borderColor="yellow" paddingX={2} paddingY={1}>
        <Box flexDirection="column">
          <Text color="yellow">{label}: {target}</Text>
          <Text></Text>
          <Text>別の{label}を指定しますか？</Text>
          <Text></Text>
          <Text dimColor> [Y] はい [N] いいえ</Text>
        </Box>
      </Box>
    );
  }

  // リポジトリ入力
  if (state.type === 'repoInput') {
    const label = state.mode === 'single' ? 'リポジトリ (例: org/repo):' : '組織名:';
    const current = state.mode === 'single' ? state.config.targetRepo : state.config.targetOrg;
    return (
      <Box borderStyle="single" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box flexDirection="column">
          <Text color="cyan">{label}</Text>
          <Text dimColor>現在: {current}</Text>
          <Text></Text>
          <Text color="white" backgroundColor="blue"> {inputValue || current} </Text>
          <Text></Text>
          <Text dimColor> 入力して Enter で確定、Escape でキャンセル</Text>
        </Box>
      </Box>
    );
  }

  // 組織リポジトリリスト
  if (state.type === 'orgRepoList') {
    return (
      <Box borderStyle="single" borderColor="white" paddingX={2} paddingY={1}>
        <Box flexDirection="column">
          <Text bold>対象リポジトリ ({state.repos.length} 件):</Text>
          <Text></Text>
          {state.repos.map((repo: string, i: number) => (
            <Text key={i}> {i + 1}. {repo}</Text>
          ))}
          <Text></Text>
          <Text>続行しますか？</Text>
          <Text dimColor> [Y] はい [N] いいえ</Text>
        </Box>
      </Box>
    );
  }

  // 同期オプション
  if (state.type === 'syncOptions') {
    return (
      <Box borderStyle="single" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box flexDirection="column">
          <Text bold>同期項目をON/OFFで選択してください:</Text>
          <Text></Text>
          <Text color={state.config.syncOptions.workflows ? 'green' : 'red'}>
            {' '}[1] Workflows: {state.config.syncOptions.workflows ? 'ON' : 'OFF'}
          </Text>
          <Text color={state.config.syncOptions.agents ? 'green' : 'red'}>
            {' '}[2] Agents: {state.config.syncOptions.agents ? 'ON' : 'OFF'}
          </Text>
          <Text></Text>
          <Text dimColor> 番号でON/OFF切替、Enter で確定、Escape で終了</Text>
        </Box>
      </Box>
    );
  }

  // 最終確認
  if (state.type === 'finalConfirm') {
    return (
      <Box borderStyle="single" borderColor="yellow" paddingX={2} paddingY={1}>
        <Box flexDirection="column">
          <Text bold>同期設定:</Text>
          {state.config.syncOptions.workflows && <Text color="green"> ✓ Workflows</Text>}
          {state.config.syncOptions.agents && <Text color="green"> ✓ Agents</Text>}
          <Text></Text>
          <Text>対象: {state.repos.length} 件のリポジトリ</Text>
          <Text></Text>
          <Text>同期を実行しますか？</Text>
          <Text dimColor> [Y] はい [N] いいえ</Text>
        </Box>
      </Box>
    );
  }

  // 同期中
  if (state.type === 'syncing') {
    return (
      <Box>
        <Text dimColor>同期中...</Text>
      </Box>
    );
  }

  // 完了
  if (state.type === 'done') {
    const { summary } = state;
    return (
      <Box flexDirection="column">
        <Box borderStyle="double" borderColor="green" paddingX={2} paddingY={1} marginBottom={1}>
          <Text color="green" bold> === 同期結果 === </Text>
        </Box>
        {summary.details.map((detail: string, i: number) => (
          <Text key={i} color={detail.startsWith('✓') ? 'green' : 'red'}> {detail}</Text>
        ))}
        <Text></Text>
        <Text bold> 合計: {summary.successCount}/{summary.totalRepos} 成功</Text>
        {summary.failCount > 0 && <Text color="red"> {summary.failCount} 件失敗</Text>}
        <Text></Text>
        <Text color="green" bold> === 完了 === </Text>
        <Text dimColor>Ctrl+C で終了</Text>
      </Box>
    );
  }

  return <Text>Unknown state</Text>;
};

/**
 * TUIを実行
 */
export async function runTUI(options: TUIOptions): Promise<void> {
  // ink の render は非同期で完了するため、Promise を返す
  return new Promise(() => {
    // 実際のレンダリングは呼び出し元で行う
  });
}
