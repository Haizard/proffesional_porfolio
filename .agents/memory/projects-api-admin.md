---
name: Projects API admin flag
description: /api/projects filters by status=published by default; pass status=all for admin
---

## Rule
`GET /api/projects` only returns published projects unless `?status=all` is appended.

**Why:** Public pages must not show draft projects. Admin pages (app/admin/projects/page.tsx) fetch with `?status=all&limit=100` to see everything.

**How to apply:** Any new admin list that fetches projects must include `status=all`. Public-facing pages should omit it.
