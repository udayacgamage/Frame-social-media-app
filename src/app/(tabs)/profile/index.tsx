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
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { useRooms } from '@/hooks/useRooms';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';

const { width: screenWidth } = Dimensions.get('window');
const gridItemSize = (screenWidth - spacing.gutter * 2 - 8) / 2;

type ProfileTab = 'Grid' | 'Process' | 'Saved';

const quickGearSuggestions = [
  'Fujifilm X-T5',
  'Leica Q2',
  'Sony A7 IV',
  '35mm f/1.4',
  '50mm f/1.2',
  'Hasami Porcelain',
  'Midori MD Notebook',
];

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Grid');
  const { user, signOut } = useAuth();
  const { profile: currentUser, loading: profileLoading, updateProfile } = useProfile();
  const { posts: samplePosts } = usePosts({ authorId: user?.id });
  const { rooms: sampleRooms } = useRooms();
  const { pickImage, takePhoto, uploadImage, uploading: imageUploading } = useImageUpload();

  // Tab-filtered posts
  const filteredPosts = React.useMemo(() => {
    if (activeTab === 'Process') {
      return samplePosts.filter((p) => (p.processStagesCount ?? 0) > 0);
    }
    if (activeTab === 'Saved') {
      return samplePosts.filter((p) => p.isBookmarked);
    }
    return samplePosts;
  }, [activeTab, samplePosts]);

  // Edit Profile Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editPronouns, setEditPronouns] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGear, setEditGear] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editQuietMode, setEditQuietMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = () => {
    if (!currentUser) return;
    setEditDisplayName(currentUser.displayName || '');
    setEditHandle(currentUser.handle || '');
    setEditRoleTitle(currentUser.roleTitle || '');
    setEditPronouns(currentUser.pronouns || '');
    setEditBio(currentUser.bio || '');
    setEditGear(currentUser.gearList?.join(', ') || '');
    setEditAvatarUrl(currentUser.avatarUrl || '');
    setEditQuietMode(currentUser.quietModeEnabled || false);
    setIsEditModalVisible(true);
  };

  const processAvatarUpload = async (source: 'camera' | 'library') => {
    try {
      const asset =
        source === 'camera'
          ? await takePhoto({ allowsEditing: true, aspect: [1, 1], quality: 0.85 })
          : await pickImage({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });

      if (!asset) return;

      const result = await uploadImage(asset, 'avatars', { upsert: true });
      if (result.publicUrl) {
        setEditAvatarUrl(result.publicUrl);
        const { error } = await updateProfile({ avatarUrl: result.publicUrl });
        if (error) {
          Alert.alert('Save Warning', `Avatar uploaded, but profile sync had an issue: ${error}`);
        } else {
          Alert.alert('Avatar Updated', 'Your profile portrait has been updated.');
        }
      } else if (result.error) {
        Alert.alert('Upload Error', result.error);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not upload portrait image');
    }
  };

  const handleAvatarAction = () => {
    const options: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [
      {
        text: 'Take Photo',
        onPress: () => processAvatarUpload('camera'),
      },
      {
        text: 'Choose from Library',
        onPress: () => processAvatarUpload('library'),
      },
    ];

    if (currentUser?.avatarUrl || editAvatarUrl) {
      options.push({
        text: 'Remove Photo',
        style: 'destructive',
        onPress: async () => {
          setEditAvatarUrl('');
          const { error } = await updateProfile({ avatarUrl: '' });
          if (error) {
            Alert.alert('Error', error);
          } else {
            Alert.alert('Photo Removed', 'Your avatar has been reset.');
          }
        },
      });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Profile Photo', 'Update your Atelier Frame portrait', options);
  };

  const handleSaveProfile = async () => {
    if (!editDisplayName.trim() || !editHandle.trim()) {
      Alert.alert('Missing Fields', 'Display name and handle are required.');
      return;
    }

    setSaving(true);
    const gearList = editGear
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const cleanHandle = editHandle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    const { error } = await updateProfile({
      displayName: editDisplayName.trim(),
      handle: cleanHandle,
      roleTitle: editRoleTitle.trim() || 'Visual Artist',
      pronouns: editPronouns.trim() || undefined,
      bio: editBio.trim(),
      gearList: gearList.length > 0 ? gearList : [],
      avatarUrl: editAvatarUrl || currentUser?.avatarUrl,
      quietModeEnabled: editQuietMode,
    });

    setSaving(false);

    if (error) {
      Alert.alert('Save Failed', error);
    } else {
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile setup saved successfully.');
    }
  };

  const handleToggleQuietMode = async () => {
    if (!currentUser) return;
    const nextVal = !currentUser.quietModeEnabled;
    await updateProfile({ quietModeEnabled: nextVal });
    Alert.alert(
      nextVal ? 'Quiet Mode Activated' : 'Standard Mode Activated',
      nextVal
        ? 'Metrics, counts, and high-stimulus alerts are minimized for pure creative focus.'
        : 'Standard interaction metrics and counters are displayed.'
    );
  };

  if (profileLoading || !currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.coral} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`@${currentUser.handle || 'creator'}`}
        rightActions={[
          {
            icon: 'settings',
            onPress: () => {
              router.push('/settings' as any);
            },
            ariaLabel: 'Settings',
          },
          {
            icon: 'share',
            onPress: () => {
              Alert.alert('Share Profile', `Share @${currentUser.handle}'s profile: https://frame.community/@${currentUser.handle}`);
            },
            ariaLabel: 'Share Profile',
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Overview Section */}
        <View style={styles.profileHeader}>
          <View style={styles.identityRow}>
            {/* 72px Circular Avatar with Camera Action */}
            <View style={styles.avatarWrapper}>
              {currentUser.avatarUrl ? (
                <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(currentUser.displayName || currentUser.handle || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {imageUploading && (
                <View style={styles.avatarUploadingOverlay}>
                  <ActivityIndicator size="small" color={colors.surface} />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.8}
                onPress={handleAvatarAction}
                disabled={imageUploading}
              >
                <Icon name="photo-camera" size={13} color={colors.surface} />
              </TouchableOpacity>
            </View>

            {/* Name & Title */}
            <View style={styles.nameColumn}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{currentUser.displayName || 'Creative Profile'}</Text>
                {currentUser.pronouns ? (
                  <Text style={styles.pronouns}>({currentUser.pronouns})</Text>
                ) : null}
              </View>
              <Text style={styles.roleTitle}>{currentUser.roleTitle || 'Visual Artist'}</Text>

              {/* Active Room Indicator */}
              {currentUser.activeRoom && (
                <View style={styles.activeRoomBadge}>
                  <View style={styles.coralDot} />
                  <Text style={styles.activeRoomText}>
                    Active in {currentUser.activeRoom.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>
            {currentUser.bio || 'Visual observer & creator on Frame. Tap "Edit Profile" to add your bio.'}
          </Text>

          {/* Gear Tag Cluster */}
          {currentUser.gearList && currentUser.gearList.length > 0 ? (
            <View style={styles.gearCluster}>
              <Icon name="camera" size={14} color={colors.secondary} />
              <Text style={styles.gearText}>
                {currentUser.gearList.join('  •  ')}
              </Text>
            </View>
          ) : null}

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricNumber}>{currentUser.stats?.challenges ?? 0}</Text>
              <Text style={styles.metricLabel}>Challenges</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricColumn}>
              <Text style={styles.metricNumber}>{currentUser.stats?.sharedStories ?? 0}</Text>
              <Text style={styles.metricLabel}>Shared Stories</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricColumn}>
              <Text style={styles.metricNumber}>{currentUser.stats?.processGuides ?? 0}</Text>
              <Text style={styles.metricLabel}>Process Guides</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={handleOpenEdit}
            >
              <Icon name="edit" size={16} color={colors.ink} />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, currentUser.quietModeEnabled && styles.actionButtonActive]}
              activeOpacity={0.8}
              onPress={handleToggleQuietMode}
            >
              <Icon
                name={currentUser.quietModeEnabled ? 'check-circle' : 'tune'}
                size={16}
                color={currentUser.quietModeEnabled ? colors.coral : colors.ink}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  currentUser.quietModeEnabled && { color: colors.coral, fontWeight: '700' },
                ]}
              >
                {currentUser.quietModeEnabled ? 'Quiet Mode On' : 'Quiet Preferences'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Rooms Strip */}
        <View style={styles.activeRoomsSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>Active Rooms</Text>
            <Text style={styles.sectionCount}>{sampleRooms.length} available</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomsScroll}>
            {sampleRooms.slice(0, 3).map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.roomChip}
                onPress={() => router.push(`/room/${r.id}`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: r.coverImageUrl }} style={styles.roomChipCover} />
                <Text style={styles.roomChipName} numberOfLines={1}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsSection}>
          {(['Grid', 'Process', 'Saved'] as ProfileTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Grid / Process / Saved Content */}
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon
                name={
                  activeTab === 'Process'
                    ? 'layers'
                    : activeTab === 'Saved'
                    ? 'bookmark'
                    : 'grid-view'
                }
                size={24}
                color={colors.secondary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'Process'
                ? 'No Process Guides Yet'
                : activeTab === 'Saved'
                ? 'No Saved Studies'
                : 'No Published Works'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'Process'
                ? 'Process guides document your lighting, exposures, step-by-step techniques, and craft notes.'
                : activeTab === 'Saved'
                ? 'Bookmark inspiring studies and challenges from the feed to curate your creative references.'
                : 'Share your visual process, darkroom tests, or culinary crafts with the Atelier community.'}
            </Text>
            {activeTab !== 'Saved' && (
              <TouchableOpacity
                style={styles.createCtaButton}
                onPress={() => router.push('/(tabs)/create')}
                activeOpacity={0.85}
              >
                <Icon name="add" size={16} color={colors.surface} />
                <Text style={styles.createCtaText}>Create Process Post</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.gridItem, { width: gridItemSize, height: gridItemSize * 1.25 }]}
                activeOpacity={0.85}
                onPress={() => router.push(`/process/${post.id}`)}
              >
                <Image source={{ uri: post.imageUrl }} style={styles.gridImage} resizeMode="cover" />
                {(post.processStagesCount ?? 0) > 0 && (
                  <View style={styles.gridProcessTag}>
                    <Icon name="layers" size={11} color={colors.surface} />
                    <Text style={styles.gridProcessText}>{post.processStagesCount ?? 0}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            style={styles.modalFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleSaveProfile} disabled={saving} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {saving ? (
                  <ActivityIndicator size="small" color={colors.coral} />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              {/* Avatar Picker in Modal */}
              <View style={styles.modalAvatarRow}>
                <View style={styles.avatarWrapper}>
                  {editAvatarUrl ? (
                    <Image source={{ uri: editAvatarUrl }} style={styles.avatarLarge} />
                  ) : (
                    <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitialLarge}>
                        {(editDisplayName || editHandle || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {imageUploading && (
                    <View style={styles.avatarUploadingOverlayLarge}>
                      <ActivityIndicator size="small" color={colors.surface} />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.cameraBadgeLarge}
                    onPress={handleAvatarAction}
                    disabled={imageUploading}
                  >
                    <Icon name="photo-camera" size={16} color={colors.surface} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalAvatarActions}>
                  <TouchableOpacity onPress={handleAvatarAction} disabled={imageUploading}>
                    <Text style={styles.changePhotoText}>
                      {imageUploading ? 'Uploading Portrait...' : 'Change Portrait'}
                    </Text>
                  </TouchableOpacity>
                  {Boolean(editAvatarUrl) && (
                    <TouchableOpacity
                      onPress={() => setEditAvatarUrl('')}
                      disabled={imageUploading}
                      style={{ marginTop: 4 }}
                    >
                      <Text style={styles.removePhotoText}>Remove photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Display Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editDisplayName}
                    onChangeText={setEditDisplayName}
                    placeholder="Elena Vance"
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Handle</Text>
                  <View style={styles.handleInputWrapper}>
                    <Text style={styles.handleSymbol}>@</Text>
                    <TextInput
                      style={styles.handleInput}
                      value={editHandle}
                      onChangeText={(t) => setEditHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="elena_v"
                      placeholderTextColor={colors.outline}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Artist Role / Specialty</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editRoleTitle}
                    onChangeText={setEditRoleTitle}
                    placeholder="e.g. Visual Artist & Light Observer"
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pronouns</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editPronouns}
                    onChangeText={setEditPronouns}
                    placeholder="e.g. she/her, they/them"
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Text style={styles.inputLabel}>Bio</Text>
                    <Text style={styles.charCountText}>{240 - editBio.length} left</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.bioInput]}
                    value={editBio}
                    onChangeText={(t) => {
                      if (t.length <= 240) setEditBio(t);
                    }}
                    placeholder="Tell your creative story and approach to craft..."
                    placeholderTextColor={colors.outline}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={240}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Camera & Gear Setup (comma-separated)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editGear}
                    onChangeText={setEditGear}
                    placeholder="Leica Q2 • 28mm, Fujifilm X-T5, 35mm f/1.4"
                    placeholderTextColor={colors.outline}
                  />
                  <View style={styles.gearSuggestionsRow}>
                    <Text style={styles.gearSuggestionLabel}>Suggestions:</Text>
                    {quickGearSuggestions.map((item) => {
                      const isSelected = editGear.toLowerCase().includes(item.toLowerCase());
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.gearChip,
                            isSelected && styles.gearChipSelected,
                          ]}
                          onPress={() => {
                            if (isSelected) {
                              const items = editGear
                                .split(',')
                                .map((g) => g.trim())
                                .filter((g) => g.toLowerCase() !== item.toLowerCase());
                              setEditGear(items.join(', '));
                            } else {
                              const trimmed = editGear.trim();
                              setEditGear(trimmed ? `${trimmed}, ${item}` : item);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.gearChipText,
                              isSelected && styles.gearChipTextSelected,
                            ]}
                          >
                            {isSelected ? `✓ ${item}` : `+ ${item}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Quiet Mode Switch */}
                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchTitle}>Quiet Mode</Text>
                    <Text style={styles.switchSubtitle}>
                      Minimize like metrics and follower counts for distraction-free craft.
                    </Text>
                  </View>
                  <Switch
                    value={editQuietMode}
                    onValueChange={setEditQuietMode}
                    trackColor={{ false: colors.hairline, true: colors.coral }}
                    thumbColor={colors.surface}
                  />
                </View>
              </View>

              {/* Bottom Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceContainerLow,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  avatarInitial: {
    ...typography.headlineMd,
    color: colors.coral,
    fontWeight: '700',
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceContainerLow,
  },
  avatarInitialLarge: {
    ...typography.headlineLg,
    color: colors.coral,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cameraBadgeLarge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  nameColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  displayName: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  pronouns: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  roleTitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    marginTop: 2,
  },
  activeRoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  coralDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  activeRoomText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  bioText: {
    ...typography.bodyMd,
    color: colors.ink,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  gearCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  gearText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    marginBottom: spacing.md,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    ...typography.headlineSm,
    color: colors.ink,
  },
  metricLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: colors.hairline,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonActive: {
    borderColor: colors.coral,
    backgroundColor: '#FFF5F4',
  },
  actionButtonText: {
    ...typography.labelMd,
    color: colors.ink,
    fontWeight: '600',
  },
  activeRoomsSection: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    ...typography.labelMd,
    color: colors.ink,
    fontWeight: '700',
  },
  sectionCount: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  roomsScroll: {
    paddingHorizontal: spacing.gutter,
    gap: 10,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    paddingRight: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  roomChipCover: {
    width: 32,
    height: 32,
  },
  roomChipName: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  tabsSection: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    marginTop: spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.ink,
  },
  tabButtonText: {
    ...typography.labelMd,
    color: colors.secondary,
  },
  tabButtonTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: 8,
  },
  gridItem: {
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridProcessTag: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(28, 27, 27, 0.82)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  gridProcessText: {
    ...typography.labelSm,
    color: colors.surface,
    fontSize: 10,
  },

  // Modal styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalFlex: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.ink,
    fontSize: 17,
  },
  modalCancelText: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  modalSaveText: {
    ...typography.bodyMd,
    color: colors.coral,
    fontWeight: '700',
  },
  modalScrollContent: {
    padding: spacing.gutter,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  modalAvatarRow: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing.md,
  },
  changePhotoText: {
    ...typography.labelMd,
    color: colors.coral,
    fontWeight: '600',
  },
  formSection: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...typography.labelSmBold,
    color: colors.ink,
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    height: 46,
    ...typography.bodyMd,
    color: colors.ink,
  },
  bioInput: {
    height: 90,
    paddingTop: 10,
    paddingBottom: 10,
  },
  handleInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  handleSymbol: {
    ...typography.bodyMd,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: 4,
  },
  handleInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
    paddingVertical: 0,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: 16,
  },
  switchTitle: {
    ...typography.labelMd,
    color: colors.ink,
    fontWeight: '600',
  },
  switchSubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: colors.coral,
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  avatarUploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUploadingOverlayLarge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarActions: {
    justifyContent: 'center',
    gap: 4,
  },
  removePhotoText: {
    ...typography.labelSm,
    color: colors.coral,
    fontWeight: '500',
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  charCountText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
  },
  gearSuggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  gearSuggestionLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
    marginRight: 2,
  },
  gearChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  gearChipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  gearChipText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
  },
  gearChipTextSelected: {
    color: colors.surface,
  },
  emptyContainer: {
    paddingVertical: 56,
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
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  createCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  createCtaText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
});
