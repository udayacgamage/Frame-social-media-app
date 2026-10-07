import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

const defaultMockComments: Comment[] = [
  {
    id: 'mock-c1',
    postId: 'default',
    authorId: 'user_marcus',
    authorHandle: 'marcus_k',
    authorName: 'Marcus K.',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    content: 'The highlights retain beautiful texture. Did you expose for the architectural shadows in-camera?',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'mock-c2',
    postId: 'default',
    authorId: 'user_chloe',
    authorHandle: 'chloelens',
    authorName: 'Chloe Lens',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    content: 'Geometric balance on the midtones is pristine. Feels reminiscent of Lucien Hervé.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

function mapComment(row: any): Comment {
  const author = row.author || {};
  return {
    id: row.id,
    postId: row.post_id,
    authorId: author.id || row.author_id,
    authorHandle: author.handle || 'creator',
    authorName: author.display_name || author.handle || 'Creator',
    authorAvatar: author.avatar_url || '',
    content: row.content,
    createdAt: row.created_at,
  };
}

export function useComments(postId: string) {
  const { user, isMockMode } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      setComments(defaultMockComments.map((c) => ({ ...c, postId })));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles!post_comments_author_id_fkey(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (err) {
      setError(err.message);
      // In case of network error, show mock comments as graceful fallback
      setComments(defaultMockComments.map((c) => ({ ...c, postId })));
    } else {
      setComments((data || []).map(mapComment));
    }
    setLoading(false);
  }, [postId, isMockMode]);

  // Realtime subscription for live comments
  useEffect(() => {
    fetchComments();

    if (isMockMode || !postId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          // Fetch full comment with author details joined
          const { data } = await supabase
            .from('post_comments')
            .select(`
              *,
              author:profiles!post_comments_author_id_fkey(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setComments((prev) => {
              if (prev.some((c) => c.id === data.id)) return prev;
              return [...prev, mapComment(data)];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, isMockMode, fetchComments]);

  const addComment = useCallback(
    async (content: string) => {
      const cleanContent = content.trim();
      if (!cleanContent || !postId) {
        return { error: 'Comment cannot be empty' };
      }

      if (isMockMode || !user?.id) {
        const mockComment: Comment = {
          id: `mock-${Date.now()}`,
          postId,
          authorId: user?.id || 'mock',
          authorHandle: user?.user_metadata?.handle || 'you',
          authorName: user?.user_metadata?.display_name || 'You',
          authorAvatar: user?.user_metadata?.avatar_url || '',
          content: cleanContent,
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [...prev, mockComment]);
        return { error: null };
      }

      const { data, error: err } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: cleanContent,
        })
        .select(`
          *,
          author:profiles!post_comments_author_id_fkey(*)
        `)
        .single();

      if (err) {
        return { error: err.message };
      }

      if (data) {
        setComments((prev) => {
          if (prev.some((c) => c.id === data.id)) return prev;
          return [...prev, mapComment(data)];
        });
      }

      return { error: null };
    },
    [postId, user, isMockMode]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      // Optimistic delete
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      if (isMockMode) {
        return { error: null };
      }

      const { error: err } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (err) {
        await fetchComments();
        return { error: err.message };
      }

      return { error: null };
    },
    [isMockMode, fetchComments]
  );

  return { comments, loading, error, addComment, deleteComment, refetch: fetchComments };
}
