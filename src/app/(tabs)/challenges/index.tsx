import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useChallenges } from '@/hooks/useChallenges';

const categories = ['All', 'Photography', 'Culinary', 'Art', 'Writing'];
const quickSearchTags = ['Night', 'Sourdough', 'Stoneware', '35mm'];

export default function ChallengeHubScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const { challenges: sampleChallenges, loading } = useChallenges();

  const filteredChallenges = sampleChallenges.filter((ch) => {
    const matchesCat =
      selectedCategory === 'All' ||
      ch.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      ch.roomName?.toLowerCase().includes(selectedCategory.toLowerCase());

    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchesQuery =
      cleanQuery === '' ||
      ch.title.toLowerCase().includes(cleanQuery) ||
      ch.subtitle.toLowerCase().includes(cleanQuery) ||
      ch.description.toLowerCase().includes(cleanQuery) ||
      ch.roomName.toLowerCase().includes(cleanQuery) ||
      ch.guidelines.some((g) => g.toLowerCase().includes(cleanQuery));

    return matchesCat && matchesQuery;
  });

  const handleToggleSearch = () => {
    setIsSearchVisible((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery('');
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const isFiltered = selectedCategory !== 'All' || searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Challenges"
        rightActions={[
          {
            icon: isSearchVisible ? 'close' : 'search',
            onPress: handleToggleSearch,
            ariaLabel: isSearchVisible ? 'Close search' : 'Search challenges',
          },
          {
            icon: 'notifications-none',
            onPress: () => router.push('/activity'),
            hasBadge: true,
            badgeColor: colors.coral,
            ariaLabel: 'Notifications',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ethos Subtitle */}
        <View style={styles.ethosSection}>
          <Text style={styles.ethosText}>
            Shared creative invitations to spark observation, not competition.
          </Text>
        </View>

        {/* Collapsible Search Input Section */}
        {isSearchVisible && (
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Icon name="search" size={18} color={colors.secondary} style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search creative prompts, topics, rules..."
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

            {/* Quick Keyword Suggestion Chips */}
            <View style={styles.tagRow}>
              <Text style={styles.tagLabel}>Try:</Text>
              {quickSearchTags.map((tag) => (
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
        )}

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Filter Results Status Bar */}
        <View style={styles.statusRow}>
          <Text style={styles.statusCount}>
            {loading
              ? 'Loading prompts...'
              : `Showing ${filteredChallenges.length} ${
                  filteredChallenges.length === 1 ? 'invitation' : 'invitations'
                }${selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}`}
          </Text>

          {isFiltered && (
            <TouchableOpacity onPress={handleResetFilters} activeOpacity={0.7}>
              <Text style={styles.resetFilterText}>Reset filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Challenge Cards / Empty State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.coral} />
          </View>
        ) : filteredChallenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="search" size={26} color={colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No matching prompts</Text>
            <Text style={styles.emptySubtitle}>
              We couldn’t find any active challenges matching “{searchQuery}”. Try a broader keyword or reset your filters.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilters}
              activeOpacity={0.85}
            >
              <Text style={styles.resetButtonText}>View All Challenges</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.challengeList}>
            {filteredChallenges.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                style={styles.challengeCard}
                activeOpacity={0.92}
                onPress={() => router.push(`/challenge/${ch.id}`)}
              >
                {/* Media Visual */}
                <View style={styles.visualContainer}>
                  <Image source={{ uri: ch.coverImageUrl }} style={styles.coverImage} />

                  <View style={styles.roomBadge}>
                    <Text style={styles.roomBadgeText}>{ch.roomName}</Text>
                  </View>

                  <View style={styles.timerBadge}>
                    <Icon name="schedule" size={12} color={colors.surface} />
                    <Text style={styles.timerBadgeText}>{ch.closesIn}</Text>
                  </View>
                </View>

                {/* Content Details */}
                <View style={styles.cardBody}>
                  <Text style={styles.challengeTitle}>{ch.title}</Text>
                  <Text style={styles.challengeSubtitle}>
                    {ch.subtitle} • {ch.entriesCount} entries
                  </Text>
                  <Text style={styles.description} numberOfLines={2}>
                    {ch.description}
                  </Text>

                  {/* Guidelines Chips */}
                  <View style={styles.guidelinesRow}>
                    {ch.guidelines.map((g, idx) => (
                      <View key={idx} style={styles.guideChip}>
                        <Icon name="check-circle" size={13} color={colors.secondary} />
                        <Text style={styles.guideChipText}>{g}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Bottom CTA Row */}
                  <View style={styles.ctaRow}>
                    {/* Submission Avatars */}
                    <View style={styles.avatarStack}>
                      {ch.submissions && ch.submissions.length > 0 ? (
                        ch.submissions.map((sub, sIdx) => (
                          <Image
                            key={sub.id}
                            source={{ uri: sub.author.avatarUrl }}
                            style={[styles.subAvatar, { marginLeft: sIdx > 0 ? -8 : 0 }]}
                          />
                        ))
                      ) : (
                        <Icon name="palette" size={16} color={colors.secondary} />
                      )}
                      <Text style={styles.entryHintText}>
                        {ch.submissions && ch.submissions.length > 0
                          ? 'Recent submissions'
                          : 'Open for first entry'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.enterButton}
                      onPress={() => router.push(`/challenge/${ch.id}`)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.enterButtonText}>View Brief</Text>
                      <Icon name="arrow-forward" size={15} color={colors.surface} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
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
  ethosSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  ethosText: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  searchSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: 40,
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
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  tagLabel: {
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
  chipActive: {
    backgroundColor: colors.ink,
  },
  chipInactive: {
    backgroundColor: colors.surfaceContainerLow,
  },
  chipText: {
    ...typography.labelMd,
  },
  chipTextActive: {
    color: colors.surface,
  },
  chipTextInactive: {
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
  statusCount: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  resetFilterText: {
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
  challengeList: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  challengeCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  visualContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    backgroundColor: colors.surfaceContainer,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  roomBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  roomBadgeText: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  timerBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(28, 27, 27, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  timerBadgeText: {
    ...typography.labelSmBold,
    color: colors.surface,
    fontSize: 11,
  },
  cardBody: {
    padding: spacing.md,
  },
  challengeTitle: {
    ...typography.headlineMd,
    color: colors.ink,
  },
  challengeSubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
    marginBottom: 6,
  },
  description: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  guidelinesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  guideChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  guideChipText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  entryHintText: {
    ...typography.labelSm,
    color: colors.secondary,
    marginLeft: 2,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  enterButtonText: {
    ...typography.labelSmBold,
    color: colors.surface,
  },
});
