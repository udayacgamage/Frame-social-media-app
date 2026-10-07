import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/common/Icon';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isMockMode } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !handle.trim() || !displayName.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), password, {
      handle: handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      displayName: displayName.trim(),
    });
    setLoading(false);

    if (result.error) {
      Alert.alert('Sign up failed', result.error);
    } else if (result.needsEmailConfirmation) {
      Alert.alert(
        'Check your email',
        'We sent a confirmation link to your email. Please verify to continue.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Join Frame</Text>
            <Text style={styles.subtitle}>
              Create your creative profile and start sharing your process.
            </Text>
          </View>

          {/* Mock Mode Banner */}
          {isMockMode && (
            <View style={styles.mockBanner}>
              <Icon name="info-outline" size={16} color={colors.coral} />
              <Text style={styles.mockBannerText}>
                Demo mode — account won't persist
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display name</Text>
              <View style={styles.inputWrapper}>
                <Icon name="person-outline" size={20} color={colors.secondary} />
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Elena Vance"
                  placeholderTextColor={colors.outline}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Handle</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.handlePrefix}>@</Text>
                <TextInput
                  style={styles.input}
                  value={handle}
                  onChangeText={(t) => setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="elena_v"
                  placeholderTextColor={colors.outline}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Icon name="mail-outline" size={20} color={colors.secondary} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Icon name="lock-outline" size={20} color={colors.secondary} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Create account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.gutter + 8,
    paddingTop: spacing.md,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    ...typography.headlineLg,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.secondary,
    lineHeight: 24,
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5F4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE0DC',
  },
  mockBannerText: {
    ...typography.labelSm,
    color: colors.coral,
    flex: 1,
  },
  form: {
    gap: spacing.md,
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
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  handlePrefix: {
    ...typography.bodyMd,
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
    paddingVertical: 0,
  },
  signUpButton: {
    backgroundColor: colors.coral,
    height: 50,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    ...typography.labelMd,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  footerLink: {
    ...typography.bodyMd,
    color: colors.coral,
    fontWeight: '600',
  },
});
