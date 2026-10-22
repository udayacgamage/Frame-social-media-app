import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sampleRooms } from '@/data/mockData';
import type { Room } from '@/types';

function mapRoom(row: any, joinedRoomIds: Set<string> = new Set()): Room {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description || '',
    coverImageUrl: row.cover_image_url || '',
    isPrivate: row.is_private || false,
    isJoined: joinedRoomIds.has(row.id),
    membersCount: row.members_count || 0,
    activeCount: row.active_count || 0,
    isFeatured: row.is_featured || false,
  };
}

export function useRooms() {
  const { user, isMockMode } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(sampleRooms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    if (isMockMode) {
      setRooms(sampleRooms);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('members_count', { ascending: false });

      if (err || !data || data.length === 0) {
        setRooms(sampleRooms);
        setLoading(false);
        return;
      }

      // Fetch user's joined rooms
      let joinedIds = new Set<string>();
      if (user?.id && !user.id.startsWith('usr_')) {
        try {
          const { data: memberships } = await supabase
            .from('room_members')
            .select('room_id')
            .eq('user_id', user.id);
          joinedIds = new Set((memberships || []).map((m: any) => m.room_id));
        } catch {}
      } else {
        joinedIds = new Set(sampleRooms.filter((r) => r.isJoined).map((r) => r.id));
      }

      const mapped = data.map((r: any) => mapRoom(r, joinedIds));
      const combined = [
        ...mapped,
        ...sampleRooms.filter(
          (sr) => !mapped.some((m: any) => m.id === sr.id || m.slug === sr.slug)
        ),
      ];
      setRooms(combined);
    } catch {
      setRooms(sampleRooms);
    } finally {
      setLoading(false);
    }
  }, [isMockMode, user?.id]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const toggleJoin = useCallback(
    async (roomId: string) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;

      // Optimistic update
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? {
                ...r,
                isJoined: !r.isJoined,
                membersCount: r.isJoined ? Math.max(0, r.membersCount - 1) : r.membersCount + 1,
              }
            : r
        )
      );

      if (isMockMode || !user?.id || user.id.startsWith('usr_')) return;

      try {
        if (room.isJoined) {
          await supabase.from('room_members').delete().match({ room_id: roomId, user_id: user.id });
        } else {
          await supabase.from('room_members').insert({ room_id: roomId, user_id: user.id });
        }
      } catch {}
    },
    [rooms, user?.id, isMockMode]
  );

  const getRoomById = useCallback(
    (roomId: string): Room | undefined => {
      return rooms.find((r) => r.id === roomId);
    },
    [rooms]
  );

  return { rooms, loading, error, toggleJoin, getRoomById, refetch: fetchRooms };
}
