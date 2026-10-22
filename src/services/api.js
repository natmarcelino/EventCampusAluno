// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

async function getToken() {
  return await AsyncStorage.getItem('token');
}

async function request(method, rota, body = null) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(API_URL + rota, config);
  } catch (e) {
    throw new Error(`Sem conexão com o servidor (${API_URL}). Confira o Wi-Fi e o IP em src/services/config.js.`);
  }

  // Se a resposta não tem corpo (ex: 204 No Content), retorna null
  const text = await response.text();
  let data = null;
  if (text && text.trim() !== '') {
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Resposta inválida da API: ' + text.substring(0, 100));
    }
  }

  if (!response.ok) {
    throw new Error(data?.erro || data?.message || `Erro na requisição (${response.status})`);
  }

  return data;
}

// ── AUTH ──────────────────────────────────────────────────────
export async function login(email, senha) {
  const data = await request('POST', '/api/auth/login', { email, senha });
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('usuario', JSON.stringify(data));
  return data;
}

export const cadastrar = (dados) => request('POST', '/api/auth/cadastro', dados);

export async function logout() {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('usuario');
}

export async function getMe() {
  return await request('GET', '/api/auth/me');
}

export async function getUsuarioSalvo() {
  const json = await AsyncStorage.getItem('usuario');
  return json ? JSON.parse(json) : null;
}

// ── EVENTOS ───────────────────────────────────────────────────
export const getEventos = () => request('GET', '/api/eventos');
export const getEvento  = (id) => request('GET', `/api/eventos/${id}`);

// ── INSCRIÇÕES ────────────────────────────────────────────────
export const inscrever           = (eventoId) => request('POST', `/api/inscricoes/${eventoId}`);
export const cancelarInscricao   = (eventoId) => request('DELETE', `/api/inscricoes/${eventoId}`);
export const getMinhasInscricoes = () => request('GET', '/api/inscricoes/minhas');

// ── PRESENÇA (QR Code + GPS) ──────────────────────────────────
export const confirmarPresenca = (qrCodigo, latitude, longitude) =>
  request('POST', '/api/presenca/confirmar', { qrCodigo, latitude, longitude });

// ── CERTIFICADOS ──────────────────────────────────────────────
export const getMeusCertificados = () => request('GET', '/api/certificados/meus');
export const enviarCertificado   = (body) => request('POST', '/api/certificados', body);
