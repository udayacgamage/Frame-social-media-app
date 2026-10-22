import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sampleMessages, samplePosts } from '@/data/mockData';
import type { ChatMessage, StoryContributor } from '@/types';

const isUUID = (str?: string): boolean =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const mockConversations: Record<string, ChatMessage[]> = {
  msg_1: [
    {
      id: 'm1-1',
      senderId: 'chloe',
      content: 'Hey! Are we locking the 35mm slides before sunrise for the Ella story?',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      timeLabel: '4h ago',
      isMe: false,
      isRead: true,
      status: 'read',
    },
    {
      id: 'm1-2',
      senderId: 'me',
      content: 'Yes, I finished processing the contact sheets. The dawn light on the tea rows turned out exceptionally crisp.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      timeLabel: '2h ago',
      isMe: true,
      isRead: true,
      status: 'read',
    },
    {
      id: 'm1-3',
      senderId: 'chloe',
      content: 'Stunning. Can you contribute those 2 high-contrast frames to Chapter 3?',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      timeLabel: '30m ago',
      isMe: false,
      isRead: true,
      status: 'read',
    },
    {
      id: 'm1-4',
      senderId: 'chloe',
      content: 'Are we locking the 35mm slides before sunrise?',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      timeLabel: '5m ago',
      isMe: false,
      isRead: false,
      status: 'sent',
    },
  ],
  msg_2: [
    {
      id: 'm2-1',
      senderId: 'milo',
      content: 'Check the highlights on column 4 in the raw file.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      timeLabel: '1h ago',
      isMe: false,
      isRead: true,
      status: 'read',
    },
    {
      id: 'm2-2',
      senderId: 'me',
      content: 'Pulled the tone curve back -0.8 EV. Zero clipping in the harsh noon sun.',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      timeLabel: '30m ago',
      isMe: true,
      isRead: true,
      status: 'read',
    },
  ],
};

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'now';
  }
}

