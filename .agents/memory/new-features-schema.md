---
name: New features schema
description: Categories, projects, comments tables — must be created in Supabase before any new routes work
---

## Rule
Run `schema-migration.sql` (repo root) in Supabase SQL Editor before testing any new feature.

**Why:** The app code for categories, projects, project_purchases, comments, and comment_votes is deployed but the Supabase tables don't auto-create — they only exist once the user runs the migration.

**How to apply:** If any new feature route returns a 500/42P01 "relation does not exist" error, remind the user to run the migration SQL. The file is at `artifacts/professional-portfolio/schema-migration.sql` and also lives at the repo root level.

## Tables added
- `categories` (id, name, slug, parent_id, type, icon, color, sort_order)
- `projects` (id, title, slug, is_free, price, download_url, stripe_price_id, category_id, status)
- `project_purchases` (user_id, project_id, stripe_session_id, status) — UNIQUE(user_id, project_id)
- `comments` (user_id, entity_type, entity_id, parent_id, content, is_pinned, likes_count, dislikes_count)
- `comment_votes` (user_id, comment_id, vote_type) — UNIQUE(user_id, comment_id)

## RLS
All tables use `is_admin()` SECURITY DEFINER function for admin policies (already exists from prior fix).
