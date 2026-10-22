import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon, IconName } from '@/components/common/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useRooms } from '@/hooks/useRooms';
import { useImageUpload } from '@/hooks/useImageUpload';

const { width: screenWidth } = Dimensions.get('window');

type OnboardingStep = 0 | 1 | 2 | 3;

const WELCOME_SLIDES = [
  {
    icon: 'camera' as IconName,
    title: 'Share Your Process',
    description:
      'Frame celebrates the journey behind the image — not just the final result. Show your RAW captures, editing breakdowns, and creative decisions.',
  },
  {
    icon: 'groups' as IconName,
    title: 'Join Creative Rooms',
    description:
      'Discover curated communities for street photography, culinary arts, ceramics, and more. Collaborate with fellow creators.',
  },
  {
    icon: 'auto-awesome' as IconName,
    title: 'Tell Stories Together',
    description:
      'Build collaborative visual stories with friends. Contribute photos, moments, and notes to shared travel journals and projects.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, isMockMode } = useAuth();
  const { updateProfile } = useProfile();
  const { rooms } = useRooms();
  const { pickImage, uploadImage, uploading } = useImageUpload();

  const [step, setStep] = useState<OnboardingStep>(0);
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const welcomeRef = useRef<FlatList>(null);
  const [welcomeIndex, setWelcomeIndex] = useState(0);

  const canProceedFromStep1 = handle.trim().length >= 3 && displayName.trim().length >= 2;

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => (s - 1) as OnboardingStep);
    }
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handlePickAvatar = async () => {
    const asset = await pickImage({ aspect: [1, 1], allowsEditing: true });
    if (asset) {
      setAvatarUri(asset.uri);
    }
  };

  const handleFinish = async () => {
    setSaving(true);

    let avatarUrl: string | undefined;
    if (avatarUri && (avatarUri.startsWith('file://') || avatarUri.startsWith('content://'))) {
      const result = await uploadImage(
        { uri: avatarUri, width: 400, height: 400 } as any,
        'avatars'
      );
      if (!result.error && result.publicUrl) {
        avatarUrl = result.publicUrl;
      }
    } else if (avatarUri) {
      avatarUrl = avatarUri;
    }

    await updateProfile({
      handle: handle.trim(),
      displayName: displayName.trim(),
      ...(avatarUrl ? { avatarUrl } : {}),
    });

    setSaving(false);
    router.replace('/(tabs)');
  };

  // ─── Step 0: Welcome Carousel ───
  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeTop}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>Frame</Text>
      </View>

      <FlatList
        ref={welcomeRef}
        data={WELCOME_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setWelcomeIndex(idx);
        }}
        keyExtractor={(_, i) => `slide-${i}`}
        renderItem={({ item }) => (
          <View style={[styles.slideCard, { width: screenWidth - spacing.gutter * 2 }]}>
            <View style={styles.slideIconContainer}>
              <Icon name={item.icon} size={40} color={colors.coral} />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        )}
        contentContainerStyle={styles.slideList}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {WELCOME_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, welcomeIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace('/(tabs)')}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Step 1: Handle & Display Name ───
  const renderIdentity = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.stepTitle}>Create your identity</Text>
        <Text style={styles.stepSubtitle}>
          Choose a unique handle and display name for your creative profile.
        </Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Handle</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.handlePrefix}>@</Text>
            <TextInput
              style={styles.input}
              value={handle}
              onChangeText={(text) => setHandle(text.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
              placeholder="your_handle"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={24}
            />
            {handle.length >= 3 && (
              <Icon name="check-circle" size={18} color={colors.success} />
            )}
          </View>
          <Text style={styles.inputHint}>
            Letters, numbers, dots, and underscores. Min 3 characters.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name</Text>
          <View style={styles.inputWrapper}>
            <Icon name="person-outline" size={20} color={colors.secondary} />
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your creative name"
              placeholderTextColor={colors.muted}
              maxLength={40}
            />
          </View>
        </View>
      </View>

      <View style={styles.stepFooter}>
        <TouchableOpacity
          style={[styles.primaryButton, !canProceedFromStep1 && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canProceedFromStep1}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Step 2: Interest Picker (Rooms) ───
  const renderInterests = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.stepTitle}>Pick your spaces</Text>
        <Text style={styles.stepSubtitle}>
          Join rooms that match your creative interests. You can always change these later.
        </Text>
      </View>

      <ScrollView style={styles.roomsList} showsVerticalScrollIndicator={false}>
        {rooms.map((room) => {
          const isSelected = selectedRooms.includes(room.id);
          return (
            <TouchableOpacity
              key={room.id}
              style={[styles.roomCard, isSelected && styles.roomCardSelected]}
              onPress={() => toggleRoom(room.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: room.coverImageUrl }} style={styles.roomCover} />
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomCategory}>{room.category}</Text>
                <Text style={styles.roomMembers}>
                  {room.membersCount.toLocaleString()} members
                </Text>
              </View>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                {isSelected && <Icon name="check" size={16} color={colors.surface} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.stepFooter}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {selectedRooms.length > 0
              ? `Continue with ${selectedRooms.length} room${selectedRooms.length > 1 ? 's' : ''}`
              : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Step 3: Avatar Upload ───
  const renderAvatar = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.stepTitle}>Add a profile photo</Text>
        <Text style={styles.stepSubtitle}>
          Help other creators recognize you. You can change this anytime in Settings.
        </Text>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarPicker}
          onPress={handlePickAvatar}
          activeOpacity={0.8}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="add-a-photo" size={36} color={colors.secondary} />
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Icon name="edit" size={14} color={colors.surface} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarLabel}>
          {avatarUri ? 'Tap to change' : 'Tap to choose a photo'}
        </Text>
      </View>

      {/* Preview card */}
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Preview</Text>
        <View style={styles.previewRow}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.previewAvatar} />
          ) : (
            <View style={[styles.previewAvatar, styles.previewAvatarEmpty]}>
              <Icon name="person" size={20} color={colors.muted} />
            </View>
          )}
          <View>
            <Text style={styles.previewName}>{displayName || 'Your Name'}</Text>
            <Text style={styles.previewHandle}>@{handle || 'handle'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.stepFooter}>
        <TouchableOpacity
          style={[styles.primaryButton, (saving || uploading) && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={saving || uploading}
          activeOpacity={0.85}
        >
          {saving || uploading ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>

        {!avatarUri && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleFinish}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Progress Bar */}
      {step > 0 && (
        <View style={styles.progressContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]}
            />
          </View>
        </View>
      )}

      {step === 0 && renderWelcome()}
      {step === 1 && renderIdentity()}
      {step === 2 && renderInterests()}
      {step === 3 && renderAvatar()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: colors.hairline,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.coral,
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
  },

  // ── Welcome ──
  welcomeTop: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 16,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    ...typography.headlineLg,
    color: colors.ink,
    letterSpacing: -0.5,
    fontSize: 28,
  },
  slideList: {
    paddingHorizontal: 0,
  },
  slideCard: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  slideIconContainer: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: '#FFF5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  slideTitle: {
    ...typography.headlineMd,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  slideDescription: {
    ...typography.bodyMd,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.hairline,
  },
  dotActive: {
    backgroundColor: colors.coral,
    width: 24,
  },

  // ── Identity Step ──
  stepHeader: {
    marginTop: 24,
    marginBottom: 28,
  },
  stepLabel: {
    ...typography.labelSm,
    color: colors.coral,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepTitle: {
    ...typography.headlineLg,
    color: colors.ink,
    marginBottom: 8,
  },
  stepSubtitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 22,
  },
  formSection: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    ...typography.labelSmBold,
    color: colors.ink,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  handlePrefix: {
    ...typography.bodyLg,
    color: colors.secondary,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
    paddingVertical: 0,
    fontSize: 15,
  },
  inputHint: {
    ...typography.labelSm,
    color: colors.muted,
    marginLeft: 2,
  },
  stepFooter: {
    marginTop: 'auto',
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // ── Interests Step ──
  roomsList: {
    flex: 1,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  roomCardSelected: {
    borderColor: colors.coral,
    backgroundColor: '#FFF9F8',
  },
  roomCover: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  roomCategory: {
    ...typography.labelSm,
    color: colors.coral,
    marginTop: 1,
  },
  roomMembers: {
    ...typography.labelSm,
    color: colors.muted,
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },

  // ── Avatar Step ──
  avatarSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatarPicker: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: 'relative',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: spacing.md,
  },
  previewCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: spacing.gutter,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  previewLabel: {
    ...typography.labelSm,
    color: colors.muted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  previewAvatarEmpty: {
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  previewHandle: {
    ...typography.labelSm,
    color: colors.secondary,
  },

  // ── Buttons ──
  primaryButton: {
    backgroundColor: colors.coral,
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.bodyMd,
    color: colors.secondary,
    fontWeight: '500',
  },
});
