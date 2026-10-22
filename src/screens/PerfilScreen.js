// src/screens/PerfilScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api';
import { Avatar, Card, SectionLabel, Divider } from '../components';
import { colors, spacing, typography, radius } from '../styles/theme';

export default function PerfilScreen() {
  const { usuario: usuarioLogin, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function carregar() {
    try {
      setPerfil(await getMe());
    } catch (e) {
      console.log('Erro perfil:', e);
    } finally {
      setRefreshing(false);
    }
  }

  // recarrega sempre que a aba Perfil é aberta (horas atualizadas)
  useFocusEffect(useCallback(() => { carregar(); }, []));

  const usuario = { ...(usuarioLogin || {}), ...(perfil || {}) };
  const horasCompletas = usuario.horasCompletas || 0;
  const horasTotal = usuario.horasTotal || 300;
  const horasPorcentagem = Math.min(100, Math.round((horasCompletas / horasTotal) * 100));

  function handleSair() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => logout() },
      ]
    );
  }

  const infoItems = [
    { icon: 'mail-outline', label: 'E-mail', value: usuario.email || '—' },
    { icon: 'card-outline', label: 'Matrícula', value: usuario.matricula || '—' },
    { icon: 'school-outline', label: 'Curso', value: usuario.curso || '—' },
    { icon: 'calendar-outline', label: 'Horas em eventos', value: `${usuario.horasEventos ?? 0}h` },
    { icon: 'ribbon-outline', label: 'Horas de certificados externos', value: `${usuario.horasExternas ?? 0}h` },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={colors.primary} />}
      >


        <View style={styles.header}>
          <View style={styles.blobTop} />
          <Avatar nome={usuario.nome || 'Aluno'} size={84} style={styles.avatarBig} />
          <Text style={styles.nome}>{usuario.nome}</Text>
          <Text style={styles.curso}>{usuario.curso}</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{horasCompletas}h</Text>
              <Text style={styles.statLabel}>de {horasTotal}h</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{horasPorcentagem}%</Text>
              <Text style={styles.statLabel}>Da meta</Text>
            </View>
          </View>
        </View>


        <SectionLabel>Dados pessoais</SectionLabel>
        <Card>
          {infoItems.map((item, i) => (
            <View key={item.label}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
              {i < infoItems.length - 1 && <Divider style={{ marginVertical: 4 }} />}
            </View>
          ))}
        </Card>

  
        <TouchableOpacity style={styles.sairBtn} onPress={handleSair} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={colors.red} />
          <Text style={styles.sairText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  header: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    paddingVertical: 28,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute', top: -34, right: -28,
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,200,89,0.30)',
  },
  avatarBig: { marginBottom: 14 },
  nome: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 3 },
  curso: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 24 },
  statNum: { fontSize: 19, fontWeight: '600', color: colors.primaryDark },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 3 },
  statDivider: { width: 0.5, height: 32, backgroundColor: colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  infoIcon: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11.5, color: colors.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  sairBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.redLight,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: spacing.lg,
  },
  sairText: { fontSize: 14, fontWeight: '600', color: colors.red },
});