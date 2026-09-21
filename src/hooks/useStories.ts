import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sampleStories } from '@/data/mockData';
import type { SharedStory, StorySlide, StoryContributor } from '@/types';

function mapStory(row: any): SharedStory {
  const contributions = row.story_contributions || [];
  const contributorMap = new Map<string, StoryContributor>();

  contributions.forEach((c: any) => {
    const contrib = c.contributor || {};
    if (contrib.id && !contributorMap.has(contrib.id)) {
      contributorMap.set(contrib.id, {
        id: contrib.id,
        name: contrib.display_name || '',
        handle: contrib.handle || '',
        avatarUrl: contrib.avatar_url || '',
      });
    }
  });

  const slides: StorySlide[] = contributions.map((c: any) => ({
    id: c.id,
    imageUrl: c.image_url,
    contributor: contributorMap.get(c.contributor_id) || {
      id: c.contributor_id,
      name: '',
      handle: '',
      avatarUrl: '',
    },
    timestamp: c.timestamp_label || '',
    location: c.location_name,
    caption: c.caption,
  }));

  return {
    id: row.id,
    title: row.title,
    coverImageUrl: row.cover_image_url || '',
    contributorsCount: contributorMap.size,
    contributors: Array.from(contributorMap.values()),
    slides,
    hasUnread: false,
  };
}

export function useStories(storyId?: string) {
  const { user, isMockMode } = useAuth();
  const [stories, setStories] = useState<SharedStory[]>(isMockMode ? sampleStories : []);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    if (isMockMode) {
      setStories(sampleStories);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from('shared_stories')
      .select(`
        *,
        story_contributions(
          *,
          contributor:profiles!story_contributions_contributor_id_fkey(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (storyId) {
      query = query.eq('id', storyId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setStories(sampleStories);
    } else {
      setStories((data || []).map(mapStory));
    }
    setLoading(false);
  }, [isMockMode, storyId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const addContribution = useCallback(
    async (targetStoryId: string, contribution: { imageUrl: string; caption?: string; location?: string; timestampLabel?: string }) => {
      if (isMockMode || !user?.id) {
        return { error: null };
      }

      // Get current max order
      const { data: existing } = await supabase
        .from('story_contributions')
        .select('order_index')
        .eq('story_id', targetStoryId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrder = ((existing?.[0]?.order_index ?? -1) as number) + 1;

      const { error: err } = await supabase
        .from('story_contributions')
        .insert({
          story_id: targetStoryId,
          contributor_id: user.id,
          image_url: contribution.imageUrl,
          caption: contribution.caption,
          location_name: contribution.location,
          timestamp_label: contribution.timestampLabel,
          order_index: nextOrder,
        });

      if (!err) {
        await fetchStories();
      }
      return { error: err?.message ?? null };
    },
    [user?.id, isMockMode, fetchStories]
  );

  return { stories, loading, error, addContribution, refetch: fetchStories };
}
