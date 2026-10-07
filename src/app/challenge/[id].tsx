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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useChallenges } from '@/hooks/useChallenges';
import { sampleChallenges } from '@/data/mockData';

const { width: screenWidth } = Dimensions.get('window');
const subItemWidth = (screenWidth - spacing.gutter * 2 - 8) / 2;

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { challenges } = useChallenges();
  const challenge =
    challenges.find((c) => c.id === id) ||
    sampleChallenges.find((c) => c.id === id) ||
    challenges[0] ||
    sampleChallenges[0];
  const [isJoined, setIsJoined] = useState(challenge.isJoined ?? false);

  const handleParticipate = () => {
    Alert.alert(
      'Submit to Challenge',
      `Upload your capture for "${challenge.title}" directly from your studio or camera roll.`,
      [
        { text: 'Open Studio', onPress: () => router.push('/(tabs)/create') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={challenge.title}
        showBack
        rightActions={[
          {
            icon: 'share',
            onPress: () => {},
            ariaLabel: 'Share challenge',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 16:9 Cinematic Media Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: challenge.coverImageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.timerBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.timerBadgeText}>
              Closes in 4 days • October 28
            </Text>
          </View>
        </View>

        {/* Challenge Brief & Community Context */}
        <View style={styles.briefSection}>
          <View style={styles.metaRow}>
            <View style={styles.communityPill}>
              <Icon name="bubble-chart" size={14} color={colors.onSurfaceVariant} />
              <Text style={styles.communityPillText}>{challenge.subtitle}</Text>
            </View>
            <Text style={styles.entriesText}>{challenge.entriesCount} entries</Text>
          </View>

          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description}>{challenge.description}</Text>

          {/* Guidelines Chips */}
          <View style={styles.guidelinesContainer}>
            {challenge.guidelines.map((g, idx) => (
              <View key={idx} style={styles.guideChip}>
                <Icon name="check-circle" size={14} color={colors.secondary} />
                <Text style={styles.guideChipText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Submissions Section */}
        <View style={styles.submissionsSection}>
          <View style={styles.subHeaderRow}>
            <Text style={styles.subHeaderTitle}>Community Entries</Text>
            <Text style={styles.subHeaderCount}>Showing curated</Text>
          </View>

          <View style={styles.submissionGrid}>
            {challenge.submissions?.map((sub) => (
              <View key={sub.id} style={styles.subItem}>
                <Image source={{ uri: sub.imageUrl }} style={styles.subImage} />
                <View style={styles.subAuthorBar}>
                  <Image source={{ uri: sub.author.avatarUrl }} style={styles.subAuthorAvatar} />
                  <Text style={styles.subAuthorHandle}>{sub.author.handle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleParticipate}
          activeOpacity={0.88}
        >
          <Icon name="add-a-photo" size={18} color={colors.surface} />
          <Text style={styles.submitButtonText}>Submit Your Entry</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 90,
  },
  heroContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.ink,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  timerBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(49, 48, 48, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  timerBadgeText: {
    ...typography.labelSmBold,
    color: colors.surface,
  },
  briefSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
  },
  communityPillText: {
    ...typography.labelSmBold,
    color: colors.onSurfaceVariant,
  },
  entriesText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  title: {
    ...typography.headlineLg,
    color: colors.ink,
    marginTop: 2,
  },
  description: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 22,
    marginTop: 4,
  },
  guidelinesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  guideChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
  },
  guideChipText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  submissionsSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    marginTop: spacing.md,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  subHeaderTitle: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  subHeaderCount: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  submissionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subItem: {
    width: subItemWidth,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  subImage: {
    width: '100%',
    aspectRatio: 1,
  },
  subAuthorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    backgroundColor: colors.surface,
  },
  subAuthorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  subAuthorHandle: {
    ...typography.labelSm,
    color: colors.ink,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm + 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  submitButton: {
    backgroundColor: colors.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radii.md,
  },
  submitButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
});
