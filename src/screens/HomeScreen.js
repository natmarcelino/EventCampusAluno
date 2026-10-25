// src/screens/HomeScreen.js
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getEventos, getMe } from '../services/api';
import { colors, spacing, typography, radius } from '../styles/theme';
import { formatarData } from '../utils/formatar';

export default function HomeScreen() {
  const { usuario } = useAuth();
  const navigation = useNavigation();
  const [eventos, setEventos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // recarrega ao voltar para a tela (ex: depois de confirmar presença)
  useFocusEffect(useCallback(() => {
    async function carregar() {
      try {
        const [ev, me] = await Promise.all([getEventos(), getMe()]);
        setEventos(Array.isArray(ev) ? ev : []);
        setPerfil(me);
      } catch (e) {
        console.log('Erro ao carregar home:', e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []));

  const nome = usuario?.nome || perfil?.nome || 'Aluno';
  const horasCompletas = perfil?.horasCompletas || 0;
  const horasTotal = perfil?.horasTotal || 300;
  const pct = Math.min(100, Math.round((horasCompletas / horasTotal) * 100));
  const proximosEventos = eventos.filter(e => e.status === 'ATIVO').slice(0, 2);

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {nome.split(' ')[0]}!</Text>
            <Text style={[typography.caption]}>Confira seu progresso e próximos eventos.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {nome.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Card Horas */}
        <TouchableOpacity style={styles.horasCard} onPress={() => navigation.navigate('Horas')} activeOpacity={0.9}>
          <View style={styles.blobTop} />
          <View style={styles.blobBottom} />
          <View style={styles.horasHeader}>
            <Text style={styles.horasTitle}>Horas complementares</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={styles.horasLink}>Ver detalhes</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primaryDark} style={{ opacity: 0.8 }} />
            </View>
          </View>
          <View style={styles.horasContent}>
            <View style={styles.ringWrap}>
              <Svg width={88} height={88} viewBox="0 0 88 88">
                <Defs>
                  <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={colors.sun} />
                    <Stop offset="100%" stopColor={colors.peach} />
                  </LinearGradient>
                </Defs>
                <Circle cx={44} cy={44} r={36} stroke="rgba(139,127,217,0.15)" strokeWidth={9} fill="none" />
                <Circle
                  cx={44} cy={44} r={36}
                  stroke="url(#ringGrad)" strokeWidth={9} fill="none"
                  strokeDasharray={`${2 * Math.PI * 36 * (pct / 100)} ${2 * Math.PI * 36}`}
                  strokeLinecap="round"
                  rotation="-90" originX={44} originY={44}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.ringNum}>{horasCompletas}h</Text>
                <Text style={styles.ringSub}>de {horasTotal}h</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.horasPct}>{pct}%<Text style={styles.horasPctLabel}> concluído</Text></Text>
              <View style={styles.track}>
                <View style={[styles.trackFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.horasFoot}>{horasCompletas >= horasTotal ? 'Meta de horas atingida!' : `Faltam ${horasTotal - horasCompletas}h para concluir`}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Próximos eventos */}
        <Text style={styles.sectionLabel}>Próximos eventos</Text>
        {proximosEventos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Nenhum evento disponível no momento.</Text>
          </View>
        ) : proximosEventos.map(evento => (
          <TouchableOpacity
            key={evento.id}
            style={styles.card}
            onPress={() => navigation.navigate('DetalheEvento', { evento })}
            activeOpacity={0.75}
          >
            <View style={styles.eventoRow}>
              <View style={[styles.eventoIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventoTitulo} numberOfLines={1}>{evento.titulo}</Text>
                <Text style={[typography.caption, { marginTop: 2 }]}>
                  {formatarData(evento.data)} · {evento.local || ''}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{evento.cargaHoraria}h</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  greeting: { fontSize: 21, fontWeight: '600', color: colors.textPrimary, marginBottom: 3, letterSpacing: -0.2 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  horasCard: { backgroundColor: colors.primaryLight, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  blobTop: { position: 'absolute', top: -36, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,200,89,0.35)' },
  blobBottom: { position: 'absolute', bottom: -56, left: -36, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,155,123,0.18)' },
  horasHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  horasTitle: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  horasLink: { fontSize: 12, color: colors.primaryDark, fontWeight: '500', opacity: 0.8 },
  horasContent: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ringWrap: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringNum: { fontSize: 19, fontWeight: '600', color: colors.primaryDark, lineHeight: 22 },
  ringSub: { fontSize: 9, color: colors.textSecondary, marginTop: 2 },
  horasPct: { fontSize: 25, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.3 },
  horasPctLabel: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  track: { height: 7, backgroundColor: 'rgba(139,127,217,0.18)', borderRadius: 6, marginTop: 9, overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: colors.peach, borderRadius: 6 },
  horasFoot: { fontSize: 11.5, color: colors.textSecondary, marginTop: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  emptyCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.sm },
  eventoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventoIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  eventoTitulo: { fontSize: 13.5, fontWeight: '500', color: colors.textPrimary },
  badge: { backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.primaryDark },
});