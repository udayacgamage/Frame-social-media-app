import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, radii } from '@/theme/tokens';
import { Icon } from '../common/Icon';

export interface ProcessStageInput {
  id: string;
  title: string;
  tag: string;
  description: string;
  imageUri?: string;
  gearSetup?: string;
}

interface ProcessStageEditorProps {
  stages: ProcessStageInput[];
  onStagesChange: (stages: ProcessStageInput[]) => void;
  onPickStageImage: (stageId: string) => void;
}

const TAG_PRESETS = [
  'In-Camera',
  'RAW',
  'Lightroom',
  'Photoshop',
  'Film Scan',
  'Composition',
  'Color Grade',
  'Master',
];

export const ProcessStageEditor: React.FC<ProcessStageEditorProps> = ({
  stages,
  onStagesChange,
  onPickStageImage,
}) => {
  const addStage = () => {
    const newStage: ProcessStageInput = {
      id: `stage_${Date.now()}`,
      title: '',
      tag: TAG_PRESETS[Math.min(stages.length, TAG_PRESETS.length - 1)],
      description: '',
    };
    onStagesChange([...stages, newStage]);
  };

  const updateStage = (
    id: string,
    field: keyof ProcessStageInput,
    value: string
  ) => {
    onStagesChange(
      stages.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeStage = (id: string) => {
    onStagesChange(stages.filter((s) => s.id !== id));
  };

  const moveStage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= stages.length) return;
    const updated = [...stages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onStagesChange(updated);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Icon name="auto-awesome" size={18} color={colors.coral} />
          <View>
            <Text style={styles.sectionTitle}>Process Timeline</Text>
            <Text style={styles.sectionSubtitle}>
              Document each step of your creative journey
            </Text>
          </View>
        </View>
      </View>

      {/* Timeline Stages */}
      {stages.map((stage, idx) => (
        <View key={stage.id} style={styles.stageCard}>
          {/* Stage number + connector line */}
          <View style={styles.stageLeftStrip}>
            <View style={styles.stageNumberCircle}>
              <Text style={styles.stageNumber}>{idx + 1}</Text>
            </View>
            {idx < stages.length - 1 && <View style={styles.connectorLine} />}
          </View>

          {/* Stage Content */}
          <View style={styles.stageContent}>
            {/* Top row: title + actions */}
            <View style={styles.stageTopRow}>
              <TextInput
                style={styles.stageTitleInput}
                value={stage.title}
                onChangeText={(v) => updateStage(stage.id, 'title', v)}
                placeholder={`Step ${idx + 1} title...`}
                placeholderTextColor={colors.muted}
              />
              <View style={styles.stageActions}>
                {idx > 0 && (
                  <TouchableOpacity
                    onPress={() => moveStage(idx, idx - 1)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon
                      name="keyboard-arrow-up"
                      size={18}
                      color={colors.secondary}
                    />
                  </TouchableOpacity>
                )}
                {idx < stages.length - 1 && (
                  <TouchableOpacity
                    onPress={() => moveStage(idx, idx + 1)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon
                      name="keyboard-arrow-down"
                      size={18}
                      color={colors.secondary}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => removeStage(stage.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tag Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagScroll}
              contentContainerStyle={styles.tagScrollContent}
            >
              {TAG_PRESETS.map((tag) => {
                const active = stage.tag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, active && styles.tagChipActive]}
                    onPress={() => updateStage(stage.id, 'tag', tag)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        active && styles.tagChipTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Stage Image */}
            <TouchableOpacity
              style={styles.stageImageBtn}
              onPress={() => onPickStageImage(stage.id)}
              activeOpacity={0.8}
            >
              {stage.imageUri ? (
                <Image
                  source={{ uri: stage.imageUri }}
                  style={styles.stageImage}
                />
              ) : (
                <View style={styles.stageImagePlaceholder}>
                  <Icon name="add-photo-alternate" size={22} color={colors.secondary} />
                  <Text style={styles.stageImageText}>Add stage photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Description */}
            <TextInput
              style={styles.stageDescInput}
              value={stage.description}
              onChangeText={(v) => updateStage(stage.id, 'description', v)}
              placeholder="Describe what you did at this stage..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={2}
            />

            {/* Gear setup (optional) */}
            <TextInput
              style={styles.gearInput}
              value={stage.gearSetup || ''}
              onChangeText={(v) => updateStage(stage.id, 'gearSetup', v)}
              placeholder="Gear / settings used (optional)"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>
      ))}

      {/* Add Stage Button */}
      <TouchableOpacity
        style={styles.addStageBtn}
        onPress={addStage}
        activeOpacity={0.7}
      >
        <View style={styles.addStageDot}>
          <Icon name="add" size={16} color={colors.coral} />
        </View>
        <Text style={styles.addStageText}>
          {stages.length === 0
            ? 'Start your process timeline'
            : 'Add another step'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    ...typography.bodyMdMedium,
    color: colors.ink,
  },
  sectionSubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
    marginTop: 1,
  },
  stageCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stageLeftStrip: {
    width: 28,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stageNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageNumber: {
    ...typography.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
  connectorLine: {
    flex: 1,
    width: 1,
    backgroundColor: colors.hairline,
    marginTop: 4,
  },
  stageContent: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  stageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stageTitleInput: {
    ...typography.bodyMdMedium,
    color: colors.ink,
    flex: 1,
    paddingVertical: 0,
    marginRight: spacing.sm,
  },
  stageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagScroll: {
    marginBottom: 8,
    marginHorizontal: -2,
  },
  tagScrollContent: {
    gap: 4,
    paddingHorizontal: 2,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  tagChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  tagChipText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 10,
  },
  tagChipTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  stageImageBtn: {
    width: '100%',
    height: 140,
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginBottom: 8,
  },
  stageImage: {
    width: '100%',
    height: '100%',
  },
  stageImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderStyle: 'dashed',
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stageImageText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  stageDescInput: {
    ...typography.bodyMd,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    minHeight: 44,
    textAlignVertical: 'top',
    marginBottom: 6,
  },
  gearInput: {
    ...typography.labelSm,
    color: colors.ink,
    fontStyle: 'italic',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  addStageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  addStageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.coral,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStageText: {
    ...typography.labelMd,
    color: colors.coral,
    fontWeight: '600',
  },
});
