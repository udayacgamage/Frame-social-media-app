import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { CompareSlider } from '@/components/process/CompareSlider';
import { samplePosts } from '@/data/mockData';

export default function ProcessScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const post =
    samplePosts.find((p) => p.id === postId || p.id === 'post_technique') ||
    samplePosts[2];

  const [savedRecipe, setSavedRecipe] = useState(false);

  const handleSaveRecipe = () => {
    setSavedRecipe(!savedRecipe);
    Alert.alert(
      savedRecipe ? 'Recipe Removed' : 'Recipe Saved',
      savedRecipe
        ? 'Technique removed from your collection.'
        : 'Technique recipe bookmarked to your Atelier vault.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Post & Process"
        showBack
        rightActions={[
          {
            icon: savedRecipe ? 'bookmark' : 'bookmark-border',
            onPress: handleSaveRecipe,
            ariaLabel: 'Bookmark recipe',
          },
          {
            icon: 'share',
            onPress: () => {},
            ariaLabel: 'Share post',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Creator Row */}
        <View style={styles.authorRow}>
          <Image source={{ uri: post.author.avatarUrl }} style={styles.authorAvatar} />
          <View style={styles.authorMeta}>
            <View style={styles.authorHandleRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.authorHandle}>@{post.author.handle}</Text>
            </View>
            <View style={styles.roomTimeRow}>
              <Text style={styles.roomText}>{post.roomName}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.timeText}>{post.createdAt}</Text>
            </View>
          </View>
        </View>

        {/* Post Title */}
        <View style={styles.titleSection}>
          <Text style={styles.postTitle}>
            Dappled Brutalism: Exposing for Highlights
          </Text>
        </View>

        {/* Interactive Before/After Compare Slider */}
        <View style={styles.sliderWrapper}>
          <CompareSlider
            rawImageUrl={
              post.rawImageUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDr3guoVmV99k1a30wsI4AMDT6EHEIkBnZrKBzbG7_9dQFxHj4UPnti9PhFB3ar-zGp-L69FPvKyNwkQb-mvfQLN9o2oZy99HDtHOluuriG4hGiJ0zlWTD6w-0Pkh4GVHOYjgvbwq_ZgUHugdXiejN5t0MZR9UrIbfTfUYhF4vHDzBr5okeuci4hvNOlzC_AE21fly4_lbl8aogKIe_3_T2JvQ2tp5yCSeMrGsv4WhP5ld10g_FUUb67jwlpB2ryVCU-C6L_h9VbA'
            }
            finalImageUrl={post.imageUrl}
            height={430}
          />
        </View>

        {/* Guide Hint */}
        <View style={styles.guideHintBar}>
          <View style={styles.guideLeft}>
            <Icon name="touch-app" size={15} color={colors.secondary} />
            <Text style={styles.guideText}>
              Drag handle horizontally to compare stages
            </Text>
          </View>
          <Text style={styles.exifBadge}>
            {post.cameraExif?.camera || 'Leica Q2 • DNG'}
          </Text>
        </View>

        {/* Action Controls Row */}
        <View style={styles.actionControls}>
          <View style={styles.actionLeft}>
            <TouchableOpacity
              style={[styles.outlineAction, savedRecipe && styles.activeAction]}
              onPress={handleSaveRecipe}
              activeOpacity={0.8}
            >
              <Icon
                name={savedRecipe ? 'bookmark' : 'auto-stories'}
                size={16}
                color={colors.ink}
              />
              <Text style={styles.outlineActionText}>
                {savedRecipe ? 'Recipe Saved' : 'Save Recipe'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineAction}
              onPress={() => Alert.alert('Technique Q&A', '12 questions asked by community members.')}
              activeOpacity={0.8}
            >
              <Icon name="forum" size={16} color={colors.ink} />
              <Text style={styles.outlineActionText}>Ask Question</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.tryThisButton}
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.85}
          >
            <Icon name="add-a-photo" size={15} color={colors.surface} />
            <Text style={styles.tryThisText}>Try This (8)</Text>
          </TouchableOpacity>
        </View>

        {/* Numbered Process Steps */}
        <View style={styles.processStepsSection}>
          <View style={styles.stepsHeaderRow}>
            <Text style={styles.stepsSectionTitle}>Process Breakdown</Text>
            <Text style={styles.stepsCountText}>
              {post.processStages?.length || 3} Steps Documented
            </Text>
          </View>

          {/* Timeline steps with hairline vertical line */}
          <View style={styles.timelineList}>
            {post.processStages?.map((stage, idx) => (
              <View key={idx} style={styles.timelineItem}>
                {/* Step Circle */}
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumberText}>{stage.stepNumber}</Text>
                </View>

                {/* Step Details */}
                <View style={styles.stepContent}>
                  <View style={styles.stepHeaderRow}>
                    <Text style={styles.stepTitle}>{stage.title}</Text>
                    <Text style={styles.stepTag}>{stage.tag}</Text>
                  </View>
                  <Text style={styles.stepDescription}>{stage.description}</Text>
                  {stage.gearSetup && (
                    <Text style={styles.gearSetup}>{stage.gearSetup}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  authorMeta: {
    justifyContent: 'center',
  },
  authorHandleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  authorName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  authorHandle: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  roomTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  roomText: {
    ...typography.labelSm,
    color: colors.coral,
    fontWeight: '500',
  },
  dotSeparator: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  timeText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  titleSection: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  postTitle: {
    ...typography.headlineMd,
    color: colors.ink,
    lineHeight: 28,
  },
  sliderWrapper: {
    width: '100%',
  },
  guideHintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: 8,
    backgroundColor: colors.surfaceDim,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  guideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guideText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  exifBadge: {
    ...typography.labelSm,
    color: colors.secondary,
    fontWeight: '500',
  },
  actionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  outlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  activeAction: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.ink,
  },
  outlineActionText: {
    ...typography.labelMd,
    color: colors.ink,
  },
  tryThisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.coral,
  },
  tryThisText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
  processStepsSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
  },
  stepsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  stepsSectionTitle: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  stepsCountText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  timelineList: {
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
    gap: spacing.xl,
    marginLeft: 11,
  },
  timelineItem: {
    position: 'relative',
  },
  stepCircle: {
    position: 'absolute',
    left: -35,
    top: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.labelSmBold,
    color: colors.ink,
    fontSize: 11,
  },
  stepContent: {
    gap: 4,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitle: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  stepTag: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  stepDescription: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 21,
  },
  gearSetup: {
    ...typography.labelSm,
    color: colors.ink,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
