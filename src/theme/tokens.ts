export const colors = {
  // Canvas & Surfaces
  surface: '#ffffff',
  surfaceDim: '#f8f8f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0edec',
  surfaceContainerHigh: '#ebe7e7',
  surfaceContainerHighest: '#e5e2e1',
  surfaceVariant: '#e5e2e1',

  // Hairline & Borders
  hairline: '#eaeaea',
  outline: '#8e706b',
  outlineVariant: '#e3beb8',

  // Ink & Typography
  ink: '#111111',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#5a403c',
  secondary: '#666666',
  muted: '#999999',

  // Brand Accent (Venetian Coral)
  coral: '#e64b38',
  coralContainer: '#d43e2d',
  primary: '#b12417',
  primaryContainer: '#d43e2d',
  onPrimary: '#ffffff',
  primaryFixed: '#ffdad4',
  primaryFixedDim: '#ffb4a8',

  // Inverse & Secondary Accents
  inverseSurface: '#313030',
  inverseOnSurface: '#f3f0ef',
  tertiary: '#006577',
  tertiaryContainer: '#008096',
  onTertiaryContainer: '#f9fdff',

  // State colors
  error: '#ba1a1a',
  success: '#2e7d32',
} as const;

export const typography = {
  headlineLg: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.48, // -0.02em
  },
  headlineMd: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: -0.3, // -0.015em
  },
  headlineSm: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.17, // -0.01em
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: -0.08,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodyMdMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelMd: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    letterSpacing: 0.13,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.12,
  },
  labelSmBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.24,
  },
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  gutter: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;
