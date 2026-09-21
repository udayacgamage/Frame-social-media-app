import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon } from '@/components/common/Icon';
import { useImageUpload } from '@/hooks/useImageUpload';
import { usePosts } from '@/hooks/usePosts';
import { useRooms } from '@/hooks/useRooms';

type CreationMode = 'Share a Moment' | 'Shared Story' | 'Challenge';
type VisibilityMode = 'Public Room' | 'Contributors' | 'Followers';

export default function CreateScreen() {
  const router = useRouter();
  const { pickImage, uploadImage, uploading } = useImageUpload();
  const { createPost } = usePosts();
  const { rooms } = useRooms();
  const [mode, setMode] = useState<CreationMode>('Share a Moment');
  const [caption, setCaption] = useState(
    'Exploring wheel balance and raw earthy clay forms during the early morning studio study session.'
  );
  const [destinationRoom, setDestinationRoom] = useState('Street Photography');
  const [visibility, setVisibility] = useState<VisibilityMode>('Public Room');
  const [quietMode, setQuietMode] = useState(false);
  const [imageUri, setImageUri] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCgmbS-WDJ6-KlEG2kXug36EBXmITXn4QGCrd949WFqA1407pfC9fxm0KTRjHuaSJ2sYFIkdc4QZEMADZWa7o3DwKexwwQO7tvVetfEeZYye4cRcPQFItRIme2k0yBtoFsdEFyDljYYFvda-1rGNWrBctGq5Dv4CYn9r_wmS6L7JzAuKftSfiD4T-egwoHCOLMOule_guPkHTclrWGfRrEzwYPz5Sl67LnO11gEJ8j6KGWWIgqAbgTG7_MFpB7QgYxLTg-QBzD7PA'
  );
  const [publishing, setPublishing] = useState(false);

  const handlePickImage = async () => {
    const asset = await pickImage({ aspect: [4, 5] });
    if (asset) {
      setImageUri(asset.uri);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);

    // Upload image if it's a local URI
    let publicUrl = imageUri;
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
      const result = await uploadImage({ uri: imageUri, width: 1080, height: 1350 } as any);
      if (result.error) {
        Alert.alert('Upload failed', result.error);
        setPublishing(false);
        return;
      }
      publicUrl = result.publicUrl || imageUri;
    }

    const selectedRoom = rooms.find(
      (r) => r.name.toLowerCase() === destinationRoom.toLowerCase()
    );

    const { error } = await createPost({
      imageUrl: publicUrl,
      caption,
      roomId: selectedRoom?.id,
      visibility: visibility === 'Public Room' ? 'public' : visibility === 'Contributors' ? 'contributors' : 'followers',
      quietMode,
    });

    setPublishing(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert(
        'Creation Published',
        `Your creative work has been shared to ${destinationRoom}.`,
        [
          {
            text: 'View in Feed',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New creation</Text>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
          activeOpacity={0.85}
        >
          <Text style={styles.publishButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Segmented Mode Selector */}
        <View style={styles.modeSelector}>
          {(['Share a Moment', 'Shared Story', 'Challenge'] as CreationMode[]).map(
            (m) => {
              const active = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeButton, active && styles.modeButtonActive]}
                  onPress={() => setMode(m)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.modeText, active && styles.modeTextActive]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Media Preview Viewport (4:5 Ratio) */}
        <View style={styles.mediaViewport}>
          <Image source={{ uri: imageUri }} style={styles.mediaImage} />

          {/* Top RAW / Format Tag */}
          <View style={styles.rawTag}>
            <Text style={styles.rawTagText}>RAW 48MP</Text>
          </View>

          {/* Bottom Floating Bar */}
          <View style={styles.mediaFloatingBar}>
            <View style={styles.aspectPill}>
              <Icon name="aspect-ratio" size={15} color={colors.secondary} />
              <Text style={styles.aspectPillText}>4:5</Text>
            </View>

            <TouchableOpacity
              style={styles.replaceButton}
              activeOpacity={0.85}
              onPress={() => {
                Alert.alert(
                  'Media Selector',
                  'Select from Camera Roll or Supabase RAW Vault',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Icon name="autorenew" size={15} color={colors.secondary} />
              <Text style={styles.replaceButtonText}>Replace photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Caption & Process Breakdown Input */}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            multiline
            numberOfLines={4}
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption or process breakdown..."
            placeholderTextColor={colors.secondary}
          />
          <View style={styles.captionFooter}>
            <View style={styles.toolIcons}>
              <TouchableOpacity style={styles.toolIconBtn}>
                <Icon name="tag" size={18} color={colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolIconBtn}>
                <Icon name="location-on" size={18} color={colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolIconBtn}>
                <Icon name="mic" size={18} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.charCount}>{caption.length}/500</Text>
          </View>
        </View>

        {/* Meta Configuration Rows */}
        <View style={styles.metaSection}>
          {/* Destination Room */}
          <TouchableOpacity
            style={styles.metaRow}
            onPress={() => {
              Alert.alert('Destination Room', 'Select target community room:', [
                { text: 'Street Photography', onPress: () => setDestinationRoom('Street Photography') },
                { text: 'Home Cooking & Craft', onPress: () => setDestinationRoom('Home Cooking & Craft') },
                { text: 'Nordic Ceramics Studio', onPress: () => setDestinationRoom('Nordic Ceramics Studio') },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          >
            <Text style={styles.metaLabel}>Destination Room</Text>
            <View style={styles.metaValueRow}>
              <Text style={styles.metaValueText}>{destinationRoom}</Text>
              <Icon name="expand-more" size={18} color={colors.secondary} />
            </View>
          </TouchableOpacity>

          {/* Visibility Row */}
          <View style={styles.visibilityRow}>
            <View style={styles.visibilityHeader}>
              <Text style={styles.metaLabel}>Visibility</Text>
              <Text style={styles.visibilitySubtitle}>Who can see this</Text>
            </View>
            <View style={styles.pillGroup}>
              {(['Public Room', 'Contributors', 'Followers'] as VisibilityMode[]).map(
                (v) => {
                  const active = visibility === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
                      onPress={() => setVisibility(v)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          active ? styles.pillTextActive : styles.pillTextInactive,
                        ]}
                      >
                        {v}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>

          {/* Quiet Mode Row */}
          <View style={styles.quietModeRow}>
            <View style={styles.quietMeta}>
              <Text style={styles.metaLabel}>Quiet mode</Text>
              <Text style={styles.visibilitySubtitle}>
                Hide public like and impression metrics
              </Text>
            </View>
            <Switch
              value={quietMode}
              onValueChange={setQuietMode}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
              thumbColor={colors.surface}
            />
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  cancelText: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  publishButton: {
    backgroundColor: colors.coral,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  publishButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: spacing.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    padding: 3,
    borderRadius: radii.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radii.md - 2,
  },
  modeButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    ...typography.labelMd,
    color: colors.secondary,
  },
  modeTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  mediaViewport: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  rawTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(49, 48, 48, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  rawTagText: {
    ...typography.labelSm,
    color: colors.surface,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  mediaFloatingBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aspectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  aspectPillText: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  replaceButtonText: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  captionContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.sm + 2,
  },
  captionInput: {
    ...typography.bodyMd,
    color: colors.ink,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  captionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    marginTop: 4,
  },
  toolIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  toolIconBtn: {
    padding: 2,
  },
  charCount: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  metaSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  metaLabel: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  metaValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaValueText: {
    ...typography.bodyMd,
    color: colors.ink,
  },
  visibilityRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    gap: spacing.sm,
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibilitySubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  pillGroup: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  pill: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.ink,
  },
  pillInactive: {
    backgroundColor: colors.surfaceContainerLow,
  },
  pillText: {
    ...typography.labelMd,
  },
  pillTextActive: {
    color: colors.surface,
  },
  pillTextInactive: {
    color: colors.secondary,
  },
  quietModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  quietMeta: {
    flex: 1,
    marginRight: spacing.md,
  },
});
