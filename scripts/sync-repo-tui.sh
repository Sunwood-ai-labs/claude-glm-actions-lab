#!/bin/bash
# GitHub リポジトリ同期ツール TUI ラッパー
# Secrets、Workflows、Agents を同期

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# スクリプトのディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# sync-repo-tui バイナリの場所を探す
# 1. ローカルのビルドディレクトリ
TUI_BIN="$SCRIPT_DIR/sync-repo-tui/target/release/sync-repo-tui"
# 2. インストール先
if [ ! -f "$TUI_BIN" ]; then
    TUI_BIN="$HOME/.local/bin/sync-repo-tui"
fi

# バイナリが存在しない場合はインストール案内
if [ ! -f "$TUI_BIN" ]; then
    echo -e "${RED}エラー: sync-repo-tui バイナリが見つかりません${NC}"
    echo ""
    echo "インストールするには以下のコマンドを実行してください:"
    echo -e "${CYAN}  bash scripts/install-sync-repo-tui.sh${NC}"
    echo ""
    echo "または、ソースからビルドするには:"
    echo -e "${CYAN}  cd scripts/sync-repo-tui && cargo build --release${NC}"
    exit 1
fi

# 環境変数を設定して実行
export PROJECT_ROOT="$PROJECT_ROOT"
export SCRIPT_DIR="$SCRIPT_DIR"

# .env ファイルのチェック
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

exec "$TUI_BIN"
