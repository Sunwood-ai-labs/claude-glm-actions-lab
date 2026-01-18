#!/bin/bash
# GitHub リポジトリ同期メインスクリプト
# Secrets、Workflows を同期

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# スクリプトのディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}${BOLD}"
cat <<'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   GitHub リポジトリ同期ツール                                  ║
║   Sync Secrets and Workflows                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# .env ファイルのチェック
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${YELLOW}警告: .env ファイルが見つかりません${NC}"
    echo ""
    read -p ".env.example から .env を作成しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        echo -e "${GREEN}.env を作成しました${NC}"
        echo "編集してから再実行してください: vi .env"
        exit 0
    else
        echo -e "${RED}エラー: .env が必要です${NC}"
        exit 1
    fi
fi

# .env を読み込んでターゲットを表示
set -a
source "$PROJECT_ROOT/.env"
set +a

TARGET_REPO="${TARGET_REPO:-Sunwood-ai-labs/claude-glm-actions-lab-sandbox}"

echo -e "${BLUE}ターゲットリポジトリ:${NC} $TARGET_REPO"
echo ""

# 同期項目の選択
echo -e "${BOLD}同期項目を選択してください:${NC}"
echo "  1) Secrets のみ"
echo "  2) Workflows のみ"
echo "  3) すべて (Secrets + Workflows)"
echo ""
read -p "選択 (1-3): " -n 1 -r
echo ""
echo ""

case $REPLY in
    1)
        echo -e "${YELLOW}=== Secrets 同步 ===${NC}"
        bash "$SCRIPT_DIR/sync-secrets.sh"
        ;;
    2)
        echo -e "${YELLOW}=== Workflows 同步 ===${NC}"
        bash "$SCRIPT_DIR/sync-workflows.sh"
        ;;
    3)
        echo -e "${YELLOW}=== すべて同期 ===${NC}"
        echo ""
        bash "$SCRIPT_DIR/sync-secrets.sh"
        echo ""
        echo ""
        bash "$SCRIPT_DIR/sync-workflows.sh"
        ;;
    *)
        echo -e "${RED}無効な選択です${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}${BOLD}=== 完了 ===${NC}"
