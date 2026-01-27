#!/bin/bash
# GitHub リポジトリ同期ツール TUI ラッパー
# Secrets、Workflows、Agents を同期

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# スクリプトのディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TUI_BIN="$SCRIPT_DIR/sync-repo-tui/target/release/sync-repo-tui"

# バイナリが存在しない場合はビルド
if [ ! -f "$TUI_BIN" ]; then
    echo -e "${CYAN}バイナリをビルド中...${NC}"
    cd "$SCRIPT_DIR/sync-repo-tui"
    cargo build --release
    echo -e "${GREEN}ビルド完了${NC}"
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
