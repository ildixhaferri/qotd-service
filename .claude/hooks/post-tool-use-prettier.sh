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

if [[ "$TOOL" =~ ^(Write|Edit)$ ]] && [[ -n "$FILE" ]]; then
  if [[ "$FILE" =~ \.(ts|js|html|css|json|md)$ ]]; then
    npx prettier --write "$FILE" --log-level silent 2>/dev/null || true
  fi
fi
