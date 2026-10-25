// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app: se tem sessão salva e o token ainda vale, entra direto
  useEffect(() => {
    api.acordarApi();
    async function verificarSessao() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const salvo = await api.getUsuarioSalvo();
          const me = await api.getMe();          // valida o token na API
          setUsuario({ ...salvo, ...me, token });
        }
      } catch {
        await api.logout();                      // token expirado ou API fora → login de novo
      } finally {
        setCarregando(false);
      }
    }
    verificarSessao();
  }, []);

  async function login(email, senha) {
    const data = await api.login(email.trim(), senha);
    setUsuario(data);
    return data;
  }

  async function logout() {
    try { await api.logout(); } catch {}
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}