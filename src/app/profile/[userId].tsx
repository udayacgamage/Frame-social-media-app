import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Post } from '@/types';

// Pull mock data for demo mode
import { samplePosts, currentUser } from '@/data/mockData';

const { width: screenWidth } = Dimensions.get('window');
const gridItemSize = (screenWidth - spacing.gutter * 2 - 8) / 2;

type ProfileTab = 'Grid' | 'Process';

export default function UserProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user, isMockMode } = useAuth();
  const { profile, loading: profileLoading } = useProfile(userId);
  const { posts } = usePosts({ authorId: userId });
  const [activeTab, setActiveTab] = useState<ProfileTab>('Grid');

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = user?.id === userId;

  // Check initial follow state
  useEffect(() => {
    if (isMockMode || !user?.id || !userId || isOwnProfile) return;

    (async () => {
      const { data } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      setIsFollowing(!!data);

      // Get follower & following counts
      const { count: followers } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      setFollowerCount(followers || 0);

      const { count: following } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);
      setFollowingCount(following || 0);
    })();
  }, [userId, user?.id, isMockMode, isOwnProfile]);

  const handleToggleFollow = useCallback(async () => {
    if (isMockMode) {
      setIsFollowing((prev) => !prev);
      setFollowerCount((c) => (isFollowing ? Math.max(c - 1, 0) : c + 1));
      return;
    }
    if (!user?.id || !userId) return;

    setFollowLoading(true);
    if (isFollowing) {
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      setIsFollowing(false);
      setFollowerCount((c) => Math.max(c - 1, 0));
    } else {
      await supabase
        .from('followers')
        .insert({ follower_id: user.id, following_id: userId });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
    setFollowLoading(false);
  }, [isFollowing, user?.id, userId, isMockMode]);

  const handleMessage = () => {
    router.push(`/chat/${userId}`);
  };

  // Use mock data for demo
  const displayProfile = isMockMode
    ? {
        ...currentUser,
        id: userId || currentUser.id,
        handle: userId === currentUser.id ? currentUser.handle : 'milo_lens',
        displayName: userId === currentUser.id ? currentUser.displayName : 'Milo Lens',
        bio: userId === currentUser.id
          ? currentUser.bio
          : 'Street photographer & visual storyteller. Capturing light and shadow in everyday moments.',
        avatarUrl:
          userId === currentUser.id
            ? currentUser.avatarUrl
            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDobuu7cvuIdyUsa3diPmHeOsydIsme19Fd9nmC4dM0H6PJ4gYWdMqvL9X101TTBF5TTzyW-UWGWELh3FoJMHb2KPBDs5r8--P9djcUTDn8HzxD2eXbPSqflky4CBG0ReDWM4lEHRq_UCz5Ch5kFpOVljbzo04DF6ZcdjxTrSMX3pqsdBuU7yYBRvfQsPpNtdYN2DSH2PaSVFQVV0Ios1fv85duWCeQ-lZxOVrQf2g3BrgiDLb3XopwB7aCK3wmK785aDZGpMJcWQ',
        stats: { challenges: 3, sharedStories: 5, processGuides: 21 },
        gearList: ['Sony A7 IV', '35mm f/1.4 GM', 'Capture One Pro'],
        roleTitle: 'Street Photographer',
      }
    : profile;

  const displayPosts = isMockMode
    ? samplePosts.filter((p) => (userId === currentUser.id ? p.author.id === currentUser.id : true))
    : posts;

  const filteredPosts =
    activeTab === 'Process'
      ? displayPosts.filter((p) => (p.processStagesCount ?? 0) > 0)
      : displayPosts;

  if (profileLoading && !isMockMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.coral} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={displayProfile?.handle ? `@${displayProfile.handle}` : 'Profile'}
        showBack
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {displayProfile?.avatarUrl ? (
            <Image
              source={{ uri: displayProfile.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Icon name="person" size={36} color={colors.muted} />
            </View>
          )}

          <Text style={styles.displayName}>
            {displayProfile?.displayName || 'Creator'}
          </Text>
          <View style={styles.handleRow}>
            <Text style={styles.handle}>
              @{displayProfile?.handle || 'handle'}
            </Text>
            {displayProfile?.pronouns && (
              <Text style={styles.pronouns}>· {displayProfile.pronouns}</Text>
            )}
          </View>

          {displayProfile?.roleTitle && (
            <Text style={styles.roleTitle}>{displayProfile.roleTitle}</Text>
          )}

          {displayProfile?.bio && (
            <Text style={styles.bio}>{displayProfile.bio}</Text>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {displayProfile?.stats.processGuides ?? 0}
            </Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {isMockMode ? 1240 : followerCount}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {isMockMode ? 312 : followingCount}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {displayProfile?.stats.challenges ?? 0}
            </Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followButtonFollowing,
              ]}
              onPress={handleToggleFollow}
              disabled={followLoading}
              activeOpacity={0.85}
            >
              {followLoading ? (
                <ActivityIndicator
                  size="small"
                  color={isFollowing ? colors.ink : colors.surface}
                />
              ) : (
                <>
                  <Icon
                    name={isFollowing ? 'check' : 'person-add'}
                    size={18}
                    color={isFollowing ? colors.ink : colors.surface}
                  />
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowing && styles.followButtonTextFollowing,
                    ]}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <Icon name="send" size={18} color={colors.ink} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gear List */}
        {displayProfile?.gearList && displayProfile.gearList.length > 0 && (
          <View style={styles.gearSection}>
            <View style={styles.gearHeader}>
              <Icon name="camera" size={16} color={colors.secondary} />
              <Text style={styles.gearTitle}>Gear</Text>
            </View>
            <View style={styles.gearChips}>
              {displayProfile.gearList.map((item, i) => (
                <View key={i} style={styles.gearChip}>
                  <Text style={styles.gearChipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['Grid', 'Process'] as ProfileTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Icon
                name={tab === 'Grid' ? 'grid-on' : 'auto-awesome'}
                size={20}
                color={activeTab === tab ? colors.ink : colors.muted}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <View style={styles.grid}>
            {filteredPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.gridItem}
                onPress={() => router.push(`/process/${post.id}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: post.imageUrl }}
                  style={styles.gridImage}
                />
                {(post.processStagesCount ?? 0) > 0 && (
                  <View style={styles.processBadge}>
                    <Icon name="auto-awesome" size={11} color={colors.surface} />
                    <Text style={styles.processBadgeText}>
                      {post.processStagesCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon
              name={activeTab === 'Process' ? 'auto-awesome' : 'photo-library'}
              size={40}
              color={colors.muted}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'Process'
                ? 'No process guides yet'
                : 'No posts yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'Process'
                ? 'Process breakdowns will appear here.'
                : 'Posts will appear here once shared.'}
            </Text>
          </View>
        )}
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
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: spacing.md,
  },
  avatarEmpty: {
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.hairline,
  },
  displayName: {
    ...typography.headlineMd,
    color: colors.ink,
    textAlign: 'center',
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  handle: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  pronouns: {
    ...typography.bodyMd,
    color: colors.muted,
  },
  roleTitle: {
    ...typography.labelMd,
    color: colors.coral,
    marginTop: 6,
  },
  bio: {
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
    paddingHorizontal: spacing.xl,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.gutter,
    marginHorizontal: spacing.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  statLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: colors.hairline,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.coral,
  },
  followButtonFollowing: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  followButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
  followButtonTextFollowing: {
    color: colors.ink,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  messageButtonText: {
    ...typography.labelMd,
    color: colors.ink,
    fontWeight: '600',
  },

  // Gear
  gearSection: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
  },
  gearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  gearTitle: {
    ...typography.labelSmBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gearChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gearChip: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  gearChipText: {
    ...typography.labelSm,
    color: colors.onSurface,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.ink,
  },
  tabText: {
    ...typography.labelMd,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.gutter,
    gap: 8,
  },
  gridItem: {
    width: gridItemSize,
    aspectRatio: 4 / 5,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  processBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(230, 75, 56, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  processBadgeText: {
    ...typography.labelSm,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 10,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.ink,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
