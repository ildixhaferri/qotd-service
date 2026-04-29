---
name: add-quote
description: Add a new quote to the database via the API. Usage: /add-quote <text> | <author>
---

Add a new quote to the running qotd-service.

**Arguments:** $ARGUMENTS

**Current quote count (live):**
!`curl -s http://localhost:3000/api/quotes 2>/dev/null | python -c "import sys,json; d=json.load(sys.stdin); print(str(len(d.get('data',[]))) + ' quotes currently in DB')" 2>/dev/null || echo "server not running — start with: npm run dev"`

**Instructions:**
Parse $ARGUMENTS as `<text> | <author>` (pipe-separated). Then POST to the API:

```
curl -s -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"<text>\", \"author\": \"<author>\"}"
```

Report the full JSON response and confirm the new quote ID.
If the server is not running, tell the user to run `npm run dev` first.
