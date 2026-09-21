import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { samplePosts } from '@/data/mockData';
import type { Post } from '@/types';

/** Map a Supabase row (with joined author profile) to our Post type */
function mapPost(row: any): Post {
  const author = row.author || {};
  const coAuthor = row.co_author;
  return {
    id: row.id,
    author: {
      id: author.id || row.author_id,
      handle: author.handle || '',
      name: author.display_name || '',
      avatarUrl: author.avatar_url || '',
    },
    coAuthor: coAuthor
      ? {
          id: coAuthor.id,
          handle: coAuthor.handle,
          name: coAuthor.display_name,
          avatarUrl: coAuthor.avatar_url || '',
        }
      : undefined,
    roomName: row.room?.name || '',
    roomId: row.room_id || '',
    aspectRatio: row.aspect_ratio || '4:5',
    imageUrl: row.image_url,
    rawImageUrl: row.raw_image_url,
    caption: row.caption || '',
    likesCount: row.likes_count || 0,
    commentsCount: row.comments_count || 0,
    isLiked: row._is_liked ?? false,
    isBookmarked: row._is_bookmarked ?? false,
    processStagesCount: row._stages_count ?? 0,
    cameraExif: row.camera_exif || undefined,
    createdAt: row.created_at,
  };
}

interface UsePostsOptions {
  roomId?: string;
  authorId?: string;
  limit?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { user, isMockMode } = useAuth();
  const [posts, setPosts] = useState<Post[]>(isMockMode ? samplePosts : []);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (isMockMode) {
      let filtered = samplePosts;
      if (options.roomId) {
        filtered = filtered.filter((p) => p.roomId === options.roomId);
      }
      if (options.authorId) {
        filtered = filtered.filter((p) => p.author.id === options.authorId);
      }
      setPosts(filtered);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*),
        co_author:profiles!posts_co_author_id_fkey(*),
        room:rooms(name)
      `)
      .order('created_at', { ascending: false })
      .limit(options.limit || 30);

    if (options.roomId) {
      query = query.eq('room_id', options.roomId);
    }
    if (options.authorId) {
      query = query.eq('author_id', options.authorId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setPosts(samplePosts); // Fallback
    } else {
      // Check like/bookmark status for current user
      const mapped = (data || []).map(mapPost);

      if (user?.id && isSupabaseConfigured) {
        const postIds = mapped.map((p) => p.id);

        const [likesRes, bookmarksRes] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
          supabase.from('post_bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds),
        ]);

        const likedIds = new Set((likesRes.data || []).map((r: any) => r.post_id));
        const bookmarkedIds = new Set((bookmarksRes.data || []).map((r: any) => r.post_id));

        mapped.forEach((p) => {
          p.isLiked = likedIds.has(p.id);
          p.isBookmarked = bookmarkedIds.has(p.id);
        });
      }

      setPosts(mapped);
    }
    setLoading(false);
  }, [isMockMode, options.roomId, options.authorId, options.limit, user?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleLike = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
              }
            : p
        )
      );

      if (isMockMode || !user?.id) return;

      if (post.isLiked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
    },
    [posts, user?.id, isMockMode]
  );

  const toggleBookmark = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
        )
      );

      if (isMockMode || !user?.id) return;

      if (post.isBookmarked) {
        await supabase.from('post_bookmarks').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user.id });
      }
    },
    [posts, user?.id, isMockMode]
  );

  const createPost = useCallback(
    async (newPost: {
      imageUrl: string;
      rawImageUrl?: string;
      caption: string;
      roomId?: string;
      aspectRatio?: '4:5' | '16:9' | '1:1';
      visibility?: 'public' | 'contributors' | 'followers';
      quietMode?: boolean;
      cameraExif?: any;
    }) => {
      if (isMockMode || !user?.id) {
        return { error: null, postId: 'mock-post-id' };
      }

      const { data, error: err } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          image_url: newPost.imageUrl,
          raw_image_url: newPost.rawImageUrl,
          caption: newPost.caption,
          room_id: newPost.roomId,
          aspect_ratio: newPost.aspectRatio || '4:5',
          visibility: newPost.visibility || 'public',
          quiet_mode: newPost.quietMode || false,
          camera_exif: newPost.cameraExif || {},
        })
        .select('id')
        .single();

      if (!err) {
        await fetchPosts();
      }
      return { error: err?.message ?? null, postId: data?.id };
    },
    [user?.id, isMockMode, fetchPosts]
  );

  return { posts, loading, error, toggleLike, toggleBookmark, createPost, refetch: fetchPosts };
}
