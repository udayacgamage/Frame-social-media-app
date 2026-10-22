import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProcessStageInput } from '@/components/process/ProcessStageEditor';

const DRAFT_STORAGE_KEY = '@frame_post_draft';

export interface PostDraft {
  caption: string;
  imageUri: string | null;
  destinationRoom: string;
  visibility: 'Public Room' | 'Contributors' | 'Followers';
  quietMode: boolean;
  processStages: ProcessStageInput[];
  updatedAt: number;
}

export function useDrafts() {
  const [draft, setDraft] = useState<PostDraft | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDraft = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (data) {
        setDraft(JSON.parse(data));
      } else {
        setDraft(null);
      }
    } catch {
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const saveDraft = useCallback(async (newDraft: Partial<PostDraft>) => {
    try {
      setDraft((prev) => {
        const updated: PostDraft = {
          caption: newDraft.caption ?? prev?.caption ?? '',
          imageUri: newDraft.imageUri !== undefined ? newDraft.imageUri : (prev?.imageUri ?? null),
          destinationRoom: newDraft.destinationRoom ?? prev?.destinationRoom ?? 'Street Photography',
          visibility: newDraft.visibility ?? prev?.visibility ?? 'Public Room',
          quietMode: newDraft.quietMode ?? prev?.quietMode ?? false,
          processStages: newDraft.processStages ?? prev?.processStages ?? [],
          updatedAt: Date.now(),
        };
        AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    } catch {}
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraft(null);
    } catch {}
  }, []);

  return {
    draft,
    hasDraft: Boolean(draft && (draft.caption.trim().length > 0 || draft.imageUri || draft.processStages.length > 0)),
    loading,
    saveDraft,
    clearDraft,
    reloadDraft: loadDraft,
  };
}
