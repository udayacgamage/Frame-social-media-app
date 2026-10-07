import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon } from '../common/Icon';
import type { ProcessStage } from '@/types';

interface ProcessTimelineProps {
  stages: ProcessStage[];
  /** Optional — will use the post's final image as the last slide */
  finalImageUrl?: string;
  /** Optional — the raw/unedited image for the first slide */
  rawImageUrl?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const SLIDE_WIDTH = screenWidth;
const SLIDE_IMAGE_HEIGHT = 380;

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  stages,
  finalImageUrl,
  rawImageUrl,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Build timeline slides: each stage gets a slide
  const timelineSlides = stages.map((stage, idx) => ({
    stage,
    imageUrl:
      stage.processedImageUrl ||
      stage.rawImageUrl ||
      rawImageUrl ||
      finalImageUrl ||
      '',
    isFinal: false,
  }));

  // Add a "Final Result" slide at the end if we have a final image
  if (finalImageUrl) {
    timelineSlides.push({
      stage: {
        stepNumber: stages.length + 1,
        title: 'Final Result',
        tag: 'Complete',
        description: 'The finished photograph after all processing stages.',
      },
      imageUrl: finalImageUrl,
      isFinal: true,
    });
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SLIDE_WIDTH);
    if (index !== activeIndex && index >= 0 && index < timelineSlides.length) {
      setActiveIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SLIDE_WIDTH, animated: true });
    setActiveIndex(index);
  };

  if (timelineSlides.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Icon name="auto-awesome" size={18} color={colors.coral} />
          <Text style={styles.sectionTitle}>Process Timeline</Text>
        </View>
        <Text style={styles.slideCounter}>
          {activeIndex + 1} / {timelineSlides.length}
        </Text>
      </View>

      {/* Filmstrip Progress Bar */}
      <View style={styles.filmstripBar}>
        {timelineSlides.map((slide, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.filmstripFrame,
              idx === activeIndex && styles.filmstripFrameActive,
              slide.isFinal && styles.filmstripFrameFinal,
            ]}
            onPress={() => goToSlide(idx)}
            activeOpacity={0.7}
          >
            <View style={styles.filmstripDot}>
              <Text
                style={[
                  styles.filmstripNumber,
                  idx === activeIndex && styles.filmstripNumberActive,
                ]}
              >
                {slide.stage.stepNumber}
              </Text>
            </View>
            <Text
              style={[
                styles.filmstripLabel,
                idx === activeIndex && styles.filmstripLabelActive,
              ]}
              numberOfLines={1}
            >
              {slide.stage.tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Horizontal Swipeable Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.slideScroll}
      >
        {timelineSlides.map((slide, idx) => (
          <View key={idx} style={[styles.slide, { width: SLIDE_WIDTH }]}>
            {/* Stage Image */}
            <View style={styles.slideImageWrapper}>
              <Image
                source={{ uri: slide.imageUrl }}
                style={styles.slideImage}
                resizeMode="cover"
              />

              {/* Stage Tag Overlay */}
              <View
                style={[
                  styles.stageTagOverlay,
                  slide.isFinal && styles.stageTagFinal,
                ]}
              >
                <Icon
                  name={slide.isFinal ? 'check-circle' : 'layers'}
                  size={13}
                  color={colors.surface}
                />
                <Text style={styles.stageTagText}>
                  Step {slide.stage.stepNumber}: {slide.stage.tag}
                </Text>
              </View>

              {/* Navigation Hints */}
              {idx > 0 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowLeft]}
                  onPress={() => goToSlide(idx - 1)}
                  activeOpacity={0.7}
                >
                  <Icon name="chevron-left" size={22} color={colors.surface} />
                </TouchableOpacity>
              )}
              {idx < timelineSlides.length - 1 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowRight]}
                  onPress={() => goToSlide(idx + 1)}
                  activeOpacity={0.7}
                >
                  <Icon name="chevron-right" size={22} color={colors.surface} />
                </TouchableOpacity>
              )}
            </View>

            {/* Stage Detail Card */}
            <View style={styles.stageDetailCard}>
              <View style={styles.stageDetailHeader}>
                <Text style={styles.stageTitle}>{slide.stage.title}</Text>
                {slide.stage.gearSetup && (
                  <View style={styles.gearPill}>
                    <Icon name="camera" size={12} color={colors.secondary} />
                    <Text style={styles.gearPillText}>
                      {slide.stage.gearSetup}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.stageDescription}>
                {slide.stage.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.dotRow}>
        {timelineSlides.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, idx === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  slideCounter: {
    ...typography.labelSm,
    color: colors.secondary,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
    overflow: 'hidden',
  },
  filmstripBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.gutter,
    gap: 4,
    marginBottom: spacing.sm,
  },
  filmstripFrame: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filmstripFrameActive: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filmstripFrameFinal: {
    borderColor: colors.coral,
  },
  filmstripDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filmstripNumber: {
    ...typography.labelSm,
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
  },
  filmstripNumberActive: {
    color: colors.ink,
  },
  filmstripLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    flex: 1,
    fontSize: 10,
  },
  filmstripLabelActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  slideScroll: {
    flex: 1,
  },
  slide: {
    paddingBottom: spacing.xs,
  },
  slideImageWrapper: {
    width: '100%',
    height: SLIDE_IMAGE_HEIGHT,
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  stageTagOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(28, 27, 27, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stageTagFinal: {
    backgroundColor: 'rgba(230, 75, 56, 0.88)',
  },
  stageTagText: {
    ...typography.labelSm,
    color: colors.surface,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(28, 27, 27, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowLeft: {
    left: spacing.sm,
  },
  navArrowRight: {
    right: spacing.sm,
  },
  stageDetailCard: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surfaceContainerLow,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  stageDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stageTitle: {
    ...typography.bodyMdMedium,
    color: colors.ink,
    flex: 1,
  },
  gearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  gearPillText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 10,
  },
  stageDescription: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 20,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHighest,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.ink,
    borderRadius: 3,
  },
});
