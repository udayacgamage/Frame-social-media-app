import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/theme/tokens';
import { Icon } from '../common/Icon';
import { SharedStory } from '@/types';

interface StoryAvatarStripProps {
  stories: SharedStory[];
  onAddStory?: () => void;
}

export const StoryAvatarStrip: React.FC<StoryAvatarStripProps> = ({
  stories,
  onAddStory,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Your Story Trigger */}
        <TouchableOpacity
          style={styles.storyItem}
          onPress={() => {
            if (onAddStory) onAddStory();
            else router.push('/(tabs)/create');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.yourStoryRing}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoHxbAxMax8M47qEMnZLNNH-T8OpkT0zVA471vkqcOiF5SjfBSnDslwBOZCGs2WCrIEX9IFIlpB0aHGnS-tBDQSNx6uWIiHPQCkFCBeVLzCP2dzJUEsgl5nU2Gt-MPF4otdr6Y_XSiaCteFyKplCwJxcRANd9f-d-iSww_j3HABJjNkA5m1UsXpVtvRrS2oCQ2qswMp_Dvbv3h1EfzWJBmfxzIi5IoyHmT6ofW69hkx822gTLfsmxc7Cqzp6aIvCBm8ruhxsM7JQ',
              }}
              style={styles.avatar}
            />
            <View style={styles.addBadge}>
              <Icon name="add" size={13} color={colors.surface} />
            </View>
          </View>
          <Text style={styles.storyLabel} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* Stories from creators */}
        {stories.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyItem}
            onPress={() => router.push(`/story/${story.id}`)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.storyRing,
                story.hasUnread ? styles.unreadRing : styles.viewedRing,
              ]}
            >
              <Image source={{ uri: story.coverImageUrl }} style={styles.avatar} />
            </View>
            <Text
              style={[
                styles.storyLabel,
                story.hasUnread && styles.unreadLabel,
              ]}
              numberOfLines={1}
            >
              {story.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  storyItem: {
    alignItems: 'center',
    width: 64,
  },
  yourStoryRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadRing: {
    borderWidth: 2,
    borderColor: colors.coral,
  },
  viewedRing: {
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHighest,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  addBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  storyLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    maxWidth: 64,
  },
  unreadLabel: {
    color: colors.ink,
    fontWeight: '500',
  },
});
