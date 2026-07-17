---
name: Comment vote RPCs
description: Three Supabase RPC functions handle atomic comment vote count updates
---

## Rule
The comment vote API (`/api/comments/[id]/vote`) calls `increment_comment_vote`, `decrement_comment_vote`, and `switch_comment_vote` via `supabase.rpc()`. These functions must exist in Supabase.

**Why:** Direct UPDATE of likes_count/dislikes_count from the client risks race conditions; RPCs are atomic and run as SECURITY DEFINER.

**How to apply:** Both functions are included in `schema-migration.sql`. If votes return 500, check that the RPCs exist in Supabase → Database → Functions.
