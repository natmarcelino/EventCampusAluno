// src/screens/DetalheEventoScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { inscrever, cancelarInscricao, getEvento, getMinhasInscricoes } from '../services/api';
import { formatarData, formatarHorario } from '../utils/formatar';
import { colors, spacing, typography, radius } from '../styles/theme';

const tipoVariant = {
  PALESTRA: 'blue', WORKSHOP: 'amber', CURSO: 'green', SEMINARIO: 'purple',
};
const tipoLabels = {
  PALESTRA: 'Palestra', WORKSHOP: 'Workshop', CURSO: 'Curso', SEMINARIO: 'Seminário',
};

function Badge({ label, variant = 'blue' }) {
  const cores = {
    blue:   { bg: colors.primaryLight, text: colors.primaryDark },
    green:  { bg: colors.mintLight,    text: colors.mintDark },
    amber:  { bg: colors.sunLight,     text: colors.sunDark },
    red:    { bg: colors.redLight,     text: colors.red },
    purple: { bg: colors.primaryLight, text: colors.primary },
  };
  const c = cores[variant] || cores.blue;
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: c.text }}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 0.5, backgroundColor: colors.border, marginVertical: spacing.md }} />;
}

export default function DetalheEventoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { evento } = route.params;

  const [eventoCompleto, setEventoCompleto] = useState(evento);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [inscrito, setInscrito] = useState(false);
  const [presencaConfirmada, setPresencaConfirmada] = useState(false);

  // recarrega ao voltar da tela do QR (presença confirmada aparece na hora)
  useFocusEffect(useCallback(() => {
    async function buscarDetalhes() {
      try {
        const [eventoData, inscricoes] = await Promise.all([
          getEvento(evento.id),
          getMinhasInscricoes(),
        ]);
        if (eventoData?.id) setEventoCompleto(eventoData);
        if (Array.isArray(inscricoes)) {
          const minhaInscricao = inscricoes.find(i => i.eventoId === evento.id);
          if (minhaInscricao) {
            setInscrito(true);
            setPresencaConfirmada(minhaInscricao.presencaConfirmada || false);
          }
        }
      } catch (e) {
        console.log('Erro ao buscar detalhes:', e);
      } finally {
        setCarregando(false);
      }
    }
    if (evento?.id) buscarDetalhes();
    else setCarregando(false);
  }, [evento?.id]));

  function handleCancelar() {
    Alert.alert('Cancelar inscrição', 'Deseja cancelar sua inscrição neste evento?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim, cancelar', style: 'destructive', onPress: async () => {
        try {
          await cancelarInscricao(eventoCompleto.id);
          setInscrito(false);
          setEventoCompleto(e => ({ ...e, vagasRestantes: (e.vagasRestantes ?? 0) + 1 }));
          Alert.alert('Inscrição cancelada');
        } catch (e) {
          Alert.alert('Erro', e.message || 'Não foi possível cancelar.');
        }
      } },
    ]);
  }

  async function handleInscrever() {
    setLoading(true);
    try {
      await inscrever(eventoCompleto.id);
      setInscrito(true);
      setEventoCompleto(e => ({ ...e, vagasRestantes: Math.max(0, (e.vagasRestantes ?? 1) - 1) }));
      Alert.alert('Inscrição confirmada', `Você está inscrito em:\n${eventoCompleto.titulo}`);
    } catch (e) {
      Alert.alert('Erro', e.message || 'Não foi possível se inscrever.');
    } finally {
      setLoading(false);
    }
  }

  const tipo = eventoCompleto?.tipo || '';
  const concluido = eventoCompleto?.status === 'CONCLUIDO';
  // concluído ou encerrado: não aceita mais inscrição nem presença
  const encerrado = eventoCompleto?.status === 'ENCERRADO' || concluido;
  const vagasRestantes = eventoCompleto?.vagasRestantes ?? eventoCompleto?.vagas ?? '—';
  const semVagas = vagasRestantes === 0;

  const detalhes = [
    {
      icon: 'calendar-outline', label: 'Data',
      value: eventoCompleto?.data ? formatarData(eventoCompleto.data, true) : '—'
    },
    {
      icon: 'time-outline', label: 'Horário',
      value: formatarHorario(eventoCompleto?.horarioInicio, eventoCompleto?.horarioFim) || '—'
    },
    { icon: 'location-outline', label: 'Local',         value: eventoCompleto?.local || '—' },
    { icon: 'ribbon-outline',   label: 'Carga horária', value: eventoCompleto?.cargaHoraria ? `${eventoCompleto.cargaHoraria} horas` : '—' },
    { icon: 'people-outline',   label: 'Público-alvo',  value: eventoCompleto?.publicoAlvo || 'Todos os cursos' },
    { icon: 'ticket-outline',   label: 'Vagas',         value: encerrado ? (concluido ? 'Evento concluído' : 'Evento encerrado') : semVagas ? 'Esgotado' : `${vagasRestantes} vagas restantes`, destaque: !encerrado && !semVagas },
  ];

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: encerrado ? colors.gray100 : colors.primaryLight }]}>
          <Ionicons name="calendar" size={60} color={encerrado ? colors.gray400 : colors.primary} />
          {encerrado && (
            <View style={styles.encerradoOverlay}>
              <Text style={styles.encerradoOverlayText}>{concluido ? 'CONCLUÍDO' : 'ENCERRADO'}</Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <Badge label={tipoLabels[tipo] || tipo} variant={tipoVariant[tipo] || 'blue'} />
          {encerrado && <Badge label={concluido ? 'Concluído' : 'Encerrado'} variant={concluido ? 'blue' : 'red'} />}
          {eventoCompleto?.qrAtivo && !encerrado && <Badge label="Presença aberta" variant="green" />}
        </View>

        <Text style={styles.titulo}>{eventoCompleto?.titulo || '—'}</Text>

        {eventoCompleto?.descricao ? (
          <Text style={[typography.caption, { lineHeight: 20, marginBottom: 16 }]}>
            {eventoCompleto.descricao}
          </Text>
        ) : null}

        <Divider />

        {detalhes.map((item, i) => (
          <View key={i} style={styles.detalheItem}>
            <View style={styles.detalheIconWrap}>
              <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
              <Text style={styles.detalheLabel}>{item.label}</Text>
            </View>
            <Text style={[
              styles.detalheValue,
              item.destaque && { color: colors.mintDark },
              encerrado && item.label === 'Vagas' && { color: colors.red },
            ]}>
              {item.value}
            </Text>
          </View>
        ))}

        <Divider />

        {/* Botão de ação */}
        {presencaConfirmada ? (
          <View style={styles.presencaBox}>
            <Ionicons name="checkmark-circle" size={24} color={colors.mintDark} />
            <Text style={{ color: colors.mintDark, fontWeight: '600', fontSize: 15 }}>
              Presença confirmada · +{eventoCompleto?.cargaHoraria || 0}h
            </Text>
          </View>
        ) : encerrado ? (
          <View style={styles.encerradoBox}>
            <Ionicons name="close-circle-outline" size={22} color={colors.red} />
            <Text style={{ color: colors.red, fontWeight: '600', fontSize: 15 }}>
              {concluido ? (inscrito ? 'Evento concluído sem presença registrada' : 'Este evento já foi realizado') : 'Este evento foi encerrado'}
            </Text>
          </View>
        ) : inscrito ? (
          <View>
            <View style={styles.inscritoBox}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primaryDark} />
              <Text style={{ color: colors.primaryDark, fontWeight: '500', fontSize: 14 }}>
                Você já está inscrito neste evento
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.btnPrimary, { marginTop: 8 }]}
              onPress={() => navigation.navigate('QRCode', { eventoId: eventoCompleto.id })}
            >
              <Ionicons name="qr-code-outline" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Confirmar presença (QR Code)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }} onPress={handleCancelar}>
              <Text style={{ color: colors.red, fontSize: 13 }}>Cancelar inscrição</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimary, (loading || semVagas) && { opacity: 0.6 }]}
            onPress={handleInscrever}
            disabled={loading || semVagas}
          >
            <Text style={styles.btnPrimaryText}>
              {semVagas ? 'Vagas esgotadas' : loading ? 'Inscrevendo...' : 'Inscrever-se'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: { padding: 4 },
  scroll: { padding: spacing.lg },
  banner: {
    height: 150, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    position: 'relative', overflow: 'hidden',
  },
  encerradoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(224,86,107,0.85)', paddingVertical: 6,
    alignItems: 'center',
  },
  encerradoOverlayText: {
    color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 2,
  },
  titulo: { fontSize: 20, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, marginTop: 4 },
  detalheItem: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  detalheIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  detalheLabel: { fontSize: 12, color: colors.textSecondary },
  detalheValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, paddingLeft: 22 },
  encerradoBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.redLight, borderRadius: radius.md,
    padding: 14, marginTop: 12,
  },
  presencaBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.mintLight, borderRadius: radius.md,
    padding: 14, marginTop: 12,
  },
  inscritoBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primaryLight, borderRadius: radius.md,
    padding: 12, marginTop: 12,
  },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, marginTop: 12,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});