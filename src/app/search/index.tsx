import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon } from '@/components/common/Icon';
import { usePosts } from '@/hooks/usePosts';
import { useRooms } from '@/hooks/useRooms';
import { useChallenges } from '@/hooks/useChallenges';
import { samplePosts, currentUser } from '@/data/mockData';
import type { Post, Room, Challenge } from '@/types';

const { width: screenWidth } = Dimensions.get('window');
const gridThumbSize = (screenWidth - spacing.gutter * 2 - 8) / 3;

type SearchFilter = 'All' | 'Creators' | 'Rooms' | 'Posts' | 'Challenges';

interface CreatorItem {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  roleTitle?: string;
  bio?: string;
  gearList?: string[];
}

const DEFAULT_CREATORS: CreatorItem[] = [
  {
    id: currentUser.id,
    handle: currentUser.handle,
    displayName: currentUser.displayName,
    avatarUrl: currentUser.avatarUrl,
    roleTitle: currentUser.roleTitle,
    bio: currentUser.bio,
    gearList: currentUser.gearList,
  },
  ...samplePosts.map((p) => ({
    id: p.author.id,
    handle: p.author.handle,
    displayName: p.author.name || p.author.handle,
    avatarUrl: p.author.avatarUrl,
    roleTitle: 'Visual Creator',
    bio: `Sharing craft and process in ${p.roomName}`,
  })),
].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

