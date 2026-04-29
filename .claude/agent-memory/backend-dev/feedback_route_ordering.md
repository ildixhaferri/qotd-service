---
name: Route ordering rule for Hono
description: Static named routes must be declared before dynamic/wildcard routes in Hono routers
type: feedback
---

In Hono, named static path segments (e.g. `/count`, `/random`) must be registered **before** any dynamic or wildcard segments (e.g. `/:id`) on the same router — otherwise the dynamic segment matches first and the named routes become unreachable.

**Why:** Hono matches routes in declaration order. A route like `router.get('/:id', ...)` will consume requests for `/count` before the static handler ever runs.

**How to apply:** Whenever adding a new named sub-route alongside an existing `/:id` handler, always place the named route declaration above the `/:id` declaration in the file.
