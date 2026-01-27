<div align="center">
  <img src="./assets/header.svg" alt="claude-glm-actions-lab header" width="100%"/>


# claude-glm-actions-lab

<p align="center">
  <a href="https://github.com/Sunwood-AI-OSS-Hub/claude-glm-actions-lab/stargazers">
    <img src="https://img.shields.io/github/stars/Sunwood-AI-OSS-Hub/claude-glm-actions-lab?style=flat-square" alt="Stars"/>
  </a>
  <a href="https://github.com/Sunwood-AI-OSS-Hub/claude-glm-actions-lab/network/members">
    <img src="https://img.shields.io/github/forks/Sunwood-AI-OSS-Hub/claude-glm-actions-lab?style=flat-square" alt="Forks"/>
  </a>
  <a href="https://github.com/Sunwood-AI-OSS-Hub/claude-glm-actions-lab/issues">
    <img src="https://img.shields.io/github/issues/Sunwood-AI-OSS-Hub/claude-glm-actions-lab?style=flat-square" alt="Issues"/>
  </a>
  <a href="https://github.com/Sunwood-AI-OSS-Hub/claude-glm-actions-lab/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Sunwood-AI-OSS-Hub/claude-glm-actions-lab?style=flat-square" alt="License"/>
  </a>
  <a href="./README.ja.md">
    <img src="https://img.shields.io/badge/lang-日本語-red.svg?style=flat-square" alt="日本語"/>
  </a>
</p>

</div>


## 概要

Claude Code と GLM API を統合した GitHub Actions の実験リポジトリです。GitHub Actions で Claude Code を GLM（General Language Model）API と共に使用するためのワークフローと設定が含まれています。

## 機能

- GLM API を使用した Claude Code 用 GitHub Actions ワークフロー
- Issue コメントとプルリクエストレビューのサポート
- 設定可能な API エンドポイントとモデル
- ボット自己トリガー防止機能
- キャラクターベースの AI エージェント（ギャル先輩 & 姐さん）
- サンドボックステスト用リポジトリ同期スクリプト

## ディレクトリ構成

```
claude-glm-actions-lab/
├── .claude/
│   ├── agents/              # Claude Code エージェント定義
│   │   ├── reviewer.md      # 玲子（レイコ）姐さんレビュアーエージェント 👠
│   │   ├── implementer.md   # 美咲（ミサキ）先輩インプリメーターエージェント 🔥
│   │   └── doc-translator.md # 琴音（コトネ）ドキュメンターエージェント 📚
│   └── rules/               # キャラクターエージェントルール（レガシー）
│       ├── implementer.md   # ギャル先輩インプリメーター 🔥
│       └── reviewer.md      # 姐さんレビュアー 👠
├── .github/
│   └── workflows/           # GitHub Actions ワークフロー定義
│       ├── claude-glm-responder.yml
│       └── pr-auto-comment.yml
├── sandbox/                 # CI/CD実装テスト環境
│   └── claude-glm-actions-lab-sandbox/
│       ├── .claude/
│       │   └── rules/       # キャラクターエージェントルール（サンドボックス）
│       ├── .github/
│       │   ├── agents/      # エージェント定義
│       │   ├── scripts/     # ユーティリティスクリプト（サンドボックス）
│       │   └── workflows/   # ワークフロー（サンドボックス）
│       └── scripts/         # 同期スクリプト
│           ├── sync-repo.sh      # メイン同期スクリプト
│           ├── sync-secrets.sh   # GitHub Secrets同期
│           └── sync-workflows.sh # ワークフロー同期
└── scripts/                 # 同期スクリプト（ルートレベル）
    ├── sync-repo.sh
    ├── sync-secrets.sh
    └── sync-workflows.sh
```

### sandbox/ ディレクトリ

`sandbox/claude-glm-actions-lab-sandbox/` ディレクトリは **CI/CD 実装テスト** 用の隔離された環境です。

- デプロイ前の GitHub Actions ワークフローのテスト
- ワークフロー設定とトリガーの検証
- メインリポジトリに影響を与えない開発・実験
- GLM API エンドポイントとの統合テスト
- リポジトリ同期（Secrets & Workflows）

## AI キャラクター 👠🔥📚

このプロジェクトでは、タスク別にキャラクターベースの AI エージェントを使用しています。

### 美咲（ミサキ）先輩 - Implementer 🔥

