<div align="center">

# @sunwood-ai-labs/sync-repo-tui

<a href="README_JA.md"><img src="https://img.shields.io/badge/ドキュメント-日本語-white.svg" alt="JA doc"/></a>
<a href="README.md"><img src="https://img.shields.io/badge/Documentation-English-white.svg" alt="EN doc"/></a>

**GitHub リポジトリ同期 TUI ツール**

Workflows と Agents をターゲットリポジトリに同期するための、美しいターミナルユーザーインターフェース

</div>

## 📖 概要

`@sunwood-ai-labs/sync-repo-tui` は、TypeScript と `terminal-kit` で実装された GitHub リポジトリ同期ツールです。単一のリポジトリや、組織内の複数のリポジトリに対して、GitHub Actions Workflows や Claude Agents の設定を効率的に同期することができます。

まるで図書館の本を整理するように、リポジトリの設定を美しく整えるお手伝いをします。🌸

## ✨ 機能

### TUI インターフェース
- `terminal-kit` を使った快適なターミナル UI
- 直感的なメニューシステム
- リアルタイムの進捗フィードバック

### 同期モード

#### 単一リポジトリモード
指定したリポジトリにのみ同期を実行します。特定のリポジトリを素早く更新したい場合に便利です。

#### 組織モード
組織内の全リポジトリに一括同期を行います。除外リストを設定することで、特定のリポジトリをスキップすることも可能です。

### 同期項目の選択
- **Workflows**: GitHub Actions ワークフロー (`.github/workflows/`) の同期
- **Agents**: Claude Agents の設定 (`.github/claude/agents/`) の同期

それぞれ ON/OFF を切り替えて、必要な項目のみを同期できます。

## 📦 インストール

### グローバルインストール

```bash
npm install -g @sunwood-ai-labs/sync-repo-tui
```

### ローカルインストール

```bash
npm install @sunwood-ai-labs/sync-repo-tui
```

## 🚀 使い方

### 基本的な使用方法

```bash
# TUI を起動
sync-repo-tui
```

### オプション

```bash
# プロジェクトルートを指定
sync-repo-tui --project-root /path/to/project

# ヘルプを表示
sync-repo-tui --help
```

### TUI の操作方法

1. **メインメニュー**: 同期モードを選択します
   - 単一リポジトリモード
   - 組織モード

2. **同期オプション**: 同期する項目を選択します
   - Workflows: ON/OFF
   - Agents: ON/OFF

3. **確認**: 同期設定を確認して実行します

4. **進捗表示**: リアルタイムで同期の進捗を確認できます

## ⚙️ 設定

`.env` ファイルで以下の設定を行います：

```bash
# ターゲットリポジトリ（単一リポジトリモードで使用）
TARGET_REPO=Sunwood-ai-labs/claude-glm-actions-lab-sandbox

# ターゲット組織（組織モードで使用）
TARGET_ORG=Sunwood-ai-labs

# 除外リポジトリ（組織モードで使用、カンマ区切り）
EXCLUDED_REPOS=claude-glm-actions-lab-sandbox,another-repo
```

### 設定値の詳細

| 設定項目 | 説明 | デフォルト値 |
|---------|------|-------------|
| `TARGET_REPO` | 同期先のリポジトリ（`owner/repo` 形式） | `Sunwood-ai-labs/claude-glm-actions-lab-sandbox` |
| `TARGET_ORG` | 同期先の組織名 | `Sunwood-ai-labs` |
| `EXCLUDED_REPOS` | 同步を除外するリポジトリ（カンマ区切り） | `claude-glm-actions-lab-sandbox` |

## 📋 依存関係

### 必要なソフトウェア

- **Node.js**: >= 18.0.0
- **gh CLI**: [GitHub CLI](https://cli.github.com/) がインストールされている必要があります

### GitHub CLI のインストール

```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 認証
gh auth login
```

## 🛠️ 開発

### 開発のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/Sunwood-ai-labs/claude-glm-actions-lab.git
cd claude-glm-actions-lab/packages/sync-repo-tui

# 依存関係のインストール
npm install

# 開発モードで実行（ビルド+実行）
npm run dev
```

### 利用可能なスクリプト

```bash
# ビルド
npm run build

# 実行
npm start

# 開発（ビルド+実行）
npm run dev

# クリーン
npm run clean
```

### プロジェクト構成

```
packages/sync-repo-tui/
├── package.json
├── tsconfig.json
├── README.md
├── README_JA.md
├── bin/
│   └── sync-repo-tui       # エントリーポイント
└── src/
    ├── index.ts            # メインエントリーポイント
    ├── cli.ts              # CLI 引数パーサー
    ├── config/             # 設定モジュール
    │   ├── env.ts          # 環境変数の読み込み
    │   ├── constants.ts    # 定数定義
    │   └── index.ts        # 設定管理
    ├── tui/                # TUI 画面モジュール
    │   ├── index.ts        # TUI メイン
    │   ├── main-menu.ts    # メインメニュー
    │   ├── sync-options.ts # 同期オプション選択
    │   ├── repo-selector.ts# リポジトリ選択
    │   ├── confirmation.ts # 確認画面
    │   └── progress.ts     # 進捗表示
    ├── sync/               # 同期ロジックモジュール
    │   ├── index.ts        # 同期メイン
    │   ├── workflows.ts    # Workflows 同期
    │   ├── agents.ts       # Agents 同期
    │   └── git.ts          # Git 操作
    ├── github/             # GitHub API ラッパー
    │   ├── index.ts        # GitHub API メイン
    │   └── repo-list.ts    # リポジトリ一覧取得
    └── utils/              # ユーティリティ
        ├── logger.ts       # ロガー
        ├── file.ts         # ファイル操作
        └── error.ts        # エラーハンドリング
```

## 🔍 同期されるファイル

このツールは以下のファイルを同期します：

### Workflows
- `.github/workflows/` ディレクトリ以下のすべての YAML ファイル

### Agents
- `.github/claude/agents/` ディレクトリ以下のすべての設定ファイル

## 📝 使用例

### シナリオ 1: 単一リポジトリに Workflows を同期

```bash
# .env を設定
echo "TARGET_REPO=my-org/my-repo" > .env

# TUI を起動
sync-repo-tui

# メニューで「単一リポジトリモード」を選択
# 「Workflows」を ON、「Agents」を OFF に設定
# 確認して実行
```

### シナリオ 2: 組織内の全リポジトリに同期

```bash
# .env を設定
echo "TARGET_ORG=my-org" > .env
echo "EXCLUDED_REPOS=repo1,repo2" >> .env

# TUI を起動
sync-repo-tui

# メニューで「組織モード」を選択
# 同期項目を選択
# 確認して実行
```

## 🤝 貢献

貢献を歓迎します！バグ報告や機能のリクエストは、Issue を作成してください。

## 📄 ライセンス

MIT License - 詳しくは LICENSE ファイルを参照してください。

## 👥 作者

Sunwood AI Labs

---

ひとつの物語が完成しました。
このツールが、あなたのリポジトリ管理を美しく整えるお手伝いをしてくれますように...🌸
