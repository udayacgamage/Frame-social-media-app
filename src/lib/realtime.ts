/**
 * Supabase Realtime subscription helpers
 * Provides typed channel subscriptions for live features.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface SubscriptionOptions {
  table: string;
  filter?: string;
  event?: RealtimeEvent | '*';
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

/**
 * Subscribe to Supabase Realtime postgres_changes on a table.
 * Returns the channel for cleanup.
 */
export function subscribeToTable(
  channelName: string,
  options: SubscriptionOptions
): RealtimeChannel | null {
  if (!isSupabaseConfigured) return null;

  const channel = supabase.channel(channelName);

  if (options.onInsert) {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: options.table,
        filter: options.filter,
      },
      (payload) => options.onInsert!(payload.new)
    );
  }

  if (options.onUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: options.table,
        filter: options.filter,
      },
      (payload) => options.onUpdate!(payload.new)
    );
  }

  if (options.onDelete) {
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: options.table,
        filter: options.filter,
      },
      (payload) => options.onDelete!(payload.old)
    );
  }

  channel.subscribe();
  return channel;
}

/**
 * Unsubscribe from a realtime channel.
 */
export function unsubscribe(channel: RealtimeChannel | null) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

/**
 * Subscribe to comments on a specific post.
 */
export function subscribeToComments(
  postId: string,
  onNew: (comment: any) => void,
  onDeleted?: (comment: any) => void
) {
  return subscribeToTable(`comments:${postId}`, {
    table: 'post_comments',
    filter: `post_id=eq.${postId}`,
    onInsert: onNew,
    onDelete: onDeleted,
  });
}

/**
 * Subscribe to new story contributions.
 */
export function subscribeToStoryContributions(
  storyId: string,
  onNew: (contribution: any) => void
) {
  return subscribeToTable(`story:${storyId}`, {
    table: 'story_contributions',
    filter: `story_id=eq.${storyId}`,
    onInsert: onNew,
  });
}

/**
 * Subscribe to notifications for a user.
 */
export function subscribeToNotifications(
  userId: string,
  onNew: (notification: any) => void
) {
  return subscribeToTable(`notifications:${userId}`, {
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
    onInsert: onNew,
  });
}

/**
 * Subscribe to room member changes.
 */
export function subscribeToRoomActivity(
  roomId: string,
  onJoin: (member: any) => void,
  onLeave?: (member: any) => void
) {
  return subscribeToTable(`room:${roomId}`, {
    table: 'room_members',
    filter: `room_id=eq.${roomId}`,
    onInsert: onJoin,
    onDelete: onLeave,
  });
}
