import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon, IconName } from '@/components/common/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingRowProps {
  icon: IconName;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  rightElement?: React.ReactNode;
}

function SettingRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  isDestructive,
  rightElement,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View
        style={[
          styles.settingIcon,
          isDestructive && { backgroundColor: '#FFF0EF' },
        ]}
      >
        <Icon
          name={icon}
          size={20}
          color={isDestructive ? colors.error : colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingLabel,
            isDestructive && { color: colors.error },
          ]}
        >
          {label}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        <>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {onPress && (
            <Icon name="chevron-right" size={20} color={colors.muted} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, isMockMode } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [likesNotif, setLikesNotif] = useState(true);
  const [commentsNotif, setCommentsNotif] = useState(true);
  const [mentionsNotif, setMentionsNotif] = useState(true);
  const [dmNotif, setDmNotif] = useState(true);
  const [challengeNotif, setChallengeNotif] = useState(true);
  const { themeMode, setThemeMode, isDark } = useTheme();

  const handleSelectTheme = () => {
    Alert.alert(
      'Appearance',
      'Choose your preferred visual theme for Atelier Frame.',
      [
        {
          text: `System Default${themeMode === 'system' ? ' ✓' : ''}`,
          onPress: () => setThemeMode('system'),
        },
        {
          text: `Dark Mode (Atelier Onyx)${themeMode === 'dark' ? ' ✓' : ''}`,
          onPress: () => setThemeMode('dark'),
        },
        {
          text: `Light Mode (Warm Canvas)${themeMode === 'light' ? ' ✓' : ''}`,
          onPress: () => setThemeMode('light'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, posts, and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Not Available',
              'Account deletion requires contacting support in this version.'
            );
          },
        },
      ]
    );
  };

  const handleToggleQuietMode = async (value: boolean) => {
    await updateProfile({ quietModeEnabled: value });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Settings" showBack />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Summary */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.profileAvatar} />
          ) : (
            <View style={[styles.profileAvatar, styles.profileAvatarEmpty]}>
              <Icon name="person" size={24} color={colors.muted} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.displayName || 'Creator'}</Text>
            <Text style={styles.profileHandle}>@{profile?.handle || 'handle'}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.muted} />
        </TouchableOpacity>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingRow
            icon="mail-outline"
            label="Email"
            value={isMockMode ? 'demo@frame.app' : user?.email || '—'}
          />
          <SettingRow
            icon="lock-outline"
            label="Change Password"
            onPress={() =>
              Alert.alert(
                'Change Password',
                'A password reset link will be sent to your email.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Send Link', onPress: () => {} },
                ]
              )
            }
          />
          <SettingRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push('/(tabs)/profile')}
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingRow
            icon="notifications-none"
            label="Push Notifications"
            subtitle="Enable or disable all push notifications"
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
                thumbColor={colors.surface}
              />
            }
          />
          {pushEnabled && (
            <>
              <SettingRow
                icon="favorite-border"
                label="Likes"
                rightElement={
                  <Switch
                    value={likesNotif}
                    onValueChange={setLikesNotif}
                    trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
                    thumbColor={colors.surface}
                  />
                }
              />
              <SettingRow
                icon="chat-bubble-outline"
                label="Comments"
                rightElement={
                  <Switch
                    value={commentsNotif}
                    onValueChange={setCommentsNotif}
                    trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
                    thumbColor={colors.surface}
                  />
                }
              />
              <SettingRow
                icon="alternate-email"
                label="Mentions"
                rightElement={
                  <Switch
                    value={mentionsNotif}
                    onValueChange={setMentionsNotif}
                    trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
                    thumbColor={colors.surface}
                  />
                }
              />
              <SettingRow
                icon="send"
                label="Direct Messages"
                rightElement={
                  <Switch
                    value={dmNotif}
                    onValueChange={setDmNotif}
                    trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
                    thumbColor={colors.surface}
                  />
                }
              />
              <SettingRow
                icon="emoji-events"
                label="Challenges"
                rightElement={
                  <Switch
                    value={challengeNotif}
                    onValueChange={setChallengeNotif}
                    trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
                    thumbColor={colors.surface}
                  />
                }
              />
            </>
          )}
        </View>

        {/* Privacy Section */}
        <SectionHeader title="Privacy" />
        <View style={styles.section}>
          <SettingRow
            icon="visibility-off"
            label="Quiet Mode"
            subtitle="Hide public like and impression metrics on your posts"
            rightElement={
              <Switch
                value={profile?.quietModeEnabled || false}
                onValueChange={handleToggleQuietMode}
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.coral }}
                thumbColor={colors.surface}
              />
            }
          />
          <SettingRow
            icon="block"
            label="Blocked Users"
            value="0"
            onPress={() =>
              Alert.alert('Blocked Users', 'You have not blocked anyone yet.')
            }
          />
        </View>

        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <View style={styles.section}>
          <SettingRow
            icon="palette"
            label="Theme"
            value={
              themeMode === 'system'
                ? `System (${isDark ? 'Dark' : 'Light'})`
                : themeMode === 'dark'
                ? 'Dark'
                : 'Light'
            }
            onPress={handleSelectTheme}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingRow icon="info-outline" label="About Frame" value="v1.0.0" />
          <SettingRow
            icon="description"
            label="Terms of Service"
            onPress={() => {}}
          />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <SettingRow
            icon="code"
            label="Open Source Licenses"
            onPress={() => {}}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="" />
        <View style={styles.section}>
          <SettingRow
            icon="logout"
            label="Sign Out"
            onPress={handleSignOut}
          />
          <SettingRow
            icon="delete-forever"
            label="Delete Account"
            isDestructive
            onPress={handleDeleteAccount}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Frame — Your creative world</Text>
          <Text style={styles.footerVersion}>
            {isMockMode ? 'Demo Mode' : `Signed in as ${user?.email}`}
          </Text>
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
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.gutter,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.gutter,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    gap: spacing.md,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  profileAvatarEmpty: {
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
    fontSize: 15,
  },
  profileHandle: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 1,
  },

  // Sections
  sectionHeader: {
    ...typography.labelSmBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.gutter,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  section: {
    marginHorizontal: spacing.gutter,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  settingSubtitle: {
    ...typography.labelSm,
    color: colors.muted,
    marginTop: 2,
  },
  settingValue: {
    ...typography.labelMd,
    color: colors.muted,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: 4,
  },
  footerText: {
    ...typography.labelSm,
    color: colors.muted,
  },
  footerVersion: {
    ...typography.labelSm,
    color: colors.muted,
    fontSize: 11,
  },
});
