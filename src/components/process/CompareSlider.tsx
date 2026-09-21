import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { colors, typography, radii } from '@/theme/tokens';
import { Icon } from '../common/Icon';

interface CompareSliderProps {
  rawImageUrl: string;
  finalImageUrl: string;
  height?: number;
  rawLabel?: string;
  finalLabel?: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  rawImageUrl,
  finalImageUrl,
  height = 420,
  rawLabel = 'RAW',
  finalLabel = 'FINAL EDIT',
}) => {
  const [containerWidth, setContainerWidth] = useState(360);
  const [sliderPosition, setSliderPosition] = useState(0.5); // 0.0 to 1.0
  const containerWidthRef = useRef(360);
  containerWidthRef.current = containerWidth;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const width = containerWidthRef.current;
        if (width > 0) {
          const newPos = Math.max(0.05, Math.min(0.95, gestureState.moveX / width));
          setSliderPosition(newPos);
        }
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  const clipWidth = containerWidth * sliderPosition;

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      {/* Background: Final Edit Image (Right / Underneath) */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={{ uri: finalImageUrl }}
          style={styles.fullImage}
          resizeMode="cover"
        />
        <View style={[styles.badge, styles.finalBadge]}>
          <Text style={styles.badgeText}>{finalLabel}</Text>
        </View>
      </View>

      {/* Foreground: RAW Unedited Image (Left / Clipped Overlay) */}
      <View style={[styles.overlayWrapper, { width: clipWidth }]}>
        <View style={{ width: containerWidth, height }}>
          <Image
            source={{ uri: rawImageUrl }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        </View>
        <View style={[styles.badge, styles.rawBadge]}>
          <Text style={[styles.badgeText, styles.rawBadgeText]}>{rawLabel}</Text>
        </View>
      </View>

      {/* Vertical Divider Line */}
      <View style={[styles.dividerLine, { left: clipWidth }]}>
        <View style={styles.handleCircle}>
          <Icon name="compare-arrows" size={18} color={colors.ink} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none' as any,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ffffff',
    marginLeft: -1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  handleCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
    zIndex: 10,
  },
  finalBadge: {
    right: 12,
    backgroundColor: 'rgba(28, 27, 27, 0.85)',
  },
  rawBadge: {
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  badgeText: {
    ...typography.labelSmBold,
    color: '#ffffff',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  rawBadgeText: {
    color: colors.ink,
  },
});
