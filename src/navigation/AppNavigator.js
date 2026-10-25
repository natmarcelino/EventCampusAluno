// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import EventosScreen from '../screens/EventosScreen';
import InscricoesScreen from '../screens/InscricoesScreen';
import HorasScreen from '../screens/HorasScreen';
import CertificadosScreen from '../screens/CertificadosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import DetalheEventoScreen from '../screens/DetalheEventoScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import { colors } from '../styles/theme';
import { WEB_URL } from '../services/config';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Stacks ────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} />
      <Stack.Screen name="DetalheEvento" component={DetalheEventoScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
      <Stack.Screen name="Horas" component={HorasScreen} />
    </Stack.Navigator>
  );
}

function EventosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaEventos" component={EventosScreen} />
      <Stack.Screen name="DetalheEvento" component={DetalheEventoScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
    </Stack.Navigator>
  );
}

function InscricoesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MinhasInscricoes" component={InscricoesScreen} />
      <Stack.Screen name="DetalheEvento" component={DetalheEventoScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
    </Stack.Navigator>
  );
}

// ── Tabs Aluno ────────────────────────────────────────────────
function AlunoTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.white, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0.5, borderBottomColor: colors.border },
        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
        tabBarStyle: { backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Início: focused ? 'home' : 'home-outline',
            Eventos: focused ? 'calendar' : 'calendar-outline',
            Inscrições: focused ? 'clipboard' : 'clipboard-outline',
            Horas: focused ? 'time' : 'time-outline',
            Certificados: focused ? 'ribbon' : 'ribbon-outline',
            Perfil: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Eventos" component={EventosStack} options={{ headerShown: false }} />
      <Tab.Screen name="Inscrições" component={InscricoesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Horas" component={HorasScreen} options={{ headerTitle: 'Horas Complementares' }} />
      <Tab.Screen name="Certificados" component={CertificadosScreen} options={{ headerTitle: 'Certificados Externos' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ headerTitle: 'Meu Perfil' }} />
    </Tab.Navigator>
  );
}

// ── Tela para Professor/Admin no mobile ───────────────────────
function TelaWebRedirect() {
  const { usuario, logout } = useAuth();
  return (
    <View style={styles.redirectContainer}>
      <Ionicons name="desktop-outline" size={56} color={colors.primary} style={{ marginBottom: 16 }} />
      <Text style={styles.redirectTitulo}>Acesso Web</Text>
      <Text style={styles.redirectSub}>
        Olá, {usuario?.nome?.split(' ')[0]}! O perfil de{' '}
        <Text style={{ fontWeight: '600', color: colors.primaryDark }}>
          {usuario?.perfil === 'PROFESSOR' ? 'Professor' : 'Administrador'}
        </Text>{' '}
        é acessado pelo navegador no computador.
      </Text>
      <View style={styles.urlBox}>
        <Text style={styles.urlLabel}>Acesse em:</Text>
        <Text style={styles.urlText}>{WEB_URL}</Text>
        <Text style={styles.urlSubtext}>(abra o index.html com Live Server)</Text>
      </View>
      <TouchableOpacity style={styles.sairBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.red} />
        <Text style={styles.sairText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Loading ───────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// ── Navigator principal ───────────────────────────────────────
export default function AppNavigator() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!usuario ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : usuario.perfil === 'ALUNO' ? (
          <Stack.Screen name="App" component={AlunoTabs} />
        ) : (
          // Professor e Admin → redireciona pro web
          <Stack.Screen name="Web" component={TelaWebRedirect} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  redirectContainer: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  redirectIcon: { fontSize: 56, marginBottom: 16 },
  redirectTitulo: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  redirectSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  urlBox: {
    backgroundColor: colors.primaryLight, borderRadius: 14,
    padding: 16, width: '100%', alignItems: 'center', marginBottom: 24,
  },
  urlLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  urlText: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  urlSubtext: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  sairBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.redLight, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  sairText: { fontSize: 14, fontWeight: '600', color: colors.red },
});