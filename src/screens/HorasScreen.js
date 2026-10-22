// src/screens/HorasScreen.js
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getMe, getMinhasInscricoes } from '../services/api';
import { colors, spacing, typography, radius } from '../styles/theme';
import { formatarData } from '../utils/formatar';

function ProgressBar({ value, max, color, style }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <View style={[{ height: 8, backgroundColor: colors.gray100, borderRadius: radius.full, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color || colors.primary, borderRadius: radius.full }} />
    </View>
  );
}

export default function HorasScreen() {
  const [perfil, setPerfil] = useState(null);
  const [inscricoes, setInscricoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function carregar() {
    try {
      const [me, insc] = await Promise.all([getMe(), getMinhasInscricoes()]);
      setPerfil(me);
      setInscricoes(Array.isArray(insc) ? insc : []);
    } catch (e) {
      console.log('Erro horas:', e);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { carregar(); }, []));

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const horasCompletas = perfil?.horasCompletas || 0;
  const horasTotal = perfil?.horasTotal || 300;
  const pct = Math.min(100, Math.round((horasCompletas / horasTotal) * 100));
  const r = 50;
  const circ = 2 * Math.PI * r;
  const filled = circ * (pct / 100);

  const historico = inscricoes.filter(i => i.presencaConfirmada);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={colors.primary} />}
      >
        {/* Card principal */}
        <View style={styles.mainCard}>
          <View style={styles.blobTop} />
          <View style={styles.blobBottom} />
          <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={120} height={120}>
              <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={colors.sun} />
                  <Stop offset="100%" stopColor={colors.peach} />
                </LinearGradient>
              </Defs>
              <Circle cx={60} cy={60} r={r} stroke="rgba(139,127,217,0.15)" strokeWidth={12} fill="none" />
              <Circle cx={60} cy={60} r={r} stroke="url(#grad)" strokeWidth={12} fill="none"
                strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
                rotation="-90" originX={60} originY={60} />
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '600', color: colors.primaryDark }}>{horasCompletas}h</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>de {horasTotal}h</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>{pct}% concluído</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{horasCompletas >= horasTotal ? 'Você completou as horas exigidas!' : `Faltam ${horasTotal - horasCompletas}h para concluir`}</Text>
            {pct >= 100 && (
              <View style={{ backgroundColor: colors.mintLight, borderRadius: radius.md, padding: 8, marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: colors.mintDark, fontWeight: '500' }}>🎉 Meta atingida!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Progresso por categoria */}
        <Text style={styles.sectionLabel}>Progresso por categoria</Text>
        {[
          { label: 'Eventos do EventCampus', horas: perfil?.horasEventos ?? historico.reduce((s, i) => s + (i.cargaHoraria || 0), 0), cor: colors.primary },
          { label: 'Certificados externos aprovados', horas: perfil?.horasExternas ?? 0, cor: colors.mintDark },
        ].map((cat, i) => (
          <View key={i} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>{cat.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{cat.horas}h</Text>
            </View>
            <ProgressBar value={cat.horas} max={horasTotal} color={cat.cor} />
          </View>
        ))}

        {/* Histórico */}
        <Text style={styles.sectionLabel}>Histórico de atividades</Text>
        {historico.length === 0 ? (
          <View style={styles.empty}>
            <Text style={typography.caption}>Confirme presença em eventos para ver o histórico.</Text>
          </View>
        ) : historico.map((i, idx) => (
          <View key={idx} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }} numberOfLines={1}>{i.titulo}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {formatarData(i.data)}
                </Text>
              </View>
              <View style={{ backgroundColor: colors.mintLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.mintDark }}>+{i.cargaHoraria}h</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  mainCard: { backgroundColor: colors.primaryLight, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 18, overflow: 'hidden', marginBottom: spacing.lg },
  blobTop: { position: 'absolute', top: -30, right: -24, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,200,89,0.35)' },
  blobBottom: { position: 'absolute', bottom: -46, left: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,155,123,0.18)' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  empty: { padding: 20, alignItems: 'center' },
});