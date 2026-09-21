import React, { useState } from 'react';
import {
  View,
  Text,
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
import { useChallenges } from '@/hooks/useChallenges';

const categories = ['All', 'Photography', 'Culinary', 'Art', 'Writing'];

export default function ChallengeHubScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { challenges: sampleChallenges, loading } = useChallenges();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Challenges"
        rightActions={[
          {
            icon: 'search',
            onPress: () => {},
            ariaLabel: 'Search challenges',
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

        {/* Category Chips */}
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

        {/* Challenge Cards */}
        <View style={styles.challengeList}>
          {sampleChallenges.map((ch) => (
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
                    {ch.submissions?.map((sub, sIdx) => (
                      <Image
                        key={sub.id}
                        source={{ uri: sub.author.avatarUrl }}
                        style={[styles.subAvatar, { marginLeft: sIdx > 0 ? -8 : 0 }]}
                      />
                    ))}
                    <Text style={styles.entryHintText}>Recent submissions</Text>
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
  challengeList: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
    paddingTop: spacing.xs,
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
