import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon } from '@/components/common/Icon';
import { useComments, Comment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  postAuthorHandle?: string;
  onCommentCountChange?: (newCount: number) => void;
}

const { height: screenHeight } = Dimensions.get('window');

function formatTimeAgo(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postId,
  postTitle,
  postAuthorHandle,
  onCommentCountChange,
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleSubmit = async () => {
    const text = inputText.trim();
    if (!text || submitting) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    setSubmitting(true);
    const { error } = await addComment(text);
    setSubmitting(false);

    if (error) {
      Alert.alert('Unable to post comment', error);
    } else {
      setInputText('');
      onCommentCountChange?.(comments.length + 1);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  const handleDelete = (comment: Comment) => {
    Alert.alert('Delete Comment', 'Are you sure you want to remove this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          } catch {}
          await deleteComment(comment.id);
          onCommentCountChange?.(Math.max(0, comments.length - 1));
        },
      },
    ]);
  };

  const userAvatar =
    profile?.avatarUrl ||
    user?.user_metadata?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}
        >
          <SafeAreaView edges={['bottom']} style={styles.sheetContent}>
            {/* Top Drag Indicator */}
            <View style={styles.dragBarContainer}>
              <View style={styles.dragBar} />
            </View>

            {/* Sheet Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.titleRow}>
                  <Text style={styles.headerTitle}>Commentary</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{comments.length}</Text>
                  </View>
                </View>
                {postAuthorHandle ? (
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    on @{postAuthorHandle}’s creation {postTitle ? `— ${postTitle}` : ''}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color={colors.ink} />
              </TouchableOpacity>
            </View>

            {/* Comment Stream */}
            {loading && comments.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.coral} />
                <Text style={styles.loadingText}>Loading conversation...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="chat-bubble-outline" size={24} color={colors.secondary} />
                </View>
                <Text style={styles.emptyTitle}>No notes yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start the dialogue. Ask about camera exposure, lighting ratios, or post-grade workflow.
                </Text>
              </View>
            ) : (
              <FlatList
                ref={listRef}
                data={comments}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isAuthor = user?.id && item.authorId === user.id;

                  return (
                    <View style={styles.commentItem}>
                      <Image
                        source={{
                          uri:
                            item.authorAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
                        }}
                        style={styles.commentAvatar}
                      />

                      <View style={styles.commentBody}>
                        <View style={styles.commentMetaRow}>
                          <Text style={styles.commentAuthor}>{item.authorHandle}</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
                        </View>

                        <Text style={styles.commentText}>{item.content}</Text>
                      </View>

                      {isAuthor && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          activeOpacity={0.6}
                        >
                          <Icon name="delete-outline" size={16} color={colors.secondary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            )}

            {/* Input Bar */}
            <View style={styles.inputContainer}>
              <Image source={{ uri: userAvatar }} style={styles.inputAvatar} />

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add a constructive observation..."
                  placeholderTextColor={colors.muted}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    inputText.trim().length > 0 && styles.sendButtonActive,
                    submitting && { opacity: 0.6 },
                  ]}
                  onPress={handleSubmit}
                  disabled={inputText.trim().length === 0 || submitting}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <Icon
                      name="arrow-upward"
                      size={18}
                      color={inputText.trim().length > 0 ? colors.surface : colors.secondary}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: screenHeight * 0.85,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl || 20,
    borderTopRightRadius: radii.xl || 20,
    overflow: 'hidden',
  },
  sheetContent: {
    flexShrink: 1,
  },
  dragBarContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: 4,
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.hairline,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  countBadge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    ...typography.labelSm,
    color: colors.ink,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    borderRadius: radii.full || 16,
    backgroundColor: colors.surfaceContainerLow,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  emptyContainer: {
    paddingVertical: 48,
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
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    marginTop: 2,
  },
  commentBody: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  commentAuthor: {
    ...typography.labelSm,
    fontWeight: '600',
    color: colors.ink,
  },
  metaDot: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  commentTime: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  commentText: {
    ...typography.bodyMd,
    color: colors.ink,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.full || 20,
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  textInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    maxHeight: 90,
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.coral,
  },
});
