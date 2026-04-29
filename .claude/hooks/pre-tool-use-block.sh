#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)

TOOL=$(echo "$INPUT" | python -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_name', ''), end='')
except:
    pass
" 2>/dev/null || true)

FILE=$(echo "$INPUT" | python -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''), end='')
except:
    pass
" 2>/dev/null || true)

if [[ "$TOOL" =~ ^(Write|Edit)$ ]]; then
  if [[ "$FILE" =~ (\.env$|\.env\.|\.git[/\\]|\.github[/\\]workflows[/\\]|\.db$|\.db-journal$) ]]; then
    echo "BLOCKED: writes to protected file '$FILE' are not permitted by pre-tool-use hook." >&2
    exit 2
  fi
fi