const TRENDING_TAGS = [
  '#StreetLight',
  '#AnalogProcess',
  '#CeramicsGlaze',
  '#CoffeeCraft',
  '#MoodyPortraits',
  '#ArchitecturalLines',
  '#GoldenHour',
  '#DarkroomPrints',
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('All');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Analog',
    'Street Photography',
    'Ceramics',
  ]);

  const { posts } = usePosts();
  const { rooms } = useRooms();
  const { challenges } = useChallenges();

  const handleSearchSubmit = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((s) => s.toLowerCase() !== term.toLowerCase())];
      return next.slice(0, 8);
    });
  };

  const handleClearSearch = () => {
    setQuery('');
  };

  const removeRecent = (item: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== item));
  };

  // Search Results Filtering
  const cleanQuery = query.trim().toLowerCase();

  const filteredCreators = useMemo(() => {
    if (!cleanQuery) return DEFAULT_CREATORS;
    return DEFAULT_CREATORS.filter(
      (p: CreatorItem) =>
        p.displayName.toLowerCase().includes(cleanQuery) ||
        p.handle.toLowerCase().includes(cleanQuery) ||
        p.bio?.toLowerCase().includes(cleanQuery) ||
        p.gearList?.some((g: string) => g.toLowerCase().includes(cleanQuery))
    );
  }, [cleanQuery]);

  const filteredRooms = useMemo(() => {
    if (!cleanQuery) return rooms;
    return rooms.filter(
      (r: Room) =>
        r.name.toLowerCase().includes(cleanQuery) ||
        r.description.toLowerCase().includes(cleanQuery) ||
        r.category.toLowerCase().includes(cleanQuery)
    );
  }, [cleanQuery, rooms]);

  const filteredPosts = useMemo(() => {
    const sourcePosts = posts.length > 0 ? posts : samplePosts;
    if (!cleanQuery) return sourcePosts;
    return sourcePosts.filter(
      (p: Post) =>
        p.caption.toLowerCase().includes(cleanQuery) ||
        p.roomName.toLowerCase().includes(cleanQuery) ||
        p.author.handle.toLowerCase().includes(cleanQuery) ||
        p.author.name?.toLowerCase().includes(cleanQuery) ||
        p.processStages?.some((s) => s.title.toLowerCase().includes(cleanQuery))
    );
  }, [cleanQuery, posts]);

  const filteredChallenges = useMemo(() => {
    if (!cleanQuery) return challenges;
    return challenges.filter(
      (c: Challenge) =>
        c.title.toLowerCase().includes(cleanQuery) ||
        c.description.toLowerCase().includes(cleanQuery) ||
        (c.category && c.category.toLowerCase().includes(cleanQuery)) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(cleanQuery))
    );
  }, [cleanQuery, challenges]);

  const totalResultsCount =
    filteredCreators.length + filteredRooms.length + filteredPosts.length + filteredChallenges.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search Bar Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Icon name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search creators, rooms, processes..."
            placeholderTextColor={colors.secondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearchSubmit(query)}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Icon name="close" size={18} color={colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterStrip}>
        {(['All', 'Creators', 'Rooms', 'Posts', 'Challenges'] as SearchFilter[]).map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* State A: Empty query exploration mode */}
        {cleanQuery.length === 0 ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent</Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
                    <Text style={styles.sectionAction}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentWrap}>
                  {recentSearches.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.recentTag}
                      onPress={() => setQuery(item)}
                      activeOpacity={0.7}
                    >
                      <Icon name="history" size={16} color={colors.secondary} />
                      <Text style={styles.recentTagText}>{item}</Text>
                      <TouchableOpacity
                        onPress={() => removeRecent(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Icon name="close" size={14} color={colors.secondary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Trending Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Explore Topics</Text>
              <View style={styles.tagWrap}>
                {TRENDING_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.exploreTag}
                    onPress={() => setQuery(tag.replace('#', ''))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.exploreTagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recommended Rooms */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Rooms</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalRooms}
              >
                {rooms.slice(0, 5).map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={styles.roomCard}
                    onPress={() => router.push(`/room/${room.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: room.coverImageUrl }} style={styles.roomCardImage} />
                    <View style={styles.roomCardMeta}>
                      <Text style={styles.roomCardName} numberOfLines={1}>
                        {room.name}
                      </Text>
                      <Text style={styles.roomCardMembers}>
                        {room.membersCount} members
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Featured Creators */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Creators</Text>
              {DEFAULT_CREATORS.slice(0, 4).map((creator: CreatorItem) => (
                <TouchableOpacity
                  key={creator.id}
                  style={styles.creatorRow}
                  onPress={() => router.push(`/profile/${creator.id}` as any)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: creator.avatarUrl }} style={styles.creatorAvatar} />
                  <View style={styles.creatorInfo}>
                    <Text style={styles.creatorName}>{creator.displayName}</Text>
                    <Text style={styles.creatorHandle}>@{creator.handle}</Text>
                    {creator.roleTitle && (
                      <Text style={styles.creatorRole}>{creator.roleTitle}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.followSmallButton}
                    onPress={() => router.push(`/profile/${creator.id}` as any)}
                  >
                    <Text style={styles.followSmallButtonText}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          /* State B: Active search results */
          <>
            {totalResultsCount === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={48} color={colors.secondary} />
                <Text style={styles.emptyTitle}>No results for "{query}"</Text>
                <Text style={styles.emptySubtitle}>
                  Try checking spelling, searching for different keywords, or exploring popular tags.
                </Text>
              </View>
            ) : (
              <>
                {/* Creators Section */}
                {(activeFilter === 'All' || activeFilter === 'Creators') &&
                  filteredCreators.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        Creators ({filteredCreators.length})
                      </Text>
                      {filteredCreators.map((creator: CreatorItem) => (
                        <TouchableOpacity
                          key={creator.id}
                          style={styles.creatorRow}
                          onPress={() => router.push(`/profile/${creator.id}` as any)}
                          activeOpacity={0.7}
                        >
                          <Image source={{ uri: creator.avatarUrl }} style={styles.creatorAvatar} />
                          <View style={styles.creatorInfo}>
                            <Text style={styles.creatorName}>{creator.displayName}</Text>
                            <Text style={styles.creatorHandle}>@{creator.handle}</Text>
                            {creator.bio && (
                              <Text style={styles.creatorBioSnippet} numberOfLines={1}>
                                {creator.bio}
                              </Text>
                            )}
                          </View>
                          <Icon name="chevron-right" size={20} color={colors.secondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {/* Rooms Section */}
                {(activeFilter === 'All' || activeFilter === 'Rooms') && filteredRooms.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rooms ({filteredRooms.length})</Text>
                    {filteredRooms.map((room) => (
                      <TouchableOpacity
                        key={room.id}
                        style={styles.roomRow}
                        onPress={() => router.push(`/room/${room.id}` as any)}
                        activeOpacity={0.7}
                      >
                        <Image source={{ uri: room.coverImageUrl }} style={styles.roomThumb} />
                        <View style={styles.roomRowInfo}>
                          <Text style={styles.roomRowName}>{room.name}</Text>
                          <Text style={styles.roomRowDesc} numberOfLines={1}>
                            {room.description}
                          </Text>
                          <Text style={styles.roomRowMeta}>
                            {room.category} • {room.membersCount} members
                          </Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={colors.secondary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Challenges Section */}
                {(activeFilter === 'All' || activeFilter === 'Challenges') &&
                  filteredChallenges.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        Challenges ({filteredChallenges.length})
                      </Text>
                      {filteredChallenges.map((challenge) => (
                        <TouchableOpacity
                          key={challenge.id}
                          style={styles.challengeRow}
                          onPress={() => router.push(`/challenge/${challenge.id}` as any)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.challengeBadge}>
                            <Icon name="emoji-events" size={20} color={colors.coral} />
                          </View>
                          <View style={styles.challengeInfo}>
                            <Text style={styles.challengeTitle}>{challenge.title}</Text>
                            <Text style={styles.challengeTag}>{challenge.category}</Text>
                          </View>
                          <Icon name="chevron-right" size={20} color={colors.secondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {/* Posts Section */}
                {(activeFilter === 'All' || activeFilter === 'Posts') && filteredPosts.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Posts ({filteredPosts.length})</Text>
                    <View style={styles.postsGrid}>
                      {filteredPosts.map((post) => (
                        <TouchableOpacity
                          key={post.id}
                          style={styles.gridThumbItem}
                          onPress={() => {
                            if (post.processStagesCount) {
                              router.push(`/process/${post.id}` as any);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: post.imageUrl }} style={styles.gridThumbImage} />
                          {post.processStagesCount ? (
                            <View style={styles.processBadge}>
                              <Icon name="layers" size={12} color={colors.surface} />
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterStrip: {
    flexDirection: 'row',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  filterChipActive: {
    backgroundColor: colors.ink,
  },
  filterChipText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionAction: {
    ...typography.labelSm,
    color: colors.coral,
  },
  recentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  recentTagText: {
    ...typography.labelSm,
    color: colors.ink,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  exploreTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  exploreTagText: {
    ...typography.labelSm,
    color: colors.ink,
    fontWeight: '600',
  },
  horizontalRooms: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roomCard: {
    width: 140,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  roomCardImage: {
    width: '100%',
    height: 90,
    backgroundColor: colors.surfaceContainerLow,
  },
  roomCardMeta: {
    padding: spacing.xs,
  },
  roomCardName: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  roomCardMembers: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.ink,
  },
  creatorHandle: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  creatorRole: {
    ...typography.labelSm,
    color: colors.coral,
    marginTop: 2,
  },
  creatorBioSnippet: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  followSmallButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  followSmallButtonText: {
    ...typography.labelSm,
    color: colors.ink,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  roomThumb: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  roomRowInfo: {
    flex: 1,
  },
  roomRowName: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.ink,
  },
  roomRowDesc: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  roomRowMeta: {
    ...typography.labelSm,
    color: colors.coral,
    marginTop: 2,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  challengeBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.ink,
  },
  challengeTag: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridThumbItem: {
    width: gridThumbSize,
    height: gridThumbSize,
    borderRadius: radii.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceContainerLow,
  },
  gridThumbImage: {
    width: '100%',
    height: '100%',
  },
  processBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: radii.full,
    padding: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
