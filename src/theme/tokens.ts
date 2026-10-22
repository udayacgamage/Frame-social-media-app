export const colorsLight = {
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

export const colorsDark = {
  // Canvas & Surfaces (Warm Atelier Onyx)
  surface: '#141414',
  surfaceDim: '#101010',
  surfaceContainerLowest: '#0d0d0d',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#232221',
  surfaceContainerHigh: '#2b2a29',
  surfaceContainerHighest: '#363433',
  surfaceVariant: '#363433',

  // Hairline & Borders
  hairline: '#2c2a29',
  outline: '#9d8783',
  outlineVariant: '#4d3a37',

  // Ink & Typography
  ink: '#f5f2f1',
  onSurface: '#f0eceb',
  onSurfaceVariant: '#d6c6c3',
  secondary: '#a39e9d',
  muted: '#736f6e',

  // Brand Accent (Vibrant Coral)
  coral: '#ff624d',
  coralContainer: '#d43e2d',
  primary: '#ff7360',
  primaryContainer: '#871a10',
  onPrimary: '#ffffff',
  primaryFixed: '#ffdad4',
  primaryFixedDim: '#ffb4a8',

  // Inverse & Secondary Accents
  inverseSurface: '#f3f0ef',
  inverseOnSurface: '#1c1b1b',
  tertiary: '#40c8e0',
  tertiaryContainer: '#004f5e',
  onTertiaryContainer: '#bfeaff',

  // State colors
  error: '#ffb4ab',
  success: '#4caf50',
} as const;

export type ColorTheme = Record<keyof typeof colorsLight, string>;
export const colors = colorsLight;

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
