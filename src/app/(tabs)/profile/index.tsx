import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { useRooms } from '@/hooks/useRooms';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const gridItemSize = (screenWidth - spacing.gutter * 2 - 8) / 2;

type ProfileTab = 'Grid' | 'Process' | 'Saved';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Grid');
  const { user, signOut } = useAuth();
  const { profile: currentUser, loading: profileLoading } = useProfile();
  const { posts: samplePosts } = usePosts({ authorId: user?.id });
  const { rooms: sampleRooms } = useRooms();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`@${currentUser.handle}`}
        rightActions={[
          {
            icon: 'tune',
            onPress: () => {
              Alert.alert('Quiet Preferences', 'Control metrics visibility, EXIF tags, and notification frequencies.', [
                { text: 'OK' },
              ]);
            },
            ariaLabel: 'Settings',
          },
          {
            icon: 'share',
            onPress: () => {},
            ariaLabel: 'Share Profile',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Overview Section */}
        <View style={styles.profileHeader}>
          <View style={styles.identityRow}>
            {/* 72px Circular Avatar */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
                <Icon name="photo-camera" size={13} color={colors.surface} />
              </TouchableOpacity>
            </View>

            {/* Name & Title */}
            <View style={styles.nameColumn}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{currentUser.displayName}</Text>
                <Text style={styles.pronouns}>({currentUser.pronouns})</Text>
              </View>
              <Text style={styles.roleTitle}>{currentUser.roleTitle}</Text>

              {/* Active Room Indicator */}
              {currentUser.activeRoom && (
                <View style={styles.activeRoomBadge}>
                  <View style={styles.coralDot} />
                  <Text style={styles.activeRoomText}>
                    Active in {currentUser.activeRoom.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>{currentUser.bio}</Text>

          {/* Gear Tag Cluster */}
          <View style={styles.gearCluster}>
            <Icon name="camera" size={14} color={colors.secondary} />
            <Text style={styles.gearText}>
              {currentUser.gearList?.join('  •  ')}
            </Text>
          </View>

          {/* Metrics Row (No bloated cards, pure editorial hairline columns) */}
          <View style={styles.metricsRow}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricNumber}>{currentUser.stats.challenges}</Text>
              <Text style={styles.metricLabel}>Challenges</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricColumn}>
              <Text style={styles.metricNumber}>{currentUser.stats.sharedStories}</Text>
              <Text style={styles.metricLabel}>Shared Stories</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricColumn}>
              <Text style={styles.metricNumber}>{currentUser.stats.processGuides}</Text>
              <Text style={styles.metricLabel}>Process Guides</Text>
            </View>
          </View>

          {/* Action Buttons (36px height, 8px radius) */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Edit Profile', 'Update avatar, bio, and camera gear.')}
            >
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Quiet Preferences', 'Toggle like metrics, follower counters, and notifications.')}
            >
              <Text style={styles.actionButtonText}>Quiet Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Rooms Strip */}
        <View style={styles.activeRoomsSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>Active Rooms</Text>
            <Text style={styles.sectionCount}>3 joined</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomsScroll}>
            {sampleRooms.slice(0, 3).map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.roomChip}
                onPress={() => router.push(`/room/${r.id}`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: r.coverImageUrl }} style={styles.roomChipThumb} />
                <Text style={styles.roomChipName}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Portfolio Tabs */}
        <View style={styles.tabsSection}>
          {(['Grid', 'Process', 'Saved'] as ProfileTab[]).map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Portfolio Grid */}
        <View style={styles.gridContainer}>
          {samplePosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.gridItem, { width: gridItemSize, height: gridItemSize * 1.25 }]}
              onPress={() => router.push(`/process/${post.id}`)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: post.imageUrl }} style={styles.gridImage} />
              {Boolean(post.processStagesCount) && (
                <View style={styles.gridProcessTag}>
                  <Icon name="tune" size={11} color={colors.surface} />
                  <Text style={styles.gridProcessText}>{post.processStagesCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  profileHeader: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 2,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  displayName: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  pronouns: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  roleTitle: {
    ...typography.bodyMdMedium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  activeRoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  coralDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  activeRoomText: {
    ...typography.labelSm,
    color: colors.coral,
    fontWeight: '500',
  },
  bioText: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  gearCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  gearText: {
    ...typography.labelSm,
    color: colors.secondary,
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  metricLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: colors.hairline,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    height: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.labelMd,
    color: colors.ink,
  },
  activeRoomsSection: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.xs + 2,
  },
  sectionHeader: {
    ...typography.labelSmBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  roomsScroll: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.sm,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  roomChipThumb: {
    width: 24,
    height: 24,
    borderRadius: radii.xs,
  },
  roomChipName: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  tabsSection: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    marginTop: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.ink,
  },
  tabButtonText: {
    ...typography.labelMd,
    color: colors.secondary,
  },
  tabButtonTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: 8,
  },
  gridItem: {
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridProcessTag: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(28, 27, 27, 0.82)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  gridProcessText: {
    ...typography.labelSm,
    color: colors.surface,
    fontSize: 10,
  },
});
