#!/bin/bash
# GitHub リポジトリ同期メインスクリプト
# Secrets、Workflows、Agents を同期

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# スクリプトのディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}${BOLD}"
cat <<'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   GitHub リポジトリ同期ツール                                  ║
║   Sync Secrets, Workflows, and Agents                        ║
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

# デフォルト値
TARGET_REPO="${TARGET_REPO:-Sunwood-ai-labs/claude-glm-actions-lab-sandbox}"
TARGET_ORG="${TARGET_ORG:-Sunwood-ai-labs}"

# 除外リスト（デフォルト）
EXCLUDED_REPOS="${EXCLUDED_REPOS:-claude-glm-actions-lab-sandbox}"

# gh コマンドのチェック
if ! command -v gh &> /dev/null; then
    echo -e "${RED}エラー: gh コマンドがインストールされていません${NC}"
    echo "https://cli.github.com/ からインストールしてください"
    exit 1
fi

# 認証チェック
if ! gh auth status &> /dev/null; then
    echo -e "${RED}エラー: GitHub にログインしていません${NC}"
    echo "gh auth login でログインしてください"
    exit 1
fi

# 同期モードの選択
echo -e "${BOLD}同期モードを選択してください:${NC}"
echo "  1) 単一リポジトリ"
echo "  2) 組織内の全リポジトリ（除外リスト適用）"
echo ""
read -p "選択 (1-2): " -n 1 -r
echo ""
echo ""

MODE="$REPLY"

# ターゲットリポジトリのリストを取得
TARGET_REPOS=()

if [ "$MODE" = "1" ]; then
    # 単一リポジトリモード
    echo -e "${BLUE}ターゲットリポジトリ:${NC} $TARGET_REPO"
    read -p "別のリポジトリを指定しますか？ (現在: $TARGET_REPO) (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "リポジトリ (例: org/repo): " TARGET_REPO
    fi
    TARGET_REPOS=("$TARGET_REPO")
    echo ""
