-- ============================================================
-- haithammisape — Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Auto-create profile on signup ────────────────────────────
-- Run this ONCE if you don't already have a profile trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Grant yourself admin access ───────────────────────────────
-- After registering your account, run this (replace with your email):
-- UPDATE public.profiles SET role = 'admin' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your@email.com'
-- );
-- ─────────────────────────────────────────────────────────────

-- ── Categories (tree structure) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  parent_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  type        text NOT NULL DEFAULT 'general', -- 'blog' | 'service' | 'product' | 'project' | 'general'
  icon        text,
  color       text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories"   ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories USING (is_admin());

-- ── Projects ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  slug             text NOT NULL UNIQUE,
  description      text NOT NULL,
  long_description text,
  featured_image   text,
  images           text[]   NOT NULL DEFAULT '{}',
  category_id      uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags             text[]   NOT NULL DEFAULT '{}',
  tech_stack       text[]   NOT NULL DEFAULT '{}',
  is_free          boolean  NOT NULL DEFAULT true,
  price            numeric(10,2),
  preview_url      text,
  download_url     text,
  status           text     NOT NULL DEFAULT 'draft',   -- 'draft' | 'published'
  is_featured      boolean  NOT NULL DEFAULT false,
  stripe_price_id  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published projects" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage projects"         ON public.projects USING (is_admin());

-- ── Project Purchases ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_purchases (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id               uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stripe_session_id        text,
  stripe_payment_intent_id text,
  amount                   numeric(10,2),
  status                   text NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
  created_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE public.project_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their purchases"  ON public.project_purchases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all purchases"   ON public.project_purchases FOR SELECT USING (is_admin());
CREATE POLICY "System can insert purchases"     ON public.project_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update purchases"     ON public.project_purchases FOR UPDATE USING (true);

-- ── Comments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type     text NOT NULL,  -- 'blog' | 'service' | 'product' | 'project'
  entity_id       uuid NOT NULL,
  parent_id       uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content         text NOT NULL,
  is_pinned       boolean NOT NULL DEFAULT false,
  is_edited       boolean NOT NULL DEFAULT false,
  likes_count     integer NOT NULL DEFAULT 0,
  dislikes_count  integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_entity_idx ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments"              ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit their own comments"     ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users or admins can delete comments"   ON public.comments FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ── Comment Votes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comment_votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id  uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type   text NOT NULL,  -- 'like' | 'dislike'
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS comment_votes_comment_idx ON public.comment_votes(comment_id);

ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes"           ON public.comment_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote"    ON public.comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote"     ON public.comment_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote"     ON public.comment_votes FOR DELETE USING (auth.uid() = user_id);

-- ── RPC helpers for atomic vote counts ───────────────────────
CREATE OR REPLACE FUNCTION public.increment_comment_vote(comment_id uuid, col_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF col_name = 'likes_count' THEN
    UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = comment_id;
  ELSIF col_name = 'dislikes_count' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count + 1 WHERE id = comment_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_comment_vote(comment_id uuid, col_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF col_name = 'likes_count' THEN
    UPDATE public.comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = comment_id;
  ELSIF col_name = 'dislikes_count' THEN
    UPDATE public.comments SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = comment_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.switch_comment_vote(comment_id uuid, add_col text, sub_col text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.comments SET
    likes_count    = CASE WHEN add_col = 'likes_count'    THEN likes_count + 1    WHEN sub_col = 'likes_count'    THEN GREATEST(0, likes_count - 1)    ELSE likes_count    END,
    dislikes_count = CASE WHEN add_col = 'dislikes_count' THEN dislikes_count + 1 WHEN sub_col = 'dislikes_count' THEN GREATEST(0, dislikes_count - 1) ELSE dislikes_count END
  WHERE id = comment_id;
END;
$$;
