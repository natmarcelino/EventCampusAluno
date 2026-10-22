# EventCampus — App Mobile (Aluno)

Plataforma de gestão de eventos universitários e horas complementares.

## Estrutura do projeto

```
EventCampus/
├── App.js                          # Entrada da aplicação
├── app.json                        # Configuração Expo
├── package.json
├── babel.config.js
└── src/
    ├── context/
    │   └── AppContext.js           # Estado global (inscrições, horas, etc.)
    ├── navigation/
    │   └── AppNavigator.js         # Bottom tabs + Stack navigation
    ├── screens/
    │   ├── HomeScreen.js           # Dashboard do aluno
    │   ├── EventosScreen.js        # Lista de eventos com busca e filtros
    │   ├── DetalheEventoScreen.js  # Detalhes + inscrição
    │   ├── InscricoesScreen.js     # Minhas inscrições (tabs)
    │   ├── QRCodeScreen.js         # Scanner de QR Code para presença
    │   ├── HorasScreen.js          # Progresso de horas complementares
    │   └── CertificadosScreen.js   # Certificados externos + upload
    ├── components/
    │   └── index.js                # Badge, Card, Button, Avatar, ProgressBar...
    ├── services/
    │   └── mockData.js             # Dados mockados (substituir pela API)
    └── styles/
        └── theme.js                # Cores, espaçamentos, tipografia
```

## Como rodar

### 1. Instalar dependências
```bash
cd EventCampus
npm install
```

### 2. Iniciar o Expo
```bash
npx expo start
```

### 3. Rodar no celular
- Instale o **Expo Go** na App Store ou Google Play
- Escaneie o QR Code que aparece no terminal

### 4. Rodar no emulador
```bash
# Android
npx expo start --android

# iOS (somente Mac)
npx expo start --ios
```

## Telas implementadas

| Tela | Funcionalidades |
|------|----------------|
| Home | Dashboard, progresso de horas, notificações, próximos eventos |
| Eventos | Listagem, busca, filtros por categoria, inscrição |
| Detalhe do Evento | Info completa, inscrição, confirmar presença |
| Minhas Inscrições | Tabs: Inscrições / Presenças / Certificados |
| QR Code | Scanner de câmera real para confirmação de presença |
| Horas | Gráfico circular, progresso por categoria, histórico |
| Certificados | Upload, status de análise, histórico aprovados |

## Conectar ao back-end

Substitua os dados em `src/services/mockData.js` por chamadas à sua API:

```js
// Exemplo com axios
import axios from 'axios';

const api = axios.create({ baseURL: 'http://SEU_IP:8080/api' });

export async function getEventos() {
  const { data } = await api.get('/eventos');
  return data;
}

export async function inscreverEvento(eventoId, alunoId) {
  const { data } = await api.post(`/inscricoes`, { eventoId, alunoId });
  return data;
}
```

## Próximos passos

- [ ] Tela de Login / Cadastro
- [ ] Integração com API Spring Boot
- [ ] Telas do Professor/Organizador (web)
- [ ] Painel Administrativo (web)
- [ ] Push notifications (Expo Notifications)
- [ ] Modo offline (AsyncStorage)
