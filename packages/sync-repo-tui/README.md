# @sunwood-ai-labs/sync-repo-tui

GitHub リポジトリ同期 TUI ツール - WorkflowsとAgentsをターゲットリポジトリに同期

## 機能

- **TUIインターフェース**: terminal-kitを使った快適なターミナルUI
- **単一リポジトリモード**: 指定したリポジトリに同期
- **組織モード**: 組織内の全リポジトリに一括同期（除外リスト対応）
- **同期項目選択**: Workflows、AgentsのON/OFF選択
- **進捗表示**: リアルタイムの進捗フィードバック

## インストール

```bash
npm install -g @sunwood-ai-labs/sync-repo-tui
```

## 使い方

```bash
# TUIを起動
sync-repo-tui

# プロジェクトルートを指定
sync-repo-tui --project-root /path/to/project
```

## 設定

`.env`ファイルで設定：

```bash
TARGET_REPO=Sunwood-ai-labs/claude-glm-actions-lab-sandbox
TARGET_ORG=Sunwood-ai-labs
EXCLUDED_REPOS=claude-glm-actions-lab-sandbox
```

## 依存関係

- Node.js >= 18.0.0
- gh CLI (GitHub CLI)

## 開発

```bash
# インストール
npm install

# ビルド
npm run build

# 実行
npm start

# 開発（ビルド+実行）
npm run dev
```

## ライセンス

MIT
