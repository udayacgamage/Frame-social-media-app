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
      // Fallback to mock data if fetch fails
      setProfile(currentUser);
    } else {
      setProfile(mapProfile(data));
    }
    setLoading(false);
  }, [targetId, isMockMode]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'pronouns' | 'roleTitle' | 'avatarUrl' | 'quietModeEnabled' | 'gearList'>>) => {
      if (isMockMode) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
        return { error: null };
      }

      const { error: err } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
          bio: updates.bio,
          pronouns: updates.pronouns,
          role_title: updates.roleTitle,
          avatar_url: updates.avatarUrl,
          quiet_mode_enabled: updates.quietModeEnabled,
          gear_list: updates.gearList,
        })
        .eq('id', targetId);

      if (!err) {
        await fetchProfile();
      }
      return { error: err?.message ?? null };
    },
    [targetId, isMockMode, fetchProfile]
  );

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
