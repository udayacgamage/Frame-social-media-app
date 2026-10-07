import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sampleMessages } from '@/data/mockData';
import type { ChatMessage, StoryContributor } from '@/types';

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
  const recipient = initialRecipient || thread?.user || {
    id: threadId,
    name: 'Creator',
    handle: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return mockConversations[threadId] || [
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
    ];
  });
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  const fetchMessages = useCallback(async () => {
    if (isMockMode || !user?.id || !recipient.id) {
      if (mockConversations[threadId]) {
        setMessages(mockConversations[threadId]);
      }
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${user.id})`
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
          isMe: m.sender_id === user.id,
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
        .eq('receiver_id', user.id)
        .eq('sender_id', recipient.id)
        .eq('is_read', false);
    } else if (mockConversations[threadId]) {
      setMessages(mockConversations[threadId]);
    }

    setLoading(false);
  }, [threadId, user?.id, recipient.id, isMockMode]);

  useEffect(() => {
    fetchMessages();

    if (isMockMode || !user?.id || !isSupabaseConfigured) return;

    // Realtime subscription for incoming direct messages
    const channel = supabase
      .channel(`dm:${user.id}:${recipient.id}`)
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
            (m.sender_id === user.id && m.receiver_id === recipient.id) ||
            (m.sender_id === recipient.id && m.receiver_id === user.id)
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
                  isMe: m.sender_id === user.id,
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
  }, [threadId, user?.id, recipient.id, isMockMode, fetchMessages]);

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

      if (isMockMode || !user?.id) {
        // Mock mode: update status to sent, and trigger a simulated reply
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m))
          );
        }, 300);

        // Simulated reply after 1.5s
        setTimeout(() => {
          const replies = [
            'Understood. Let me check the light reading.',
            'Agreed, that exposure level works much better.',
            'Bookmarked to the shoot notes.',
            'Let’s test that on the 35mm prime today.',
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
        }, 1500);

        return { error: null };
      }

      // Live Supabase Insert
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: recipient.id,
          content: cleanText,
          image_url: imageUrl || null,
        })
        .select()
        .single();

      if (error) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m))
        );
        return { error: error.message };
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
    },
    [threadId, user?.id, recipient.id, isMockMode]
  );

  return {
    messages,
    loading,
    recipient,
    sendMessage,
    refetch: fetchMessages,
  };
}
