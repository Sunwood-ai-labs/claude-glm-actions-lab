#!/bin/bash
# GitHub Secrets 同期スクリプト
# .env ファイルから SECRET_* で始まる変数を GitHub Secrets として同期

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# スクリプトのディレクトリ（.env を探すため）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# .env ファイルのチェック
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${RED}エラー: .env ファイルが見つかりません${NC}"
    echo "まず .env.example をコピーして .env を作成してください:"
    echo "  cp .env.example .env"
    exit 1
fi

# .env ファイルを読み込む
set -a
source "$PROJECT_ROOT/.env"
set +a

# ターゲットリポジトリのチェック
if [ -z "$TARGET_REPO" ]; then
    echo -e "${RED}エラー: TARGET_REPO が設定されていません${NC}"
    exit 1
fi

echo -e "${GREEN}=== GitHub Secrets 同期 ===${NC}"
echo "ターゲットリポジトリ: $TARGET_REPO"
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

# SECRET_* プレフィックスの変数を抽出して同期
echo ""
echo "シークレットを同期します..."
echo ""

SECRET_COUNT=0

# .env ファイルを直接パースして SECRET_* 行を抽出
while IFS='=' read -r key value; do
    # 空行とコメントをスキップ
    [[ -z "$key" ]] && continue
    [[ "$key" =~ ^#.* ]] && continue

    # SECRET_ プレフィックスの変数を処理
    if [[ "$key" =~ ^SECRET_ ]]; then
        # SECRET_ プレフィックスを除去してシークレット名を取得
        secret_name="${key#SECRET_}"

        # 値の前後の引用符を除去
        value="${value%\"}"
        value="${value#\"}"

        # シークレットを設定
        echo -e "${YELLOW}設定中:${NC} $secret_name"

        # gh コマンドでシークレットを設定
        echo -n "$value" | gh secret set "$secret_name" --repo "$TARGET_REPO" 2>/dev/null

        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓ 成功${NC}"
            ((SECRET_COUNT++))
        else
            echo -e "  ${RED}✗ 失敗${NC}"
        fi
    fi
done < "$PROJECT_ROOT/.env"

echo ""
echo -e "${GREEN}=== 同期完了 ===${NC}"
echo "$SECRET_COUNT 個のシークレットを同期しました"
