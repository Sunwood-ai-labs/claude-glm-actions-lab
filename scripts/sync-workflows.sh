#!/bin/bash
# GitHub Workflows 同期スクリプト
# このリポジトリのワークフローファイルをターゲットリポジトリに同期

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 一時ディレクトリ
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# スクリプトのディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# .env ファイルを読み込む（存在する場合）
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# ターゲットリポジトリのチェック
TARGET_REPO="${TARGET_REPO:-Sunwood-ai-labs/claude-glm-actions-lab-sandbox}"
WORKFLOW_SOURCE="$PROJECT_ROOT/.github/workflows"

echo -e "${GREEN}=== GitHub Workflows 同期 ===${NC}"
echo "ターゲットリポジトリ: $TARGET_REPO"
echo "ソースディレクトリ: $WORKFLOW_SOURCE"
echo ""

# ソースディレクトリのチェック
if [ ! -d "$WORKFLOW_SOURCE" ]; then
    echo -e "${RED}エラー: ワークフローソースディレクトリが見つかりません: $WORKFLOW_SOURCE${NC}"
    exit 1
fi

# ワークフローファイルの確認（disabled フォルダを除外）
WORKFLOW_FILES=$(find "$WORKFLOW_SOURCE" -path "*/disabled/*" -prune -o -name "*.yml" -print -o -name "*.yaml" -print 2>/dev/null || true)
if [ -z "$WORKFLOW_FILES" ]; then
    echo -e "${YELLOW}警告: ワークフローファイルが見つかりません${NC}"
    exit 0
fi

echo "同期するワークフローファイル:"
echo "$WORKFLOW_FILES" | while read -r file; do
    echo "  - $(basename "$file")"
done
echo ""

# gh コマンドのチェック
if ! command -v gh &> /dev/null; then
    echo -e "${RED}エラー: gh コマンドがインストールされていません${NC}"
    echo "https://cli.github.com/ からインストールしてください"
    exit 1
fi

# 認証チェック
echo "GitHub 認証チェック..."
if ! gh auth status &> /dev/null; then
    echo -e "${RED}エラー: GitHub にログインしていません${NC}"
    echo "gh auth login でログインしてください"
    exit 1
fi

# ターゲットリポジトリをクローン
echo ""
echo "ターゲットリポジトリをクローン中..."
TARGET_DIR="$TEMP_DIR/target"
gh repo clone "$TARGET_REPO" "$TARGET_DIR" 2>/dev/null

if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}エラー: リポジトリのクローンに失敗しました${NC}"
    exit 1
fi

# ターゲットのワークフローディレクトリを作成
TARGET_WORKFLOW_DIR="$TARGET_DIR/.github/workflows"
mkdir -p "$TARGET_WORKFLOW_DIR"

# ワークフローファイルをコピー
echo ""
echo "ワークフローファイルをコピー中..."

echo "$WORKFLOW_FILES" | while read -r file; do
    filename=$(basename "$file")
    echo -e "${YELLOW}コピー:${NC} $filename"
    cp "$file" "$TARGET_WORKFLOW_DIR/$filename"
done

# ターゲットリポジトリでコミット
cd "$TARGET_DIR"
echo ""
echo "変更をコミット中..."

if [ -n "$(git status --porcelain)" ]; then
    git config user.name "Claude Code"
    git config user.email "noreply@anthropic.com"

    git add .github/workflows/
    git commit -m "🤖 ci(sync): sync workflows from claude-glm-actions-lab

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo ""
    echo "変更をプッシュ中..."
    git push origin main 2>/dev/null || git push origin HEAD

    echo -e "${GREEN}✓ ワークフローを同期しました${NC}"
else
    echo -e "${YELLOW}同期する変更はありませんでした${NC}"
fi
