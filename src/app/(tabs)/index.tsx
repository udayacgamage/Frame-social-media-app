import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { StoryAvatarStrip } from '@/components/stories/StoryAvatarStrip';
import { FeedCard } from '@/components/feed/FeedCard';
import { Icon } from '@/components/common/Icon';
import { usePosts } from '@/hooks/usePosts';
import { useStories } from '@/hooks/useStories';
import { useActivity } from '@/hooks/useActivity';

export default function HomeScreen() {
  const router = useRouter();
  const { posts, loading: postsLoading, toggleLike, toggleBookmark } = usePosts();
  const { stories } = useStories();
  const { unreadCount } = useActivity();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Frame"
        rightActions={[
          {
            icon: 'notifications-none',
            onPress: () => router.push('/activity'),
            ariaLabel: 'Activity',
            hasBadge: unreadCount > 0,
            badgeColor: colors.coral,
          },
          {
            icon: 'chat-bubble-outline',
            onPress: () => router.push('/activity'),
            ariaLabel: 'Messages',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shared Stories Avatar Reel */}
        <StoryAvatarStrip stories={stories} />

        {/* Inline Draft Banner */}
        <View style={styles.draftBanner}>
          <View style={styles.draftLeft}>
            <Icon name="edit-note" size={24} color={colors.coral} />
            <View style={styles.draftMeta}>
              <View style={styles.draftTitleRow}>
                <Text style={styles.draftTitle}>Continue draft</Text>
                <Text style={styles.draftSubtitle}>in Street Photography</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={styles.progressBarFill} />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.8}
          >
            <Text style={styles.resumeButtonText}>Resume</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Posts */}
        {postsLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.coral} />
          </View>
        ) : (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onToggleLike={() => toggleLike(post.id)}
              onToggleBookmark={() => toggleBookmark(post.id)}
            />
          ))
        )}

        {/* Caught-up Gallery Footer */}
        <View style={styles.caughtUpFooter}>
          <Icon name="check-circle" size={28} color={colors.outline} />
          <Text style={styles.caughtUpTitle}>You're caught up</Text>
          <Text style={styles.caughtUpSubtitle}>
            Go make something and share the process with your room.
          </Text>
          <TouchableOpacity
            style={styles.createCta}
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.8}
          >
            <Text style={styles.createCtaText}>Start a creation</Text>
            <Icon name="arrow-forward" size={16} color={colors.coral} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  draftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.md,
  },
  draftMeta: {
    flex: 1,
  },
  draftTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  draftTitle: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  draftSubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '66%',
    height: '100%',
    backgroundColor: colors.coral,
    borderRadius: 2,
  },
  resumeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  resumeButtonText: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  caughtUpFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  caughtUpTitle: {
    ...typography.headlineSm,
    color: colors.ink,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  caughtUpSubtitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: spacing.md,
  },
  createCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createCtaText: {
    ...typography.labelMd,
    color: colors.coral,
    fontWeight: '600',
  },
});
