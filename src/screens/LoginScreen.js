// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const colors = {
  primary: '#8B7FD9',
  primaryLight: '#EFEDFC',
  primaryDark: '#5A4FB0',
  background: '#FBFAFE',
  white: '#FFFFFF',
  textPrimary: '#2E2A45',
  textSecondary: '#8580A3',
  border: 'rgba(139,127,217,0.18)',
  red: '#E0566B',
  redLight: '#FBE6EA',
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState('');

  async function handleLogin() {
    if (!email.trim()) { setErro('Informe seu e-mail'); return; }
    if (!senha.trim()) { setErro('Informe sua senha'); return; }
    setErro('');
    setCarregando(true);
    try {
      await login(email.trim().toLowerCase(), senha);
    } catch (e) {
      setErro(e.message || 'E-mail ou senha inválidos');
    } finally {
      setCarregando(false);
    }
  }

  function preencherDemo(tipo) {
    const dados = {
      aluno: { email: 'ana@uni.edu.br', senha: '123456' },
    };
    setEmail(dados[tipo].email);
    setSenha(dados[tipo].senha);
    setErro('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.blobTop} />
          <View style={styles.blobBottom} />

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetra}>E</Text>
            </View>
            <Text style={styles.logoTitulo}>EventCampus</Text>
            <Text style={styles.logoSub}>Plataforma de Eventos Universitários</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Entrar na conta</Text>
            <Text style={styles.cardSub}>Use seu e-mail institucional</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@uni.edu.br"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={v => { setEmail(v); setErro(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.senhaWrap}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={senha}
                  onChangeText={v => { setSenha(v); setErro(''); }}
                  secureTextEntry={!senhaVisivel}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.senhaToggle}
                  onPress={() => setSenhaVisivel(!senhaVisivel)}
                >
                  <Ionicons name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {erro ? (
              <View style={styles.erroBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
                <Text style={[styles.erroText, { flex: 1 }]}>{erro}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btnPrimary, carregando && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={carregando}
              activeOpacity={0.85}
            >
              {carregando
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnPrimaryText}>Entrar</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Demo — só Aluno */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitulo}>Acesso rápido (demo)</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={[styles.demoBtn, { flex: 0, paddingHorizontal: 32 }]}
                onPress={() => preencherDemo('aluno')}
              >
                <Ionicons name="school-outline" size={26} color={colors.primary} style={{ marginBottom: 2 }} />
                <Text style={styles.demoBtnText}>Aluno</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} EventCampus · UNIFAN</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  blobTop: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(139,127,217,0.10)',
  },
  blobBottom: {
    position: 'absolute', bottom: -80, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,155,123,0.08)',
  },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  logoLetra: { fontSize: 28, fontWeight: '700', color: '#fff' },
  logoTitulo: { fontSize: 22, fontWeight: '700', color: colors.primaryDark, marginBottom: 4 },
  logoSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, marginBottom: 16,
  },
  cardTitulo: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 22 },
  formGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    padding: 12, fontSize: 14, color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  senhaWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  senhaToggle: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  erroBox: { backgroundColor: colors.redLight, borderRadius: 10, padding: 10, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  erroText: { fontSize: 13, color: colors.red, fontWeight: '500' },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  demoBox: {
    backgroundColor: colors.primaryLight, borderRadius: 16,
    padding: 16, marginBottom: 20, alignItems: 'center',
  },
  demoTitulo: {
    fontSize: 11, fontWeight: '600', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    textAlign: 'center', marginBottom: 12,
  },
  demoRow: { flexDirection: 'row', justifyContent: 'center' },
  demoBtn: {
    backgroundColor: colors.white, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  demoBtnIcon: { fontSize: 28 },
  demoBtnText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  footer: { textAlign: 'center', fontSize: 11, color: colors.textSecondary },
});