elif [ "$MODE" = "2" ]; then
    # 組織モード
    echo -e "${BLUE}ターゲット組織:${NC} $TARGET_ORG"
    read -p "別の組織を指定しますか？ (現在: $TARGET_ORG) (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "組織名: " TARGET_ORG
    fi

    echo ""
    echo -e "${YELLOW}除外リスト:${NC} $EXCLUDED_REPOS"
    read -p "除外リストを追加しますか？ (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "追加する除外リポジトリ（カンマ区切り）: " ADDITIONAL_EXCLUDE
        if [ -n "$ADDITIONAL_EXCLUDE" ]; then
            EXCLUDED_REPOS="$EXCLUDED_REPOS,$ADDITIONAL_EXCLUDE"
        fi
    fi

    echo ""
    echo "組織 $TARGET_ORG のリポジトリを取得中..."

    # 組織内のリポジトリを取得（除外リストでフィルタ）
    while IFS= read -r line; do
        repo_name=$(echo "$line" | awk '{print $1}')
        # 除外リストチェック
        excluded=false
        IFS=',' read -ra EXCLUDE_ARRAY <<< "$EXCLUDED_REPOS"
        for exclude in "${EXCLUDE_ARRAY[@]}"; do
            exclude_trimmed=$(echo "$exclude" | xargs)
            if [ "$repo_name" = "$TARGET_ORG/$exclude_trimmed" ] || [ "$repo_name" = "$exclude_trimmed" ]; then
                excluded=true
                break
            fi
        done

        if [ "$excluded" = false ]; then
            TARGET_REPOS+=("$repo_name")
        fi
    done < <(gh repo list "$TARGET_ORG" --limit 1000 2>/dev/null | grep -v '^$' || true)

    if [ ${#TARGET_REPOS[@]} -eq 0 ]; then
        echo -e "${RED}エラー: 有効なリポジトリが見つかりませんでした${NC}"
        exit 1
    fi

    echo ""
    echo -e "${GREEN}対象リポジトリ (${#TARGET_REPOS[@]} 件):${NC}"
    for repo in "${TARGET_REPOS[@]}"; do
        echo "  - $repo"
    done
    echo ""
    read -p "続行しますか？ (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "キャンセルしました"
        exit 0
    fi
    echo ""
else
    echo -e "${RED}無効な選択です${NC}"
    exit 1
fi

# 同期項目の選択（ON/OFF）
SYNC_SECRETS=false
SYNC_WORKFLOWS=true
SYNC_AGENTS=true

echo -e "${BOLD}同期項目をON/OFFで選択してください:${NC}"
echo ""
echo "  [1] Secrets: ${RED}OFF${NC}"
echo "  [2] Workflows: ${GREEN}ON${NC}"
echo "  [3] Agents: ${GREEN}ON${NC}"
echo ""
echo "番号を入力してON/OFFを切り替えてください（ Enter で確定）:"
echo ""

while true; do
    read -p "> " -n 1 -r SELECTION
    echo ""

    case $SELECTION in
        1)
            if [ "$SYNC_SECRETS" = true ]; then
                SYNC_SECRETS=false
            else
                SYNC_SECRETS=true
            fi
            ;;
        2)
            if [ "$SYNC_WORKFLOWS" = true ]; then
                SYNC_WORKFLOWS=false
            else
                SYNC_WORKFLOWS=true
            fi
            ;;
        3)
            if [ "$SYNC_AGENTS" = true ]; then
                SYNC_AGENTS=false
            else
                SYNC_AGENTS=true
            fi
            ;;
        "")
            # Enterで確定
            break
            ;;
        *)
            echo -e "${RED}無効な選択です${NC}"
            continue
            ;;
    esac

    # 画面を更新
    echo ""
    echo -e "${BOLD}同期項目をON/OFFで選択してください:${NC}"
    echo ""
    if [ "$SYNC_SECRETS" = true ]; then
        echo "  [1] Secrets: ${GREEN}ON${NC}"
    else
        echo "  [1] Secrets: ${RED}OFF${NC}"
    fi

    if [ "$SYNC_WORKFLOWS" = true ]; then
        echo "  [2] Workflows: ${GREEN}ON${NC}"
    else
        echo "  [2] Workflows: ${RED}OFF${NC}"
    fi

    if [ "$SYNC_AGENTS" = true ]; then
        echo "  [3] Agents: ${GREEN}ON${NC}"
    else
        echo "  [3] Agents: ${RED}OFF${NC}"
    fi
    echo ""
    echo "番号を入力してON/OFFを切り替えてください（ Enter で確定）:"
    echo ""
done

echo ""
echo -e "${CYAN}選択された同期項目:${NC}"
[ "$SYNC_SECRETS" = true ] && echo "  ✓ Secrets"
[ "$SYNC_WORKFLOWS" = true ] && echo "  ✓ Workflows"
[ "$SYNC_AGENTS" = true ] && echo "  ✓ Agents"
echo ""

# 何も選択されていない場合
if [ "$SYNC_SECRETS" = false ] && [ "$SYNC_WORKFLOWS" = false ] && [ "$SYNC_AGENTS" = false ]; then
    echo -e "${RED}エラー: 同期項目が選択されていません${NC}"
    exit 1
fi

read -p "続行しますか？ (y/N): " -n 1 -r
echo ""
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "キャンセルしました"
    exit 0
fi

# 同期関数
sync_to_repos() {
    local sync_type="$1"
    local script_name="$2"

    for repo in "${TARGET_REPOS[@]}"; do
        echo -e "${CYAN}${BOLD}=== $repo に同期 ===${NC}"
        TARGET_REPO="$repo" bash "$SCRIPT_DIR/$script_name"
        echo ""
        echo ""
    done
}

# 同期実行
if [ "$SYNC_SECRETS" = true ]; then
    sync_to_repos "Secrets" "sync-secrets.sh"
fi

if [ "$SYNC_WORKFLOWS" = true ]; then
    sync_to_repos "Workflows" "sync-workflows.sh"
fi

if [ "$SYNC_AGENTS" = true ]; then
    sync_to_repos "Agents" "sync-agents.sh"
fi

echo ""
echo -e "${GREEN}${BOLD}=== 完了 ===${NC}"
