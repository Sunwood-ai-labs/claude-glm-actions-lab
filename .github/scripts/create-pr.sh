#!/bin/bash
set -e

# 引数から必要な情報を受け取る
BRANCH_NAME="$1"
ISSUE_NUMBER="$2"

# 既にPRが存在するか確認
PR_EXISTS=$(gh pr list --head "$BRANCH_NAME" --json number --jq '. | length > 0')
if [ "$PR_EXISTS" = "true" ]; then
  echo "PR already exists for branch $BRANCH_NAME, skipping..."
  exit 0
fi

# Claudeの最新のコメントを取得（配列の最後の要素を取得）
CLAUDE_COMMENT=$(gh issue view "$ISSUE_NUMBER" --json comments --jq '[.comments[] | select(.author.login == "claude[bot]") | .body] | last')

# 「Create PR ➔」リンクのURLを抽出（Pythonで正規表現）
CREATE_PR_URL=$(python3 -c "
import re, sys
comment = '''$CLAUDE_COMMENT'''
match = re.search(r'\[Create PR[^\]]*\]\((https[^)]+)\)', comment)
if match:
    print(match.group(1))
" || echo "")

if [ -n "$CREATE_PR_URL" ]; then
  # URLからtitleとbodyパラメータを抽出
  # titleは最初の&まで、bodyはtitle以降の全て
  ENCODED_TITLE=$(echo "$CREATE_PR_URL" | grep -oP 'title=\K[^&]+')
  ENCODED_BODY=$(echo "$CREATE_PR_URL" | sed 's/.*body=//' || echo "")

  # URLデコード（python3を使用）
  PR_TITLE=$(python3 -c "import sys, urllib.parse; print(urllib.parse.unquote('$ENCODED_TITLE'))")
  PR_BODY=$(python3 -c "import sys, urllib.parse; print(urllib.parse.unquote('$ENCODED_BODY'))")
else
  # フォールバック: Issueタイトルを使用
  ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title --jq '.title')
  if [[ "$ISSUE_TITLE" =~ を作って|を作成|を追加 ]]; then
    PR_PREFIX="feat:"
  elif [[ "$ISSUE_TITLE" =~ を修正|を直して|を修正 ]]; then
    PR_PREFIX="fix:"
  elif [[ "$ISSUE_TITLE" =~ を更新|を変更 ]]; then
    PR_PREFIX="update:"
  else
    PR_PREFIX=""
  fi

  if [ -n "$PR_PREFIX" ]; then
    FINAL_TITLE=$(echo "$ISSUE_TITLE" | sed 's/を作って/を追加/' | sed 's/を作成/を追加/' | sed 's/を追加$/を追加する/')
    PR_TITLE="$PR_PREFIX $FINAL_TITLE"
  else
    PR_TITLE="$ISSUE_TITLE"
  fi

  PR_BODY="$CLAUDE_COMMENT"
fi

# PR本文にClosesとGenerated withを追加
FINAL_BODY="$PR_BODY

---

Closes #$ISSUE_NUMBER

Generated with [Claude Code](https://claude.ai/code)"

# PRを作成
gh pr create \
  --base main \
  --head "$BRANCH_NAME" \
  --title "$PR_TITLE" \
  --body "$FINAL_BODY" \
  || echo "PR creation failed or branch has no changes"
