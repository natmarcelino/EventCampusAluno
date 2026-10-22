
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

export function Badge({ label, variant = 'blue', style }) {
  const variants = {
    blue:   { bg: colors.primaryLight,  text: colors.primaryDark },
    green:  { bg: colors.mintLight,    text: colors.mintDark },
    amber:  { bg: colors.sunLight,    text: colors.sunDark },
    red:    { bg: colors.redLight,      text: colors.red },
    purple: { bg: colors.primaryLight,   text: colors.primary },
  };
  const v = variants[variant] || variants.blue;
  return (
    <View style={[{ backgroundColor: v.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full }, style]}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: v.text }}>{label}</Text>
    </View>
  );
}

export function Card({ children, onPress, style }) {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ label, onPress, variant = 'primary', icon, loading, style }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isPrimary ? styles.btnPrimary : styles.btnOutline,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} size="small" />
        : <Text style={[styles.btnText, !isPrimary && { color: colors.primary }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

export function SectionLabel({ children, style }) {
  return (
    <Text style={[styles.sectionLabel, style]}>{children}</Text>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

export function Avatar({ nome, size = 44, style }) {
  const initials = nome
    ? nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';
  return (
    <View style={[{
      width: size, height: size, borderRadius: size * 0.32,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    }, style]}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '600', color: '#fff' }}>
        {initials}
      </Text>
    </View>
  );
}

export function ProgressBar({ value, max, color = colors.primary, style }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <View style={[{ height: 8, backgroundColor: colors.gray100, borderRadius: radius.full, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: radius.full }} />
    </View>
  );
}

export function EmptyState({ icon, titulo, descricao }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>{icon}</Text>
      <Text style={[typography.h3, { textAlign: 'center', marginBottom: 6 }]}>{titulo}</Text>
      <Text style={[typography.caption, { textAlign: 'center', lineHeight: 18 }]}>{descricao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});