import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { theme } from '../../styles/theme';

interface SearchStepProps {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onPress: () => void;
  children: React.ReactNode;
  canContinue?: boolean;
  onNext: () => void;
  summary?: string;
}

export const SearchStep: React.FC<SearchStepProps> = ({
  title,
  isActive,
  isCompleted,
  onPress,
  children,
  canContinue = false,
  onNext,
  summary,
}) => {
  return (
    <View style={[styles.container, isActive && styles.containerActive]}>
      <TouchableOpacity
        style={styles.header}
        onPress={onPress}
        disabled={isActive}
      >
        <Text style={styles.title}>{title}</Text>
        {summary && (
          <Text style={styles.summary} numberOfLines={1}>
            {summary}
          </Text>
        )}
      </TouchableOpacity>
      {isActive && (
        <>
          <View style={styles.content}>
            {children}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                canContinue && styles.nextButtonEnabled
              ]}
              onPress={onNext}
              disabled={!canContinue}
            >
              <Text style={[
                styles.nextButtonText,
                canContinue && styles.nextButtonTextEnabled
              ]}>
                Suivant
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerActive: {
    // Supprimé flexShrink: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  completedText: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  content: {
    // Supprimé padding: theme.spacing.md,
    maxHeight: 400, // Ajout d'une hauteur maximale
    paddingHorizontal: theme.spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: theme.colors.gray[200],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
  },
  nextButtonEnabled: {
    backgroundColor: theme.colors.primary,
  },
  nextButtonText: {
    color: theme.colors.gray[500],
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextEnabled: {
    color: theme.colors.white,
  },
  summary: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: theme.spacing.md,
  },
}); 