- **役割**: 実装担当
- **性格**: 明るくて、ちょっとおっちょこちょい。でもやる時はやる！
- **ファイル**: `.claude/agents/implementer.md`
- **スタイル**: 若者言葉全開、絵文字たくさん「マジで」「やばい」

### 玲子（レイコ）姐さん - Reviewer 👠

- **役割**: コードレビュー＆修正担当
- **性格**: 厳しいけど面倒見が良い。昔から業界にいるベテラン
- **ファイル**: `.claude/agents/reviewer.md`
- **スタイル**: 姐さん言葉「〜だねぇ」「ちゃんと」「まあいいわ」

### 琴音（コトネ） - Documenter 📚

- **役割**: ドキュメント＆翻訳担当
- **性格**: 知的で穏やか。読書家で、言葉遣いが丁寧。文学的な表現が好き
- **ファイル**: `.claude/agents/doc-translator.md`
- **スタイル**: 文学的な表現、丁寧語、思いやりのあるトーン

## 使用方法

### 必要条件

- GitHub リポジトリ
- GLM API キー（リポジトリシークレットに `ZAI_API_KEY` として設定）
- GitHub CLI (`gh`) - 同期スクリプト用
- オプション: `ANTHROPIC_BASE_URL` 変数の設定（デフォルト: `https://api.z.ai/api/anthropic`）

### セットアップ

1. ワークフローファイルをリポジトリにコピー：
   ```bash
   cp .github/workflows/claude-glm-responder.yml <your-repo>/.github/workflows/
   ```

2. リポジトリ設定でシークレットを設定：
   - `ZAI_API_KEY`: GLM API キー
   - `GH_PAT_ONIZUKA`: PR 作成用 GitHub パーソナルアクセストークン（オプション）

3. オプション: 変数の設定：
   - `ANTHROPIC_BASE_URL`: API ベース URL
   - `API_TIMEOUT_MS`: リクエストタイムアウト（ミリ秒、デフォルト: 3000000）
   - `ANTHROPIC_DEFAULT_OPUS_MODEL`: デフォルト Opus モデル（デフォルト: glm-4.7）
   - `ANTHROPIC_DEFAULT_SONNET_MODEL`: デフォルト Sonnet モデル（デフォルト: glm-4.7）
   - `ANTHROPIC_DEFAULT_HAIKU_MODEL`: デフォルト Haiku モデル（デフォルト: glm-4.5-air）

### 同期スクリプト

サンドボックステスト管理用の同期スクリプトが含まれています。

#### sync-repo.sh
シークレットとワークフローの同期を調整するメインスクリプト。

```bash
./scripts/sync-repo.sh
```

#### sync-secrets.sh
`.env` ファイルからターゲットリポジトリに GitHub Secrets を同期します。

```bash
./scripts/sync-secrets.sh
```

設定（`.env`）：
```bash
TARGET_REPO=Sunwood-ai-labs/claude-glm-actions-lab-sandbox
SECRET_CLAUDE_GLM_DEV_API_KEY=your_api_key_here
```

#### sync-workflows.sh
ターゲットリポジトリにワークフローファイルを同期します。

```bash
./scripts/sync-workflows.sh
```

## ワークフロートリガー

ワークフローは以下の場合にトリガーされます：

- Issue コメント（`@claude` を含む）
- プルリクエストレビューコメント（`@claude` を含む）
- Issue オープン/割り当て（`@claude` を含む）

## プロジェクト統計

- **総ファイル数**: 24+
- **総行数**: 2,100+
- **言語**: Markdown (9), Bash (6), YAML (2)

### 言語別内訳

| 言語 | ファイル数 | 行数 | サイズ |
|------|-----------|------|-------|
| Markdown | 9 | 840+ | ~22 KB |
| Bash | 6 | 606 | 18.1 KB |
| YAML | 2 | 160+ | ~5 KB |

*統計は PR #22 のクリーンアップ後に更新されました*

## リポジトリ情報

- **リモート URL**: https://github.com/Sunwood-AI-OSS-Hub/claude-glm-actions-lab.git
- **デフォルトブランチ**: main
- **総コミット数**: 31+

### コントリビューター

| 名前 | コミット数 |
|------|-----------|
| Sunwood-ai-labs | 27 |
| Maki | 4 |

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

---

[Sunwood AI Labs](https://github.com/Sunwood-ai-labs) が ❤️ を込めて作成しました
