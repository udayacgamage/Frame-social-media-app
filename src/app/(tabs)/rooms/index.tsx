import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useRooms } from '@/hooks/useRooms';

const categories = ['All', 'Photography', 'Culinary', 'Visual Arts', 'Writing'];

export default function DiscoverRoomsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { rooms, loading, toggleJoin } = useRooms();

  const filteredRooms = rooms.filter((r) => {
    const matchesCat =
      selectedCategory === 'All' || r.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesQuery =
      searchQuery.trim() === '' ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Discover Rooms"
        rightActions={[
          {
            icon: 'notifications-none',
            onPress: () => router.push('/activity'),
            ariaLabel: 'Activity',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color={colors.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rooms, topics, tags..."
              placeholderTextColor={colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
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

        {/* Rooms Stream */}
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
    height: 40,
    paddingHorizontal: spacing.sm + 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...typography.bodyMd,
    color: colors.ink,
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
  roomList: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
  roomCard: {
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHighest,
    marginBottom: spacing.md,
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    marginBottom: spacing.sm,
    position: 'relative',
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
