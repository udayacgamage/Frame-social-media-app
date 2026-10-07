-- Frame (Atelier Frame) Core Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  pronouns TEXT,
  role_title TEXT DEFAULT 'Visual Artist',
  avatar_url TEXT,
  bio TEXT,
  quiet_mode_enabled BOOLEAN DEFAULT false,
  gear_list JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Followers / Following
CREATE TABLE IF NOT EXISTS public.followers (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- 4. Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_private BOOLEAN DEFAULT false,
  members_count INT DEFAULT 0,
  active_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Room Memberships
CREATE TABLE IF NOT EXISTS public.room_members (
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (room_id, user_id)
);

-- 6. Posts & Process Records
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  co_author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
  title TEXT,
  caption TEXT,
  image_url TEXT NOT NULL,
  raw_image_url TEXT,
  aspect_ratio TEXT DEFAULT '4:5' CHECK (aspect_ratio IN ('4:5', '16:9', '1:1')),
  camera_exif JSONB DEFAULT '{}'::jsonb,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'contributors', 'followers')),
  quiet_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Process Stages (for Technique Breakdowns)
CREATE TABLE IF NOT EXISTS public.process_stages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  tag TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  gear_setup TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (post_id, step_number)
);

-- 8. Shared Stories
CREATE TABLE IF NOT EXISTS public.shared_stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Story Contributions
CREATE TABLE IF NOT EXISTS public.story_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES public.shared_stories(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  location_name TEXT,
  timestamp_label TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT,
  closes_at TIMESTAMPTZ NOT NULL,
  guidelines JSONB DEFAULT '[]'::jsonb,
  entries_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Challenge Submissions
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id TEXT REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (challenge_id, user_id)
);

-- 12. Comments & Real-time Discussion
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 14. Bookmarks
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('invite', 'comment', 'like', 'mention', 'follow', 'challenge', 'story')),
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Rooms are viewable by everyone" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Process stages are viewable by everyone" ON public.process_stages FOR SELECT USING (true);
CREATE POLICY "Shared stories are viewable by everyone" ON public.shared_stories FOR SELECT USING (true);
CREATE POLICY "Story contributions are viewable by everyone" ON public.story_contributions FOR SELECT USING (true);
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Challenge submissions are viewable by everyone" ON public.challenge_submissions FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Bookmarks viewable by owner" ON public.post_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Room members are viewable by everyone" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Followers are viewable by everyone" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Authenticated write policies: Profiles
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts
CREATE POLICY "Users can insert posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Process Stages
CREATE POLICY "Users can insert stages for own posts" ON public.process_stages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()));
CREATE POLICY "Users can update stages for own posts" ON public.process_stages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()));

-- Comments
CREATE POLICY "Users can insert comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);

-- Likes
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "Users can bookmark posts" ON public.post_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON public.post_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Room Members
CREATE POLICY "Users can join rooms" ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_members FOR DELETE USING (auth.uid() = user_id);

-- Followers
CREATE POLICY "Users can follow others" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- Challenge Submissions
CREATE POLICY "Users can submit to challenges" ON public.challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Story Contributions
CREATE POLICY "Users can contribute to stories" ON public.story_contributions FOR INSERT WITH CHECK (auth.uid() = contributor_id);

-- Shared Stories
CREATE POLICY "Users can create stories" ON public.shared_stories FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own stories" ON public.shared_stories FOR UPDATE USING (auth.uid() = creator_id);

-- Notifications
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Triggers & Functions
-- ============================================================

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, handle, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'handle', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New Creator'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment/decrement likes_count on posts
CREATE OR REPLACE FUNCTION public.handle_post_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like();

-- Increment/decrement comments_count on posts
CREATE OR REPLACE FUNCTION public.handle_post_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_comment_change
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment();

-- Increment/decrement members_count on rooms
CREATE OR REPLACE FUNCTION public.handle_room_member()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.rooms SET members_count = members_count + 1 WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.rooms SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_room_member_change
  AFTER INSERT OR DELETE ON public.room_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_room_member();

-- Increment/decrement entries_count on challenges
CREATE OR REPLACE FUNCTION public.handle_challenge_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenges SET entries_count = entries_count + 1 WHERE id = NEW.challenge_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenges SET entries_count = GREATEST(entries_count - 1, 0) WHERE id = OLD.challenge_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_challenge_submission_change
  AFTER INSERT OR DELETE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_challenge_submission();

-- Updated_at auto-update for profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Realtime Publication
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_room ON public.posts(room_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_story_contributions_story ON public.story_contributions(story_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON public.room_members(user_id);

-- ============================================================
-- Storage Buckets & Policies
-- ============================================================

-- Create public media buckets (posts, avatars, stories)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('posts', 'posts', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('stories', 'stories', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read policy for media
CREATE POLICY "Public Access for frame media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('posts', 'avatars', 'stories'));

-- Authenticated upload with folder isolation
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('posts', 'avatars', 'stories')
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Authenticated update with folder isolation
CREATE POLICY "Authenticated users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('posts', 'avatars', 'stories')
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
)
WITH CHECK (
  bucket_id IN ('posts', 'avatars', 'stories')
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Authenticated delete with folder isolation
CREATE POLICY "Authenticated users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('posts', 'avatars', 'stories')
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- ============================================================
-- Direct Messages Table & Policies
-- ============================================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own direct messages"
ON public.direct_messages FOR SELECT
TO authenticated
USING ((select auth.uid()) = sender_id OR (select auth.uid()) = receiver_id);

CREATE POLICY "Users can insert direct messages"
ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can update their received direct messages"
ON public.direct_messages FOR UPDATE
TO authenticated
USING ((select auth.uid()) = receiver_id)
WITH CHECK ((select auth.uid()) = receiver_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver 
ON public.direct_messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_sender 
ON public.direct_messages(receiver_id, sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_direct_messages_unread 
ON public.direct_messages(receiver_id, is_read);


