// src/services/certificado.js
// Baixa o certificado de participação (PDF) de um evento e abre as opções do celular
// (salvar em Arquivos, abrir no leitor de PDF, enviar pelo WhatsApp etc.).
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_URL } from './config';

function nomeArquivo(titulo, eventoId) {
  const base = String(titulo || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    .toLowerCase().slice(0, 60);
  return `certificado-${base || 'evento-' + eventoId}.pdf`;
}

export async function baixarCertificadoEvento(eventoId, titulo) {
  const token = await AsyncStorage.getItem('token');
  const destino = FileSystem.cacheDirectory + nomeArquivo(titulo, eventoId);

  let resultado;
  try {
    resultado = await FileSystem.downloadAsync(
      `${API_URL}/api/certificados/evento/${eventoId}/pdf`,
      destino,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
  } catch (e) {
    throw new Error('Sem conexão com o servidor. Se a API estiver acordando, aguarde uns 40 segundos e tente de novo.');
  }

  if (resultado.status !== 200) {
    // A API devolve {"erro": "..."} quando não pode emitir o certificado
    let mensagem = `Não foi possível gerar o certificado (${resultado.status}).`;
    try {
      const texto = await FileSystem.readAsStringAsync(resultado.uri);
      const json = JSON.parse(texto);
      if (json?.erro) mensagem = json.erro;
    } catch { /* mantém a mensagem padrão */ }
    await FileSystem.deleteAsync(resultado.uri, { idempotent: true }).catch(() => {});
    throw new Error(mensagem);
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este aparelho não permite abrir ou compartilhar arquivos.');
  }
  await Sharing.shareAsync(resultado.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Certificado de participação',
    UTI: 'com.adobe.pdf',
  });
}