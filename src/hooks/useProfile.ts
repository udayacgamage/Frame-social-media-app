import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { currentUser } from '@/data/mockData';
import type { UserProfile } from '@/types';

/** Map Supabase row to UserProfile type */
function mapProfile(row: any): UserProfile {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    pronouns: row.pronouns,
    roleTitle: row.role_title || 'Visual Artist',
    avatarUrl: row.avatar_url || '',
    bio: row.bio || '',
    stats: {
      challenges: row._challenges_count ?? 0,
      sharedStories: row._stories_count ?? 0,
      processGuides: row._posts_count ?? 0,
    },
    gearList: row.gear_list || [],
    quietModeEnabled: row.quiet_mode_enabled || false,
  };
}

export function useProfile(userId?: string) {
  const { user, isMockMode } = useAuth();
  const targetId = userId || user?.id;
  const [profile, setProfile] = useState<UserProfile | null>(isMockMode ? currentUser : null);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (isMockMode || !targetId) return;

    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    if (err) {
      setError(err.message);
      if (user) {
        setProfile({
          id: user.id,
          handle: user.user_metadata?.handle || user.email?.split('@')[0] || 'creator',
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator',
          pronouns: 'they/them',
          roleTitle: 'Visual Artist',
          avatarUrl: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
          bio: 'Creator on Frame',
          stats: { challenges: 0, sharedStories: 0, processGuides: 0 },
          gearList: ['Fujifilm X-T5', '35mm f/1.4'],
          quietModeEnabled: false,
        });
      } else {
        setProfile(currentUser);
      }
    } else {
      setProfile(mapProfile(data));
    }
    setLoading(false);
  }, [targetId, isMockMode]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (
      updates: Partial<
        Pick<
          UserProfile,
          | 'handle'
          | 'displayName'
          | 'bio'
          | 'pronouns'
          | 'roleTitle'
          | 'avatarUrl'
          | 'quietModeEnabled'
          | 'gearList'
        >
      >
    ) => {
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));

      if (isMockMode || !targetId) {
        return { error: null };
      }

      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.handle !== undefined) payload.handle = updates.handle;
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.pronouns !== undefined) payload.pronouns = updates.pronouns;
      if (updates.roleTitle !== undefined) payload.role_title = updates.roleTitle;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
      if (updates.quietModeEnabled !== undefined) payload.quiet_mode_enabled = updates.quietModeEnabled;
      if (updates.gearList !== undefined) payload.gear_list = updates.gearList;

      const { data, error: err } = await supabase
        .from('profiles')
        .upsert(
          {
            id: targetId,
            handle: updates.handle || profile?.handle || 'creator',
            display_name: updates.displayName || profile?.displayName || 'Creator',
            ...payload,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (err) {
        await fetchProfile();
        return { error: err.message };
      }

      if (user && !isMockMode) {
        const metaUpdates: Record<string, any> = {};
        if (updates.displayName) metaUpdates.display_name = updates.displayName;
        if (updates.handle) metaUpdates.handle = updates.handle;
        if (updates.avatarUrl) metaUpdates.avatar_url = updates.avatarUrl;
        if (Object.keys(metaUpdates).length > 0) {
          supabase.auth.updateUser({ data: metaUpdates }).catch(() => {});
        }
      }

      if (data) {
        setProfile((prev) => ({
          ...(prev || ({} as UserProfile)),
          ...mapProfile(data),
          stats: prev?.stats || { challenges: 0, sharedStories: 0, processGuides: 0 },
        }));
      } else {
        await fetchProfile();
      }

      return { error: null };
    },
    [targetId, isMockMode, user, profile, fetchProfile]
  );

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
