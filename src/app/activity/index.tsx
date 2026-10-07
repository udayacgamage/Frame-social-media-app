import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { useActivity } from '@/hooks/useActivity';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sampleActivities, sampleMessages } from '@/data/mockData';

type ActivityTab = 'Activity' | 'Messages';

export default function ActivityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActivityTab>('Activity');
  const [invitationAccepted, setInvitationAccepted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { activity, messages, unreadCount, markAsRead, markAllRead } = useActivity();
  const { sendLocalTestNotification, expoPushToken } = usePushNotifications();
  const displayActivities = activity.length > 0 ? activity : sampleActivities;
  const displayMessages = messages.length > 0 ? messages : sampleMessages;
  const unreadMessagesCount = displayMessages.reduce((acc, m) => acc + (m.unreadCount || 0), 0);

  const filteredActivities = displayActivities.filter((act) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      act.user.name.toLowerCase().includes(q) ||
      act.user.handle.toLowerCase().includes(q) ||
      act.message.toLowerCase().includes(q) ||
      act.targetTitle?.toLowerCase().includes(q)
    );
  });

  const filteredMessages = displayMessages.filter((msg) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      msg.user.name.toLowerCase().includes(q) ||
      msg.user.handle.toLowerCase().includes(q) ||
      msg.lastMessage.toLowerCase().includes(q)
    );
  });

  const handleAcceptInvite = () => {
    setInvitationAccepted(true);
    Alert.alert(
      'Invitation Accepted',
      'You are now a collaborator on "A Weekend in Ella". You can contribute photos and technique notes.',
      [
        {
          text: 'Open Story',
          onPress: () => router.push('/story/story_ella'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Activity"
        showBack
        rightActions={[
          {
            icon: isSearchVisible ? 'close' : 'search',
            onPress: () => {
              setIsSearchVisible((prev) => !prev);
              if (isSearchVisible) setSearchQuery('');
            },
            ariaLabel: isSearchVisible ? 'Close search' : 'Search activities',
          },
          {
            icon: 'more-horiz',
            onPress: () => {
              Alert.alert(
                'Activity & Notifications',
                `Push Status: ${expoPushToken ? 'Connected' : 'Local Only'}\nManage creative alerts, collaborative invites, and quiet mode.`,
                [
                  {
                    text: 'Send Test Notification',
                    onPress: async () => {
                      await sendLocalTestNotification(
                        'Atelier Frame',
                        'New collaboration invite on "A Weekend in Ella" from Chloe Lens',
                        { storyId: 'story_ella' }
                      );
                      Alert.alert('Notification Dispatched', 'A preview notification has been presented.');
                    },
                  },
                  {
                    text: 'Dismiss All Unread',
                    onPress: markAllRead,
                  },
                  { text: 'Close', style: 'cancel' },
                ]
              );
            },
            ariaLabel: 'Activity settings',
          },
        ]}
      />

      {/* Expandable Search Input */}
      {isSearchVisible && (
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color={colors.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab.toLowerCase()} by name, handle, keyword...`}
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={16} color={colors.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Segmented Control Tabs (Activity vs Messages) */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Activity' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Activity')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'Activity' && styles.tabButtonTextActive,
              ]}
            >
              Activity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Messages' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Messages')}
            activeOpacity={0.8}
          >
            <View style={styles.messageTabCluster}>
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'Messages' && styles.tabButtonTextActive,
                ]}
              >
                Messages
              </Text>
              {unreadMessagesCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadMessagesCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Status Indicator */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.statusRow}>
            <Text style={styles.statusCount}>
              Showing{' '}
              {activeTab === 'Activity'
                ? filteredActivities.length
                : filteredMessages.length}{' '}
              {activeTab === 'Activity' ? 'activities' : 'conversations'} for "{searchQuery}"
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.resetFilterText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'Activity' ? (
          <>
            {/* Priority Section: Shared Story Invitation Card (hidden during active search) */}
            {!invitationAccepted && !searchQuery.trim() && (
              <View style={styles.inviteCard}>
                <View style={styles.inviteHeader}>
                  <View style={styles.inviteAuthorRow}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={{
                          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtFr2F16t8bmDA9IeR9gQFk2DQexgKYgMZUQ9e4U3wR7zPy9px_CKKHKUAQ9XIVYldFHt0-TXIyNIxH37ArgJWwNSjJG9jK_xFUliNXqxtyHtOKKQyLuITA2_CES8ViAByJqdLrN6g6UxfgtpS8uE52IP4_5z7i4Q1OqgheILHadBLsBtY53-RKUYAakcq8QYfLgQYR5sdomBsYe7Tc_zSRXKdkBEviIfKMO2XOb8eC4Jik2kE8gzeWSWWOEksbPq5dhKv9YXOCA',
                        }}
                        style={styles.inviteAvatar}
                      />
                      <View style={styles.onlineDot} />
                    </View>

                    <View style={styles.inviteMeta}>
                      <Text style={styles.inviteAuthorName}>Chloe Lens</Text>
                      <Text style={styles.inviteActionLabel}>
                        Invited you to collaborate
                      </Text>
                    </View>
                  </View>

                  <View style={styles.forkBadge}>
                    <Text style={styles.forkBadgeText}>Fork v2.4</Text>
                  </View>
                </View>

                {/* Prompt Details */}
                <Text style={styles.invitePromptTitle}>‘A Weekend in Ella’</Text>
                <Text style={styles.invitePromptDesc}>
                  Documenting high-contrast tea plantation dawn light and tactile clay artisan pottery in Ella, Sri Lanka.
                </Text>

                {/* Action Buttons */}
                <View style={styles.inviteActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={handleAcceptInvite}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.acceptButtonText}>Accept & Contribute</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => setInvitationAccepted(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* General Activity Stream */}
            {filteredActivities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="search" size={22} color={colors.secondary} />
                </View>
                <Text style={styles.emptyTitle}>No activities found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.trim()
                    ? `No activity matching "${searchQuery}". Try a different search term.`
                    : 'No recent activity yet.'}
                </Text>
                {searchQuery.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => setSearchQuery('')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resetButtonText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.activityList}>
                {filteredActivities.map((act) => (
                  <TouchableOpacity
                    key={act.id}
                    style={styles.activityItem}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (act.unread) markAsRead(act.id);
                    }}
                  >
                    <Image source={{ uri: act.user.avatarUrl }} style={styles.actAvatar} />
                    <View style={styles.actContent}>
                      <Text style={styles.actText}>
                        <Text style={styles.actAuthor}>{act.user.name} </Text>
                        {act.message}
                      </Text>
                      <Text style={styles.actTime}>{act.timeAgo}</Text>
                    </View>
                    {act.unread && <View style={styles.actUnreadDot} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          /* Messages Stream */
          filteredMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="chat" size={22} color={colors.secondary} />
              </View>
              <Text style={styles.emptyTitle}>No conversations found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? `No message thread matching "${searchQuery}".`
                  : 'No direct messages yet. Start a conversation from any profile or room.'}
              </Text>
              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.messagesList}>
              {filteredMessages.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  style={styles.messageItem}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/chat/[id]' as any,
                      params: { id: msg.id },
                    })
                  }
                >
                  <View style={styles.msgAvatarWrapper}>
                    <Image source={{ uri: msg.user.avatarUrl }} style={styles.msgAvatar} />
                    {msg.online && <View style={styles.msgOnlineDot} />}
                  </View>

                  <View style={styles.msgContent}>
                    <View style={styles.msgHeaderRow}>
                      <Text style={styles.msgAuthor}>{msg.user.name}</Text>
                      <Text style={styles.msgTime}>{msg.timeAgo}</Text>
                    </View>
                    <Text style={styles.msgSnippet} numberOfLines={1}>
                      {msg.lastMessage}
                    </Text>
                  </View>

                  {msg.unreadCount > 0 && (
                    <View style={styles.msgUnreadBadge}>
                      <Text style={styles.msgUnreadText}>{msg.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  tabContainer: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    padding: 3,
    borderRadius: radii.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md - 2,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    ...typography.labelMd,
    color: colors.secondary,
  },
  tabButtonTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  messageTabCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadBadge: {
    backgroundColor: colors.coral,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  inviteCard: {
    margin: spacing.gutter,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inviteAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
  },
  inviteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.tertiaryContainer,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  inviteMeta: {
    justifyContent: 'center',
  },
  inviteAuthorName: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  inviteActionLabel: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  forkBadge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  forkBadgeText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
  },
  invitePromptTitle: {
    ...typography.headlineSm,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  invitePromptDesc: {
    ...typography.bodyMd,
    color: colors.secondary,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
    height: 36,
    backgroundColor: colors.coral,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '600',
  },
  declineButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    ...typography.labelMd,
    color: colors.ink,
  },
  activityList: {
    paddingHorizontal: spacing.gutter,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  actAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  actContent: {
    flex: 1,
  },
  actText: {
    ...typography.bodyMd,
    color: colors.ink,
    lineHeight: 19,
  },
  actAuthor: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  actTime: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 2,
  },
  actUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  messagesList: {
    paddingHorizontal: spacing.gutter,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  msgAvatarWrapper: {
    position: 'relative',
  },
  msgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  msgOnlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d32',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  msgContent: {
    flex: 1,
  },
  msgHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  msgAuthor: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  msgTime: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  msgSnippet: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  msgUnreadBadge: {
    backgroundColor: colors.coral,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgUnreadText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
  },
  clearBtn: {
    padding: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingBottom: 2,
  },
  statusCount: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  resetFilterText: {
    ...typography.labelSm,
    color: colors.coral,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.bodyMdMedium,
    color: colors.ink,
    fontSize: 15,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  resetButtonText: {
    ...typography.labelMd,
    color: colors.ink,
    fontWeight: '500',
  },
});
