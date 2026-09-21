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

function mapComment(row: any): Comment {
  const author = row.author || {};
  return {
    id: row.id,
    postId: row.post_id,
    authorId: author.id || row.author_id,
    authorHandle: author.handle || '',
    authorName: author.display_name || '',
    authorAvatar: author.avatar_url || '',
    content: row.content,
    createdAt: row.created_at,
  };
}

export function useComments(postId: string) {
  const { user, isMockMode } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (isMockMode || !postId) {
      setComments([]);
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
    } else {
      setComments((data || []).map(mapComment));
    }
    setLoading(false);
  }, [postId, isMockMode]);

  // Realtime subscription for new comments
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
          // Fetch full comment with author join
          const { data } = await supabase
            .from('post_comments')
            .select(`
              *,
              author:profiles!post_comments_author_id_fkey(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setComments((prev) => [...prev, mapComment(data)]);
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
      if (isMockMode || !user?.id || !postId) {
        // Mock: add a local comment
        const mockComment: Comment = {
          id: `mock-${Date.now()}`,
          postId,
          authorId: user?.id || 'mock',
          authorHandle: 'you',
          authorName: 'You',
          authorAvatar: '',
          content,
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [...prev, mockComment]);
        return { error: null };
      }

      const { error: err } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        });

      return { error: err?.message ?? null };
      // Realtime subscription will add the comment to the list
    },
    [postId, user?.id, isMockMode]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (isMockMode) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        return { error: null };
      }

      const { error: err } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      return { error: err?.message ?? null };
    },
    [isMockMode]
  );

  return { comments, loading, error, addComment, deleteComment, refetch: fetchComments };
}
