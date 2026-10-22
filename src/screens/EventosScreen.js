// src/screens/EventosScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getEventos, inscrever } from '../services/api';
import { colors, spacing, typography, radius } from '../styles/theme';
import { formatarData, formatarHorario } from '../utils/formatar';

const TIPO_LABELS = { PALESTRA: 'Palestra', WORKSHOP: 'Workshop', CURSO: 'Curso', SEMINARIO: 'Seminário' };

const STATUS_FILTROS = [
  { key: 'ATIVO',     label: '✅ Ativos' },
  { key: 'CONCLUIDO', label: '🏁 Concluídos' },
  { key: 'ENCERRADO', label: '⏹ Encerrados' },
];

export default function EventosScreen() {
  const navigation = useNavigation();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('ATIVO');

  async function carregar() {
    try {
      const data = await getEventos();
      setEventos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Erro eventos:', e);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { carregar(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  const eventosFiltrados = eventos.filter(e => {
    const matchBusca = e.titulo?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = e.status === statusFiltro;
    return matchBusca && matchStatus;
  });

  async function handleInscrever(eventoId) {
    try {
      await inscrever(eventoId);
      setEventos(prev => prev.map(e => e.id === eventoId ? { ...e, inscrito: true } : e));
    } catch (e) {
      alert('❌ ' + (e.message || 'Erro ao se inscrever'));
    }
  }

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
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos..."
          placeholderTextColor={colors.textSecondary}
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusFiltros}>
        {STATUS_FILTROS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.statusChip, statusFiltro === f.key && styles.statusChipAtivo]}
            onPress={() => setStatusFiltro(f.key)}
          >
            <Text style={[styles.statusChipText, statusFiltro === f.key && styles.statusChipTextAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={eventosFiltrados}
        keyExtractor={e => String(e.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item: evento }) => {
          const ativo = evento.status === 'ATIVO';
          const concluido = evento.status === 'CONCLUIDO';
          const encerrado = evento.status === 'ENCERRADO';

          return (
            <TouchableOpacity
              style={[styles.card, !ativo && { opacity: 0.75 }]}
              onPress={() => navigation.navigate('DetalheEvento', { evento })}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.tipoBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.tipoText, { color: colors.primaryDark }]}>
                    {TIPO_LABELS[evento.tipo] || evento.tipo || 'Evento'}
                  </Text>
                </View>
                <View style={[styles.tipoBadge, {
                  backgroundColor: ativo ? colors.mintLight : concluido ? colors.primaryLight : colors.redLight
                }]}>
                  <Text style={[styles.tipoText, {
                    color: ativo ? colors.mintDark : concluido ? colors.primaryDark : colors.red
                  }]}>
                    {ativo ? `${evento.vagasRestantes ?? evento.vagas} vagas` : concluido ? 'Concluído' : 'Encerrado'}
                  </Text>
                </View>
              </View>

              <Text style={styles.titulo}>{evento.titulo}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {formatarData(evento.data)} · {formatarHorario(evento.horarioInicio, evento.horarioFim)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{evento.local || ''}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={[styles.tipoBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.tipoText, { color: colors.primaryDark }]}>{evento.cargaHoraria}h</Text>
                </View>
                {ativo ? (
                  <TouchableOpacity style={styles.btnInscrever} onPress={() => handleInscrever(evento.id)}>
                    <Text style={styles.btnInscreverText}>Inscrever-se</Text>
                  </TouchableOpacity>
                ) : concluido ? (
                  <View style={[styles.btnStatus, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.btnStatusText, { color: colors.primaryDark }]}>🏁 Concluído</Text>
                  </View>
                ) : (
                  <View style={[styles.btnStatus, { backgroundColor: colors.redLight }]}>
                    <Text style={[styles.btnStatusText, { color: colors.red }]}>⏹ Encerrado</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.gray200} />
            <Text style={[typography.h3, { marginTop: 12, textAlign: 'center' }]}>
              {statusFiltro === 'ATIVO' ? 'Nenhum evento ativo' :
               statusFiltro === 'CONCLUIDO' ? 'Nenhum evento concluído' :
               'Nenhum evento encerrado'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius.lg, margin: spacing.lg, marginBottom: spacing.sm,
    paddingHorizontal: 14, height: 46,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  statusFiltros: {
    flexDirection: 'row', paddingHorizontal: spacing.lg,
    gap: 8, marginBottom: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.white,
  },
  statusChipAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: 12, color: colors.textSecondary },
  statusChipTextAtivo: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tipoBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  tipoText: { fontSize: 11, fontWeight: '600' },
  titulo: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  btnInscrever: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 7, paddingHorizontal: 16,
  },
  btnInscreverText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnStatus: { borderRadius: radius.md, paddingVertical: 7, paddingHorizontal: 16 },
  btnStatusText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
});