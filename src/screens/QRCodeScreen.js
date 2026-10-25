// src/screens/QRCodeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getEvento, confirmarPresenca } from '../services/api';
import { colors, spacing, radius } from '../styles/theme';

// Envia o código lido + GPS do celular. A API valida a distância (Haversine)
// e devolve {"erro": "..."} se o aluno estiver fora do raio permitido.
const confirmarPresencaGPS = (qrCodigo, latitude, longitude) =>
  confirmarPresenca(qrCodigo, latitude, longitude);

export default function QRCodeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventoId } = route.params || {};

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [evento, setEvento] = useState(null);
  const [locPermission, setLocPermission] = useState(null);

  useEffect(() => {
    requestPermission();
    async function init() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocPermission(status === 'granted');
      if (eventoId) {
        try {
          const data = await getEvento(eventoId);
          if (data?.id) setEvento(data);
        } catch (e) {
          console.log('Erro ao carregar evento:', e);
        }
      }
    }
    init();
  }, []);

  async function handleBarCodeScanned({ data: qrCodigo }) {
    if (scanned) return;
    setScanned(true);
    setAtivo(false);

    try {
      let latitude = null;
      let longitude = null;

      if (locPermission) {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
          console.log('GPS:', latitude, longitude);
        } catch (e) {
          console.log('Erro GPS:', e.message);
        }
      }

      console.log('Enviando:', { qrCodigo, latitude, longitude });

      const resultado = await confirmarPresencaGPS(qrCodigo, latitude, longitude);
      console.log('Resultado:', JSON.stringify(resultado));

      if (resultado?.mensagem) {
        Alert.alert(
          'Presença confirmada!',
          resultado.mensagem,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Não foi possível confirmar',
          resultado?.erro || 'Erro desconhecido',
          [{ text: 'Tentar novamente', onPress: () => { setScanned(false); setAtivo(true); } }]
        );
      }
    } catch (e) {
      console.log('Erro catch:', e.message);
      Alert.alert(
        'Não foi possível confirmar',
        e.message,
        [{ text: 'Tentar novamente', onPress: () => { setScanned(false); setAtivo(true); } }]
      );
    }
  }

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>Verificando permissões...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.topbarTitle, { color: colors.textPrimary }]}>Confirmar presença</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="camera-off-outline" size={56} color={colors.gray200} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 16, textAlign: 'center' }}>
            Câmera sem permissão
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            Precisamos de acesso à câmera para escanear o QR Code.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
            <Text style={styles.btnText}>Permitir acesso à câmera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.topbarTitle, { color: '#fff' }]}>Confirmar presença</Text>
        <View style={{ width: 24 }} />
      </View>

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={ativo ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <View style={styles.overlay}>
        <Text style={styles.instrucao}>
          Posicione o QR Code do organizador dentro do quadro
        </Text>

        <View style={styles.frame}>
          <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 }]} />
          <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 }]} />
          <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
          <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 }]} />
        </View>

        {locPermission === false && (
          <View style={styles.gpsAviso}>
            <Ionicons name="location-off-outline" size={16} color={colors.sunDark} />
            <Text style={{ fontSize: 12, color: colors.sunDark, flex: 1 }}>
              GPS sem permissão — validação de localização desativada
            </Text>
          </View>
        )}

        <Text style={styles.aviso}>
          A presença só será confirmada dentro do raio permitido pelo professor.
        </Text>

        {scanned && (
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => { setScanned(false); setAtivo(true); }}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.btnText}>Escanear novamente</Text>
          </TouchableOpacity>
        )}
      </View>

      {evento && (
        <View style={styles.eventoInfo}>
          <Ionicons name="calendar-outline" size={16} color={colors.primaryDark} />
          <Text style={styles.eventoInfoText} numberOfLines={1}>{evento.titulo}</Text>
          {evento.raioMetros ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Ionicons name="location-outline" size={13} color={colors.primaryDark} />
              <Text style={{ fontSize: 11, color: colors.primaryDark }}>{evento.raioMetros} m</Text>
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, zIndex: 10,
  },
  topbarTitle: { fontSize: 16, fontWeight: '600' },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  instrucao: {
    color: '#fff', fontSize: 14, textAlign: 'center',
    marginBottom: 32, fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  frame: { width: 240, height: 240, position: 'relative' },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: colors.primary },
  gpsAviso: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.sunLight, borderRadius: radius.md,
    padding: 10, marginTop: 20, maxWidth: 280,
  },
  aviso: {
    color: 'rgba(255,255,255,0.75)', fontSize: 11, textAlign: 'center',
    marginTop: 20, lineHeight: 16, maxWidth: 280,
  },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 12, paddingHorizontal: 24, marginTop: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  eventoInfo: {
    position: 'absolute', bottom: 40, left: 24, right: 24,
    backgroundColor: colors.primaryLight, borderRadius: radius.lg,
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
  },
  eventoInfoText: { fontSize: 13, fontWeight: '500', color: colors.primaryDark, flex: 1 },
});