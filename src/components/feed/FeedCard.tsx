import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon } from '../common/Icon';
import { Post } from '@/types';

interface FeedCardProps {
  post: Post;
  onCommentPress?: (post: Post) => void;
  onSharePress?: (post: Post) => void;
  onToggleLike?: () => void;
  onToggleBookmark?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const FeedCard: React.FC<FeedCardProps> = ({
  post,
  onCommentPress,
  onSharePress,
  onToggleLike,
  onToggleBookmark,
}) => {
  const router = useRouter();
  const liked = post.isLiked ?? false;
  const likesCount = post.likesCount;
  const bookmarked = post.isBookmarked ?? false;

  const toggleLike = () => {
    onToggleLike?.();
  };

  const toggleBookmark = () => {
    onToggleBookmark?.();
  };

  const openProcess = () => {
    router.push(`/process/${post.id}`);
  };

  const openRoom = () => {
    router.push(`/room/${post.roomId}`);
  };

  return (
    <View style={styles.card}>
      {/* Author Bar */}
      <View style={styles.authorBar}>
        <View style={styles.authorCluster}>
          <Image source={{ uri: post.author.avatarUrl }} style={styles.authorAvatar} />
          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{post.author.handle}</Text>
              {post.coAuthor && (
                <>
                  <Text style={styles.ampersand}>&</Text>
                  <Text style={styles.authorName}>{post.coAuthor.handle}</Text>
                </>
              )}
            </View>
            <TouchableOpacity onPress={openRoom} activeOpacity={0.7}>
              <Text style={styles.roomTag}>in {post.roomName}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="more-horiz" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Media Viewport (4:5 Aspect Ratio) */}
      <TouchableOpacity
        style={styles.mediaContainer}
        activeOpacity={post.processStagesCount ? 0.9 : 1}
        onPress={() => {
          if (post.processStagesCount) {
            openProcess();
          }
        }}
      >
        <Image source={{ uri: post.imageUrl }} style={styles.mediaImage} />

        {/* Process Stages Floating Badge */}
        {Boolean(post.processStagesCount) && (
          <TouchableOpacity
            style={styles.processBadge}
            onPress={openProcess}
            activeOpacity={0.85}
          >
            <Icon name="tune" size={13} color={colors.surface} />
            <Text style={styles.processBadgeText}>
              {post.processStagesCount} Process Stages
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Interactions & Meta */}
      <View style={styles.interactionSection}>
        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={toggleLike} style={styles.actionButton} activeOpacity={0.7}>
              <Icon
                name={liked ? 'favorite' : 'favorite-border'}
                size={24}
                color={liked ? colors.coral : colors.ink}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => (onCommentPress ? onCommentPress(post) : openProcess())}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Icon name="chat-bubble-outline" size={22} color={colors.ink} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => (onSharePress ? onSharePress(post) : null)}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Icon name="send" size={21} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={toggleBookmark} style={styles.actionButton} activeOpacity={0.7}>
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-border'}
              size={23}
              color={bookmarked ? colors.ink : colors.ink}
            />
          </TouchableOpacity>
        </View>

        {/* Likes Count */}
        <Text style={styles.likesText}>{likesCount} likes</Text>

        {/* Caption */}
        <Text style={styles.captionText} numberOfLines={3}>
          <Text style={styles.captionAuthor}>{post.author.handle} </Text>
          {post.caption}
        </Text>

        {/* Comments Link */}
        {post.commentsCount > 0 && (
          <TouchableOpacity
            onPress={() => (onCommentPress ? onCommentPress(post) : openProcess())}
            activeOpacity={0.7}
            style={styles.commentsLink}
          >
            <Text style={styles.commentsLinkText}>
              View all {post.commentsCount} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
  },
  authorCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceDim,
  },
  authorMeta: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  ampersand: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  roomTag: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  moreButton: {
    padding: spacing.xs,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  processBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 27, 27, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  processBadgeText: {
    ...typography.labelSm,
    color: colors.surface,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  interactionSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gutter,
  },
  actionButton: {
    paddingVertical: 2,
  },
  likesText: {
    ...typography.labelSmBold,
    color: colors.ink,
    marginTop: 2,
  },
  captionText: {
    ...typography.bodyMd,
    color: colors.ink,
    lineHeight: 20,
    marginTop: 2,
  },
  captionAuthor: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  commentsLink: {
    marginTop: 4,
  },
  commentsLinkText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
});
