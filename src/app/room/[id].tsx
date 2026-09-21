import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { FeedCard } from '@/components/feed/FeedCard';
import { Icon } from '@/components/common/Icon';
import { useRooms } from '@/hooks/useRooms';
import { usePosts } from '@/hooks/usePosts';
import { useChallenges } from '@/hooks/useChallenges';

type RoomTab = 'All' | 'Process' | 'Discussions';

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { rooms, toggleJoin } = useRooms();
  const room = rooms.find((r) => r.id === id) || rooms[0];
  const [activeTab, setActiveTab] = useState<RoomTab>('All');
  const { posts: relatedPosts, toggleLike, toggleBookmark } = usePosts({ roomId: id });
  const { challenges } = useChallenges();
  const roomChallenge = challenges[0];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join the ${room.name} room on Frame: https://frame.community/room/${room.slug}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={room.name}
        showBack
        rightActions={[
          {
            icon: 'share',
            onPress: handleShare,
            ariaLabel: 'Share room',
          },
          {
            icon: 'more-horiz',
            onPress: () => {},
            ariaLabel: 'More options',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Hero Header */}
        <View style={styles.coverSection}>
          <Image source={{ uri: room.coverImageUrl }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
        </View>

        {/* Room Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleColumn}>
              <View style={styles.nameRow}>
                <Text style={styles.roomTitle}>{room.name}</Text>
                <Icon name="verified" size={18} color={colors.coral} />
              </View>
              <Text style={styles.memberSubtitle}>
                {(room.membersCount / 1000).toFixed(1)}k members • Public Room
              </Text>
            </View>

            {/* Joined State Toggle */}
            <TouchableOpacity
              style={[styles.joinedButton, !isJoined && styles.joinButton]}
              onPress={() => setIsJoined(!isJoined)}
              activeOpacity={0.8}
            >
              <Text style={[styles.joinedButtonText, !isJoined && styles.joinButtonText]}>
                {isJoined ? 'Joined' : 'Join'}
              </Text>
              {isJoined && <Icon name="check" size={14} color={colors.ink} />}
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{room.description}</Text>
        </View>

        {/* Active Challenge Module in Room */}
        {roomChallenge && (
          <View style={styles.challengeModule}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeHeaderLeft}>
                <Icon name="emoji-events" size={16} color={colors.coral} />
                <Text style={styles.challengeModuleTitle}>Active Room Challenge</Text>
              </View>
              <Text style={styles.challengeClosesBadge}>Oct 28</Text>
            </View>

            <TouchableOpacity
              style={styles.challengeCard}
              onPress={() => router.push(`/challenge/${roomChallenge.id}`)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: roomChallenge.coverImageUrl }}
                style={styles.challengeThumb}
              />
              <View style={styles.challengeMeta}>
                <Text style={styles.challengeName}>{roomChallenge.title}</Text>
                <Text style={styles.challengeSummary} numberOfLines={2}>
                  {roomChallenge.description}
                </Text>
                <View style={styles.enterRow}>
                  <Text style={styles.enterText}>Enter challenge</Text>
                  <Icon name="arrow-forward" size={14} color={colors.coral} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Feed Filter Tabs */}
        <View style={styles.tabsRow}>
          {(['All', 'Process', 'Discussions'] as RoomTab[]).map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Room Feed */}
        {relatedPosts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
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
  coverSection: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  infoSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomTitle: {
    ...typography.headlineMd,
    color: colors.ink,
  },
  memberSubtitle: {
    ...typography.labelMd,
    color: colors.secondary,
    marginTop: 2,
  },
  joinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  joinButton: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  joinedButtonText: {
    ...typography.labelMd,
    color: colors.ink,
  },
  joinButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
  description: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  challengeModule: {
    marginHorizontal: spacing.gutter,
    marginVertical: spacing.sm,
    padding: spacing.sm + 2,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 4,
  },
  challengeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  challengeModuleTitle: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  challengeClosesBadge: {
    ...typography.labelSm,
    color: colors.coral,
    fontWeight: '600',
  },
  challengeCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.xs + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  challengeThumb: {
    width: 80,
    height: 80,
    borderRadius: radii.sm,
  },
  challengeMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  challengeName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
    marginBottom: 2,
  },
  challengeSummary: {
    ...typography.labelSm,
    color: colors.secondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  enterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  enterText: {
    ...typography.labelSmBold,
    color: colors.coral,
  },
  tabsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    marginTop: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.ink,
  },
  tabBtnText: {
    ...typography.labelMd,
    color: colors.secondary,
  },
  tabBtnTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
});
