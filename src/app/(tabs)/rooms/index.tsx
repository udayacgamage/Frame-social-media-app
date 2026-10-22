import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useRooms } from '@/hooks/useRooms';
import { useActivity } from '@/hooks/useActivity';

const categories = ['All', 'Photography', 'Culinary', 'Visual Arts', 'Writing'];
const quickRoomTags = ['Street', 'Nordic', 'Cooking', 'Tokyo', 'Ceramics'];

export default function DiscoverRoomsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { rooms, loading, toggleJoin, refetch } = useRooms();
  const { unreadCount } = useActivity();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredRooms = (rooms || []).filter((r) => {
    if (!r) return false;
    const cat = r.category || '';
    const matchesCat =
      selectedCategory === 'All' ||
      cat.toLowerCase().includes(selectedCategory.toLowerCase());

    const cleanQuery = searchQuery.trim().toLowerCase();
    const name = r.name || '';
    const desc = r.description || '';
    const slug = r.slug || '';
    const matchesQuery =
      cleanQuery === '' ||
      name.toLowerCase().includes(cleanQuery) ||
      desc.toLowerCase().includes(cleanQuery) ||
      slug.toLowerCase().includes(cleanQuery);

    return matchesCat && matchesQuery;
  });

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const isFiltered = selectedCategory !== 'All' || searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Discover Rooms"
        rightActions={[
          {
            icon: 'notifications-none',
            onPress: () => router.push('/activity'),
            ariaLabel: 'Activity',
            hasBadge: unreadCount > 0,
            badgeColor: colors.coral,
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.coral}
            colors={[colors.coral]}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color={colors.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rooms, topics, tags..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={16} color={colors.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Keyword Chips */}
          <View style={styles.quickTagRow}>
            <Text style={styles.quickTagLabel}>Try:</Text>
            {quickRoomTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.quickTag}
                onPress={() => setSearchQuery(tag)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isActive ? styles.activeChip : styles.inactiveChip]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive ? styles.activeChipText : styles.inactiveChipText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status Bar */}
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {loading
              ? 'Loading rooms...'
              : `Showing ${filteredRooms.length} ${
                  filteredRooms.length === 1 ? 'room' : 'rooms'
                }${selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}`}
          </Text>

          {isFiltered && (
            <TouchableOpacity onPress={handleResetFilters} activeOpacity={0.7}>
              <Text style={styles.resetText}>Reset filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rooms Stream / Empty State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.coral} />
          </View>
        ) : filteredRooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="search" size={26} color={colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No rooms found</Text>
            <Text style={styles.emptySubtitle}>
              No community rooms match “{searchQuery}”. Try a broader search term or explore all rooms.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilters}
              activeOpacity={0.85}
            >
              <Text style={styles.resetButtonText}>Explore All Rooms</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.roomList}>
            {filteredRooms.map((room) => (
              <View key={room.id} style={styles.roomCard}>
                {/* Cover Image 16:9 */}
                <TouchableOpacity
                  style={styles.coverContainer}
                  onPress={() => router.push(`/room/${room.id}`)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: room.coverImageUrl }} style={styles.coverImage} />
                  {room.isFeatured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>Featured</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Room Content */}
                <View style={styles.roomMetaRow}>
                  <TouchableOpacity
                    style={styles.roomTextColumn}
                    onPress={() => router.push(`/room/${room.id}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.roomTitle}>{room.name}</Text>
                    <Text style={styles.roomDescription} numberOfLines={2}>
                      {room.description}
                    </Text>
                    <View style={styles.statsRow}>
                      <View style={styles.activePill}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeText}>{room.activeCount} active</Text>
                      </View>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.membersText}>
                        {(room.membersCount / 1000).toFixed(1)}k members
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Join CTA */}
                  <TouchableOpacity
                    style={[styles.joinButton, room.isJoined && styles.joinedButton]}
                    onPress={() => toggleJoin(room.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.joinButtonText, room.isJoined && styles.joinedButtonText]}
                    >
                      {room.isJoined ? 'Joined' : 'Join'}
                    </Text>
                    {room.isJoined && (
                      <Icon name="check" size={14} color={colors.ink} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  searchSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: 42,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
  },
  clearButton: {
    padding: 4,
  },
  quickTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  quickTagLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
  },
  quickTag: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  quickTagText: {
    ...typography.labelSm,
    color: colors.ink,
    fontSize: 11,
  },
  chipRow: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    gap: spacing.xs + 2,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: colors.ink,
  },
  inactiveChip: {
    backgroundColor: colors.surfaceContainerLow,
  },
  chipText: {
    ...typography.labelMd,
  },
  activeChipText: {
    color: colors.surface,
  },
  inactiveChipText: {
    color: colors.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
    marginBottom: 4,
  },
  statusText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  resetText: {
    ...typography.labelSm,
    color: colors.coral,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 56,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.bodyMdMedium,
    color: colors.ink,
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  resetButton: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  resetButtonText: {
    ...typography.labelSmBold,
    color: colors.surface,
  },
  roomList: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.lg,
  },
  roomCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    paddingBottom: spacing.md,
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceContainer,
    marginBottom: spacing.sm,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  featuredBadgeText: {
    ...typography.labelSmBold,
    color: colors.coral,
    fontSize: 11,
  },
  roomMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  roomTextColumn: {
    flex: 1,
  },
  roomTitle: {
    ...typography.headlineSm,
    color: colors.ink,
    marginBottom: 4,
  },
  roomDescription: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  activeText: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  dotSeparator: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  membersText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  joinButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.coral,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  joinButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: colors.ink,
  },
});
