import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sampleActivity, sampleMessages } from '@/data/mockData';
import type { ActivityItem, MessageThread } from '@/types';

function mapNotification(row: any): ActivityItem {
  const sender = row.sender || {};
  const data = row.data || {};
  return {
    id: row.id,
    type: row.type as ActivityItem['type'],
    user: {
      id: sender.id || row.sender_id || '',
      name: sender.display_name || '',
      handle: sender.handle || '',
      avatarUrl: sender.avatar_url || '',
    },
    message: data.message || `${sender.display_name || 'Someone'} ${row.type}d your post`,
    targetTitle: data.target_title,
    timeAgo: getTimeAgo(row.created_at),
    unread: !row.is_read,
    actionRequired: data.action_required || false,
    forkVersion: data.fork_version,
  };
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function useActivity() {
  const { user, isMockMode } = useAuth();
  const [activity, setActivity] = useState<ActivityItem[]>(isMockMode ? sampleActivity : []);
  const [messages, setMessages] = useState<MessageThread[]>(isMockMode ? sampleMessages : []);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchActivity = useCallback(async () => {
    if (isMockMode) {
      setActivity(sampleActivity);
      setMessages(sampleMessages);
      setUnreadCount(sampleActivity.filter((a) => a.unread).length);
      return;
    }

    if (!user?.id) return;

    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:profiles!notifications_sender_id_fkey(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (err) {
      setError(err.message);
      setActivity(sampleActivity);
    } else {
      const mapped = (data || []).map(mapNotification);
      setActivity(mapped);
      setUnreadCount(mapped.filter((a) => a.unread).length);
    }
    setLoading(false);
  }, [user?.id, isMockMode]);

  // Realtime subscription for new notifications
  useEffect(() => {
    fetchActivity();

    if (isMockMode || !user?.id || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('notifications')
            .select(`
              *,
              sender:profiles!notifications_sender_id_fkey(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const newItem = mapNotification(data);
            setActivity((prev) => [newItem, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isMockMode, fetchActivity]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      setActivity((prev) =>
        prev.map((a) => (a.id === notificationId ? { ...a, unread: false } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (isMockMode || !user?.id) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    },
    [user?.id, isMockMode]
  );

  const markAllRead = useCallback(async () => {
    setActivity((prev) => prev.map((a) => ({ ...a, unread: false })));
    setUnreadCount(0);

    if (isMockMode || !user?.id) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  }, [user?.id, isMockMode]);

  return { activity, messages, loading, error, unreadCount, markAsRead, markAllRead, refetch: fetchActivity };
}