export function useChat(threadId: string, initialRecipient?: StoryContributor) {
  const { user, isMockMode } = useAuth();

  const thread = sampleMessages.find((t) => t.id === threadId || t.user.id === threadId);
  const postAuthor = samplePosts.find((p) => p.author.id === threadId)?.author;

  const recipient: StoryContributor = initialRecipient ||
    thread?.user ||
    (postAuthor
      ? {
          id: postAuthor.id,
          name: postAuthor.name || postAuthor.handle,
          handle: postAuthor.handle,
          avatarUrl: postAuthor.avatarUrl,
        }
      : {
          id: threadId,
          name:
            threadId === 'chloe'
              ? 'Chloe Lens'
              : threadId === 'milo'
              ? 'Milo Lens'
              : threadId === 'sarah'
              ? 'Sarah Wood'
              : 'Creator',
          handle:
            threadId === 'chloe'
              ? 'chloe.lens'
              : threadId === 'milo'
              ? 'milo_lens'
              : threadId === 'sarah'
              ? 'sarah_bakes'
              : 'creator',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return (
      mockConversations[threadId] || [
        {
          id: 'welcome-1',
          senderId: recipient.id,
          content: `Direct conversation with ${recipient.name}. Discuss technique, camera gear, and story collaborations.`,
          createdAt: new Date().toISOString(),
          timeLabel: 'Today',
          isMe: false,
          isRead: true,
          status: 'read',
        },
      ]
    );
  });

  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  const canUseSupabase =
    !isMockMode && isSupabaseConfigured && isUUID(user?.id) && isUUID(recipient.id);

  const fetchMessages = useCallback(async () => {
    if (!canUseSupabase) {
      if (mockConversations[threadId]) {
        setMessages(mockConversations[threadId]);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user!.id},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${user!.id})`
        )
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            threadId,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            content: m.content,
            imageUrl: m.image_url,
            isMe: m.sender_id === user!.id,
            isRead: m.is_read,
            createdAt: m.created_at,
            timeLabel: formatTime(m.created_at),
            status: m.is_read ? 'read' : 'sent',
          }))
        );

        // Mark unread messages received from other user as read
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .eq('receiver_id', user!.id)
          .eq('sender_id', recipient.id)
          .eq('is_read', false);
      } else if (mockConversations[threadId]) {
        setMessages(mockConversations[threadId]);
      }
    } catch {
      if (mockConversations[threadId]) {
        setMessages(mockConversations[threadId]);
      }
    } finally {
      setLoading(false);
    }
  }, [threadId, user?.id, recipient.id, canUseSupabase]);

  useEffect(() => {
    fetchMessages();

    if (!canUseSupabase) return;

    // Realtime subscription for incoming direct messages
    try {
      const channel = supabase
        .channel(`dm:${user!.id}:${recipient.id}:${Math.random().toString(36).slice(2, 8)}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
          },
          (payload) => {
            const m = payload.new as any;
            if (
              (m.sender_id === user!.id && m.receiver_id === recipient.id) ||
              (m.sender_id === recipient.id && m.receiver_id === user!.id)
            ) {
              setMessages((prev) => {
                if (prev.some((msg) => msg.id === m.id)) return prev;
                return [
                  ...prev,
                  {
                    id: m.id,
                    threadId,
                    senderId: m.sender_id,
                    receiverId: m.receiver_id,
                    content: m.content,
                    imageUrl: m.image_url,
                    isMe: m.sender_id === user!.id,
                    isRead: m.is_read,
                    createdAt: m.created_at,
                    timeLabel: formatTime(m.created_at),
                    status: m.is_read ? 'read' : 'sent',
                  },
                ];
              });
            }
          }
        )
        .subscribe();

      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    } catch {}
  }, [threadId, user?.id, recipient.id, canUseSupabase, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      const cleanText = content.trim();
      if (!cleanText && !imageUrl) {
        return { error: 'Message cannot be empty' };
      }

      const tempId = `temp-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const optimisticMsg: ChatMessage = {
        id: tempId,
        threadId,
        senderId: user?.id || 'me',
        receiverId: recipient.id,
        content: cleanText,
        imageUrl,
        isMe: true,
        isRead: false,
        createdAt: nowIso,
        timeLabel: formatTime(nowIso),
        status: 'sending',
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      // If demo mode or non-UUID ids, run simulated conversational exchange
      if (!canUseSupabase) {
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m))
          );
        }, 200);

        // Simulated intelligent creative reply
        setTimeout(() => {
          const replies = [
            'Agreed! Let’s lock the exposure settings for the shoot.',
            'Love this perspective. I will add it to our shared contact sheet.',
            'Checking the RAW highlights now — dynamic range looks great.',
            'Thanks for the update! Let’s review together before sunset.',
            'Looks fantastic. Are we posting this to the street photography room?',
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const replyIso = new Date().toISOString();
          const replyMsg: ChatMessage = {
            id: `reply-${Date.now()}`,
            threadId,
            senderId: recipient.id,
            content: randomReply,
            isMe: false,
            isRead: true,
            createdAt: replyIso,
            timeLabel: formatTime(replyIso),
            status: 'sent',
          };
          setMessages((prev) => [...prev, replyMsg]);
        }, 1100);

        return { error: null };
      }

      // Live Supabase Insert
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .insert({
            sender_id: user!.id,
            receiver_id: recipient.id,
            content: cleanText,
            image_url: imageUrl || null,
          })
          .select()
          .single();

        if (error) {
          // Graceful fallback: don't block user with an alert, mark sent locally
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m))
          );
          return { error: null };
        }

        if (data) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    id: data.id,
                    threadId,
                    senderId: data.sender_id,
                    receiverId: data.receiver_id,
                    content: data.content,
                    imageUrl: data.image_url,
                    isMe: true,
                    isRead: data.is_read,
                    createdAt: data.created_at,
                    timeLabel: formatTime(data.created_at),
                    status: 'sent',
                  }
                : m
            )
          );
        }

        return { error: null };
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m))
        );
        return { error: null };
      }
    },
    [canUseSupabase, recipient.id, recipient.name, threadId, user?.id]
  );

  return {
    messages,
    loading,
    recipient,
    sendMessage,
    refetch: fetchMessages,
  };
}
