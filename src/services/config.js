// src/services/config.js
//
// true  → o app usa a API ONLINE (Render). Funciona em qualquer rede, até no 4G.
// false → o app usa a API do seu computador (celular e PC no mesmo Wi-Fi).
export const USAR_API_ONLINE = true;

// ATENÇÃO: depois de criar a API no Render, coloque o endereço dela aqui
const API_URL_ONLINE = 'https://eventcampus-api.onrender.com';

// IP do seu computador na rede Wi-Fi (veja com "ipconfig" → Endereço IPv4)
const API_URL_LOCAL = 'http://192.168.1.23:8080';

export const API_URL = USAR_API_ONLINE ? API_URL_ONLINE : API_URL_LOCAL;

// Endereço do painel web (aparece como dica para professor/coordenação)
export const WEB_URL = USAR_API_ONLINE ? 'https://eventcampus-web.onrender.com' : 'http://192.168.1.23:5500';