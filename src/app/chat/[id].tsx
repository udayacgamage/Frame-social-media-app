import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon } from '@/components/common/Icon';
import { useChat } from '@/hooks/useChat';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { ChatMessage } from '@/types';

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const threadId = id || 'msg_1';
  const { messages, loading, recipient, sendMessage } = useChat(threadId);
  const { pickImage, uploadImage, uploading: imageUploading } = useImageUpload();

  const [inputText, setInputText] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if ((!text && !selectedImageUri) || sending || imageUploading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    setSending(true);

    let attachedImageUrl: string | undefined = undefined;
    if (selectedImageUri) {
      const res = await uploadImage(
        { uri: selectedImageUri, width: 1080, height: 1350 } as any,
        'posts'
      );
      if (res.publicUrl) {
        attachedImageUrl = res.publicUrl;
      }
    }

    const { error } = await sendMessage(text, attachedImageUrl);
    setSending(false);

    if (error) {
      Alert.alert('Send Failed', error);
    } else {
      setInputText('');
      setSelectedImageUri(null);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}
    }
  };

  const handlePickPhoto = async () => {
    try {
      const asset = await pickImage({ allowsEditing: true, aspect: [4, 5], quality: 0.85 });
      if (asset?.uri) {
        setSelectedImageUri(asset.uri);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not pick photo');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Conversation Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recipientCluster}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(recipient.name, `@${recipient.handle} • Visual Artist`);
            }}
          >
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: recipient.avatarUrl }} style={styles.headerAvatar} />
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.recipientMeta}>
              <Text style={styles.recipientName} numberOfLines={1}>
                {recipient.name}
              </Text>
              <Text style={styles.recipientStatus}>Active in Ella Story</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.headerRightAction}
          onPress={() => {
            Alert.alert(
              'Conversation Options',
              `Collaborating with ${recipient.name}`,
              [
                { text: 'View Portfolio', onPress: () => router.push('/(tabs)/profile') },
                { text: 'Invite to Room', onPress: () => router.push('/(tabs)/rooms') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <Icon name="more-horiz" size={22} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Messages Stream */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item, index }) => {
            const isMe = item.isMe;
            const showAvatar =
              !isMe && (index === 0 || messages[index - 1]?.isMe !== item.isMe);

            return (
              <View
                style={[
                  styles.messageRow,
                  isMe ? styles.messageRowMe : styles.messageRowOther,
                ]}
              >
                {!isMe && (
                  <View style={styles.bubbleAvatarContainer}>
                    {showAvatar ? (
                      <Image source={{ uri: recipient.avatarUrl }} style={styles.bubbleAvatar} />
                    ) : (
                      <View style={styles.bubbleAvatarSpacer} />
                    )}
                  </View>
                )}

                <View style={styles.bubbleWrapper}>
                  {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.attachmentImage} />
                  )}

                  {Boolean(item.content) && (
                    <View
                      style={[
                        styles.bubble,
                        isMe ? styles.bubbleMe : styles.bubbleOther,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          isMe ? styles.bubbleTextMe : styles.bubbleTextOther,
                        ]}
                      >
                        {item.content}
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.timestampRow,
                      isMe ? styles.timestampRowMe : styles.timestampRowOther,
                    ]}
                  >
                    <Text style={styles.timestampText}>{item.timeLabel || 'just now'}</Text>
                    {isMe && (
                      <Icon
                        name={item.status === 'read' ? 'done-all' : 'check'}
                        size={12}
                        color={item.status === 'read' ? colors.coral : colors.muted}
                        style={styles.statusCheck}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* Selected Image Preview Drawer */}
        {selectedImageUri && (
          <View style={styles.previewDrawer}>
            <Image source={{ uri: selectedImageUri }} style={styles.previewThumbnail} />
            <View style={styles.previewMeta}>
              <Text style={styles.previewLabel}>Photo attached</Text>
              <Text style={styles.previewSub}>4:5 high-res capture</Text>
            </View>
            <TouchableOpacity
              style={styles.previewRemoveBtn}
              onPress={() => setSelectedImageUri(null)}
              activeOpacity={0.7}
            >
              <Icon name="close" size={16} color={colors.ink} />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Composer Bar */}
        <View style={styles.composerBar}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handlePickPhoto}
            activeOpacity={0.7}
          >
            <Icon name="photo-camera" size={20} color={colors.secondary} />
          </TouchableOpacity>

          <View style={styles.inputPill}>
            <TextInput
              style={styles.textInput}
              placeholder={`Message @${recipient.handle}...`}
              placeholderTextColor={colors.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim().length > 0 || selectedImageUri) && styles.sendButtonActive,
                (sending || imageUploading) && { opacity: 0.6 },
              ]}
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedImageUri) || sending || imageUploading}
              activeOpacity={0.8}
            >
              {sending || imageUploading ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Icon
                  name="arrow-upward"
                  size={16}
                  color={
                    inputText.trim().length > 0 || selectedImageUri
                      ? colors.surface
                      : colors.secondary
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 2,
  },
  recipientCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  recipientMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  recipientName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  recipientStatus: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
  },
  headerRightAction: {
    padding: 6,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
  },
  messageList: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginVertical: 2,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubbleAvatarContainer: {
    width: 28,
    alignItems: 'center',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  bubbleAvatarSpacer: {
    width: 28,
    height: 28,
  },
  bubbleWrapper: {
    maxWidth: '78%',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: colors.ink,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceContainer,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    ...typography.bodyMd,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: colors.surface,
  },
  bubbleTextOther: {
    color: colors.ink,
  },
  attachmentImage: {
    width: 220,
    height: 275,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    paddingHorizontal: 4,
  },
  timestampRowMe: {
    justifyContent: 'flex-end',
  },
  timestampRowOther: {
    justifyContent: 'flex-start',
  },
  timestampText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 10,
  },
  statusCheck: {
    marginLeft: 2,
  },
  previewDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    gap: spacing.sm,
  },
  previewThumbnail: {
    width: 44,
    height: 55,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  previewMeta: {
    flex: 1,
  },
  previewLabel: {
    ...typography.bodyMdMedium,
    color: colors.ink,
    fontSize: 13,
  },
  previewSub: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
  },
  previewRemoveBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    gap: spacing.xs,
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 22,
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 3,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.coral,
  },
});
