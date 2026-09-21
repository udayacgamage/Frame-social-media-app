import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/theme/tokens';
import { Icon, IconName } from './Icon';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: {
    icon: IconName;
    onPress: () => void;
    hasBadge?: boolean;
    badgeColor?: string;
    ariaLabel?: string;
  }[];
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Frame',
  showBack = false,
  onBack,
  rightActions = [],
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightRow}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.iconButton}
            onPress={action.onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name={action.icon} size={22} color={colors.secondary} />
            {action.hasBadge && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: action.badgeColor || colors.coral },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    zIndex: 40,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineSm,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.xs,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
