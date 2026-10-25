// src/screens/CertificadosScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, TextInput, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { getMeusCertificados, enviarCertificado } from '../services/api';
import { formatarData } from '../utils/formatar';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Lê o arquivo escolhido e devolve só o conteúdo em Base64. */
async function lerComoBase64(uri) {
  const resp = await fetch(uri);
  const blob = await resp.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = String(reader.result || '');
      resolve(res.includes(',') ? res.split(',')[1] : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
import { colors, spacing, typography, radius } from '../styles/theme';

const TABS = ['Enviados', 'Histórico'];

const statusConfig = {
  PENDENTE:  { label: 'Em análise', cor: colors.sunDark,  bg: colors.sunLight,  icon: 'time' },
  APROVADO:  { label: 'Aprovado',   cor: colors.mintDark, bg: colors.mintLight, icon: 'checkmark-circle' },
  REPROVADO: { label: 'Reprovado',  cor: colors.red,      bg: colors.redLight,  icon: 'close-circle' },
};

export default function CertificadosScreen() {
  const [certificados, setCertificados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ tituloCurso: '', instituicao: '', cargaHoraria: '' });
  const [enviando, setEnviando] = useState(false);
  const [arquivo, setArquivo] = useState(null); // { nome, tipo, uri, tamanho }

  async function escolherArquivo() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.length) return;
      const a = res.assets[0];
      if (a.size && a.size > MAX_BYTES) {
        Alert.alert('Arquivo muito grande', 'Escolha um arquivo de até 5 MB.');
        return;
      }
      setArquivo({ nome: a.name, tipo: a.mimeType || 'application/pdf', uri: a.uri, tamanho: a.size });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível abrir o arquivo.');
    }
  }

  async function carregar() {
    try {
      const data = await getMeusCertificados();
      setCertificados(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Erro certificados:', e);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { carregar(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  async function handleEnviar() {
    if (!form.tituloCurso || !form.instituicao || !form.cargaHoraria) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }
    const carga = parseInt(form.cargaHoraria, 10);
    if (!(carga > 0)) {
      Alert.alert('Carga horária inválida', 'Informe um número de horas maior que zero.');
      return;
    }
    setEnviando(true);
    try {
      const body = { ...form, cargaHoraria: carga };
      if (arquivo) {
        body.arquivoNome = arquivo.nome;
        body.arquivoTipo = arquivo.tipo;
        body.arquivoBase64 = await lerComoBase64(arquivo.uri);
      }
      await enviarCertificado(body);
      setModalVisible(false);
      setForm({ tituloCurso: '', instituicao: '', cargaHoraria: '' });
      setArquivo(null);
      Alert.alert('Certificado enviado', 'Agora é só aguardar a análise da coordenação.');
      carregar();
    } catch (e) {
      Alert.alert('Erro', e.message || 'Não foi possível enviar.');
    } finally {
      setEnviando(false);
    }
  }

  const externos = certificados.filter(c => !c.ehFinal);
  const aprovados = certificados.filter(c => c.status === 'APROVADO');

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
        {tabAtiva === 0 && (
          <>
            {externos.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="ribbon-outline" size={48} color={colors.gray200} />
                <Text style={[typography.h3, { marginTop: 12 }]}>Nenhum certificado enviado</Text>
              </View>
            ) : externos.map(cert => {
              const s = statusConfig[cert.status] || statusConfig.PENDENTE;
              return (
                <View key={cert.id} style={styles.certItem}>
                  <View style={[styles.certIcon, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon} size={22} color={s.cor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.certTitulo} numberOfLines={1}>{cert.tituloCurso}</Text>
                    <Text style={styles.certMeta}>{cert.instituicao} · {cert.cargaHoraria}h · {formatarData(cert.enviadoEm)}{cert.temArquivo ? ' · anexo enviado' : ''}</Text>
                    {cert.motivoReprovacao ? (
                      <Text style={{ fontSize: 11, color: colors.red, marginTop: 2 }}>{cert.motivoReprovacao}</Text>
                    ) : null}
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: s.cor }}>{s.label}</Text>
                  </View>
                </View>
              );
            })}
            <TouchableOpacity style={styles.btnEnviar} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnEnviarText}>Enviar novo certificado</Text>
            </TouchableOpacity>
          </>
        )}

        {tabAtiva === 1 && (
          <>
            {aprovados.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.gray200} />
                <Text style={[typography.h3, { marginTop: 12 }]}>Nenhum aprovado ainda</Text>
              </View>
            ) : aprovados.map(cert => (
              <View key={cert.id} style={styles.certItem}>
                <View style={[styles.certIcon, { backgroundColor: colors.mintLight }]}>
                  <Ionicons name="ribbon" size={22} color={colors.mintDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitulo}>{cert.tituloCurso}</Text>
                  <Text style={styles.certMeta}>
                    {cert.ehFinal
                      ? `Certificado final · ${cert.cargaHoraria}h · código ${cert.codigoValidacao || ''}`
                      : `${cert.cargaHoraria}h · Aprovado em ${formatarData(cert.analisadoEm)}`}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal envio */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.textPrimary }}>Novo certificado</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Nome do curso *', key: 'tituloCurso', placeholder: 'Ex: Curso de Python' },
              { label: 'Instituição *', key: 'instituicao', placeholder: 'Ex: Udemy, Coursera' },
              { label: 'Carga horária (h) *', key: 'cargaHoraria', placeholder: 'Ex: 20', keyboard: 'numeric' },
            ].map(f => (
              <View key={f.key} style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType={f.keyboard || 'default'}
                  value={form[f.key]}
                  onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                />
              </View>
            ))}

            <Text style={styles.inputLabel}>Arquivo do certificado (PDF ou foto, opcional)</Text>
            <TouchableOpacity style={styles.btnArquivo} onPress={escolherArquivo}>
              <Ionicons name={arquivo ? 'document-attach' : 'attach-outline'} size={18} color={colors.primary} />
              <Text style={{ flex: 1, color: arquivo ? colors.textPrimary : colors.textSecondary, fontSize: 13 }} numberOfLines={1}>
                {arquivo ? arquivo.nome : 'Escolher arquivo...'}
              </Text>
              {arquivo && (
                <TouchableOpacity onPress={() => setArquivo(null)}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnEnviar, { marginTop: 12 }]}
              onPress={handleEnviar}
              disabled={enviando}
            >
              {enviando
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnEnviarText}>Enviar para análise</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  certItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, backgroundColor: colors.white, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  certIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  certTitulo: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  certMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  btnArquivo: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, padding: 12, backgroundColor: colors.background },
  btnDownload: { width: 36, height: 36, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  btnEnviar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, marginTop: spacing.sm },
  btnEnviarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, paddingBottom: 40 },
  inputLabel: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 10, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background },
});