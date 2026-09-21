import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sampleChallenges } from '@/data/mockData';
import type { Challenge } from '@/types';

function mapChallenge(row: any, userSubmitted = false): Challenge {
  const closesAt = new Date(row.closes_at);
  const now = new Date();
  const diffMs = closesAt.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    roomName: row.room?.name || '',
    roomId: row.room_id || '',
    coverImageUrl: row.cover_image_url || '',
    closesIn: diffDays > 0 ? `${diffDays}d left` : 'Closed',
    deadlineDate: closesAt.toISOString(),
    entriesCount: row.entries_count || 0,
    guidelines: row.guidelines || [],
    isJoined: userSubmitted,
  };
}

export function useChallenges() {
  const { user, isMockMode } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>(isMockMode ? sampleChallenges : []);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (isMockMode) {
      setChallenges(sampleChallenges);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('challenges')
      .select(`
        *,
        room:rooms(name)
      `)
      .order('closes_at', { ascending: true });

    if (err) {
      setError(err.message);
      setChallenges(sampleChallenges);
      setLoading(false);
      return;
    }

    // Check user submissions
    let submittedIds = new Set<string>();
    if (user?.id) {
      const { data: subs } = await supabase
        .from('challenge_submissions')
        .select('challenge_id')
        .eq('user_id', user.id);
      submittedIds = new Set((subs || []).map((s: any) => s.challenge_id));
    }

    setChallenges((data || []).map((c: any) => mapChallenge(c, submittedIds.has(c.id))));
    setLoading(false);
  }, [isMockMode, user?.id]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const submitEntry = useCallback(
    async (challengeId: string, postId: string) => {
      if (isMockMode || !user?.id) {
        return { error: null };
      }

      const { error: err } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          post_id: postId,
        });

      if (!err) {
        await fetchChallenges();
      }
      return { error: err?.message ?? null };
    },
    [user?.id, isMockMode, fetchChallenges]
  );

  return { challenges, loading, error, submitEntry, refetch: fetchChallenges };
}
