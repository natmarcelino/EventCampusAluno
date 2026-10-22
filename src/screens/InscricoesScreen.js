// src/screens/InscricoesScreen.js
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMinhasInscricoes } from '../services/api';
import { colors, spacing, typography, radius } from '../styles/theme';
import { formatarData } from '../utils/formatar';

const TABS = ['Inscrições', 'Presenças', 'Certificados'];

export default function InscricoesScreen() {
  const navigation = useNavigation();
  const [inscricoes, setInscricoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(0);

  async function carregar() {
    try {
      const data = await getMinhasInscricoes();
      setInscricoes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Erro inscrições:', e);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { carregar(); }, []));
  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  const comPresenca = inscricoes.filter(i => i.presencaConfirmada);
  const semPresenca = inscricoes.filter(i => !i.presencaConfirmada);

  function Badge({ label, variant }) {
    const cores = {
      blue:   { bg: colors.primaryLight, text: colors.primaryDark },
      green:  { bg: colors.mintLight,    text: colors.mintDark },
      amber:  { bg: colors.sunLight,     text: colors.sunDark },
      purple: { bg: colors.primaryLight, text: colors.primary },
    };
    const c = cores[variant] || cores.blue;
    return (
      <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: c.text }}>{label}</Text>
      </View>
    );
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
      <View style={styles.tabsBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={i} style={[styles.tab, tabAtiva === i && styles.tabAtiva]} onPress={() => setTabAtiva(i)}>
            <Text style={[styles.tabText, tabAtiva === i && styles.tabTextAtiva]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Tab Inscrições */}
        {tabAtiva === 0 && (
          inscricoes.length === 0
            ? <View style={styles.empty}><Ionicons name="clipboard-outline" size={48} color={colors.gray200} /><Text style={[typography.h3, { marginTop: 12 }]}>Sem inscrições</Text></View>
            : inscricoes.map(i => (
              <TouchableOpacity key={i.id} style={styles.card} activeOpacity={0.75}
                onPress={() => navigation.navigate('DetalheEvento', { evento: { id: i.eventoId, titulo: i.titulo, data: i.data, local: i.local, cargaHoraria: i.cargaHoraria } })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo} numberOfLines={1}>{i.titulo}</Text>
                    <Text style={[typography.caption, { marginTop: 2 }]}>
                      {formatarData(i.data)}
                    </Text>
                  </View>
                  <Badge label={i.presencaConfirmada ? 'Presente' : 'Inscrito'} variant={i.presencaConfirmada ? 'green' : 'blue'} />
                </View>
                {!i.presencaConfirmada && (
                  <TouchableOpacity
                    style={styles.btnQR}
                    onPress={() => navigation.navigate('QRCode', { eventoId: i.eventoId })}
                  >
                    <Ionicons name="qr-code-outline" size={14} color={colors.primary} />
                    <Text style={styles.btnQRText}>Confirmar presença</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
        )}

        {/* Tab Presenças */}
        {tabAtiva === 1 && (
          comPresenca.length === 0
            ? <View style={styles.empty}><Ionicons name="checkmark-circle-outline" size={48} color={colors.gray200} /><Text style={[typography.h3, { marginTop: 12 }]}>Nenhuma presença confirmada</Text></View>
            : comPresenca.map(i => (
              <View key={i.id} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.mintLight, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.mintDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo} numberOfLines={1}>{i.titulo}</Text>
                    <Text style={[typography.caption, { marginTop: 2 }]}>
                      {formatarData(i.data)} · {i.cargaHoraria}h
                    </Text>
                  </View>
                  <Badge label={`+${i.cargaHoraria}h`} variant="green" />
                </View>
              </View>
            ))
        )}

        {/* Tab Certificados */}
        {tabAtiva === 2 && (
          comPresenca.length === 0
            ? <View style={styles.empty}><Ionicons name="ribbon-outline" size={48} color={colors.gray200} /><Text style={[typography.h3, { marginTop: 12 }]}>Sem certificados</Text><Text style={[typography.caption, { textAlign: 'center', marginTop: 4 }]}>Confirme presença nos eventos para obter certificados.</Text></View>
            : comPresenca.map(i => (
              <View key={i.id} style={styles.certItem}>
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.mintLight, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="ribbon-outline" size={20} color={colors.mintDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitulo} numberOfLines={1}>{i.titulo}</Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>{i.cargaHoraria}h · Disponível</Text>
                </View>
                <TouchableOpacity style={styles.btnDownload}>
                  <Ionicons name="download-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabsBar: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabAtiva: { borderBottomColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textSecondary },
  tabTextAtiva: { color: colors.primary, fontWeight: '600' },
  scroll: { padding: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  certItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, backgroundColor: colors.white, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  cardTitulo: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  btnQR: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: colors.primaryLight, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12 },
  btnQRText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  btnDownload: { width: 36, height: 36, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
});