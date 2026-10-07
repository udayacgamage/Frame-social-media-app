import React from 'react';
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
import { useStories } from '@/hooks/useStories';
import { useImageUpload } from '@/hooks/useImageUpload';
import { sampleStories } from '@/data/mockData';

export default function SharedStoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { stories, addContribution } = useStories(id);
  const { pickImage, takePhoto, uploadImage, uploading } = useImageUpload();
  const story =
    stories.find((s) => s.id === id) ||
    sampleStories.find((s) => s.id === id) ||
    stories[0] ||
    sampleStories[0];

  const handleInvite = () => {
    Alert.alert(
      'Invite Collaborator',
      `Share this invite link with collaborators for "${story.title}": https://frame.community/story/${story.id}`,
      [{ text: 'Copy Invite Link' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const handleAddSlide = () => {
    Alert.alert(
      'Add to Shared Story',
      `Document a new visual chapter in ${story.title}.`,
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const asset = await takePhoto();
            if (asset) {
              const res = await uploadImage(asset, 'posts');
              if (res.publicUrl) {
                await addContribution(story.id, {
                  imageUrl: res.publicUrl,
                  caption: 'Captured moment',
                  timestampLabel: 'Just now',
                });
                Alert.alert('Moment Added', 'Your contribution has been added to this story.');
              }
            }
          },
        },
        {
          text: 'Choose from Camera Roll',
          onPress: async () => {
            const asset = await pickImage({ allowsEditing: true, aspect: [4, 5] });
            if (asset) {
              const res = await uploadImage(asset, 'posts');
              if (res.publicUrl) {
                await addContribution(story.id, {
                  imageUrl: res.publicUrl,
                  caption: 'Captured moment',
                  timestampLabel: 'Just now',
                });
                Alert.alert('Moment Added', 'Your contribution has been added to this story.');
              }
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={story.title}
        showBack
        rightActions={[
          {
            icon: 'share',
            onPress: () => {},
            ariaLabel: 'Share story',
          },
          {
            icon: 'more-vert',
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
        {/* Contributors & Invite Strip */}
        <View style={styles.contributorsStrip}>
          <View style={styles.avatarStack}>
            {story.contributors.map((c, i) => (
              <Image
                key={c.id}
                source={{ uri: c.avatarUrl }}
                style={[styles.contributorAvatar, { marginLeft: i > 0 ? -8 : 0 }]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleInvite}
            activeOpacity={0.8}
          >
            <Icon name="person-add" size={15} color={colors.ink} />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Story Sub-meta */}
        <View style={styles.metaRow}>
          <View style={styles.coralDot} />
          <Text style={styles.metaText}>
            Shared Story • {story.contributorsCount} contributors
          </Text>
        </View>

        {/* Chronological Contributions Stream */}
        <View style={styles.slidesContainer}>
          {story.slides?.map((slide, index) => (
            <View key={slide.id} style={styles.slideCard}>
              {/* Contributor Header */}
              <View style={styles.slideHeader}>
                <Image
                  source={{ uri: slide.contributor.avatarUrl }}
                  style={styles.slideAuthorAvatar}
                />
                <View style={styles.slideAuthorMeta}>
                  <Text style={styles.slideAuthorName}>{slide.contributor.name}</Text>
                  <View style={styles.slideLocationRow}>
                    <Text style={styles.slideTimestamp}>{slide.timestamp}</Text>
                    {slide.location && (
                      <>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.slideLocation}>{slide.location}</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Slide Photo (4:5 Ratio) */}
              <View style={styles.slideMedia}>
                <Image source={{ uri: slide.imageUrl }} style={styles.slideImage} />
              </View>

              {/* Caption */}
              {slide.caption && (
                <View style={styles.slideCaptionWrapper}>
                  <Text style={styles.slideCaption}>{slide.caption}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Persistent Bottom Bar: Add Contribution CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addSlideButton}
          onPress={handleAddSlide}
          activeOpacity={0.88}
        >
          <Icon name="add-photo-alternate" size={18} color={colors.surface} />
          <Text style={styles.addSlideButtonText}>Contribute to Story</Text>
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
  contributorsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  inviteButtonText: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.gutter,
    marginTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  coralDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  metaText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  slidesContainer: {
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  slideCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    paddingBottom: spacing.md,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
  },
  slideAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  slideAuthorMeta: {
    justifyContent: 'center',
  },
  slideAuthorName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  slideLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slideTimestamp: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  dotSeparator: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  slideLocation: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  slideMedia: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: colors.surfaceContainerLow,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideCaptionWrapper: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
  slideCaption: {
    ...typography.bodyMd,
    color: colors.ink,
    lineHeight: 20,
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
  addSlideButton: {
    backgroundColor: colors.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radii.md,
  },
  addSlideButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
});
