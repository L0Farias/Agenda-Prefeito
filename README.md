# Agenda do Prefeito

Aplicativo mobile desenvolvido em React Native com Expo para gestao de compromissos e agenda de autoridades municipais.

## Tecnologias

- React Native + Expo SDK 57
- TypeScript
- SQLite (expo-sqlite) para persistencia de dados
- AsyncStorage para preferencias do usuario
- React Navigation (Stack + Bottom Tabs)
- Leaflet 1.9.4 + OpenStreetMap + Esri World Imagery (mapa via WebView, offline)
- expo-crypto para autenticacao segura (SHA-256 com salt)
- expo-local-authentication para biometria

## Funcionalidades

- Cadastro e login de usuarios com senha criptografada (SHA-256 + salt via expo-crypto)
- Login biometrico opcional (impressao digital / Face ID)
- Agenda de compromissos com data, hora, local, coordenadas GPS e foto
- Mapa interativo com marcadores dos compromissos (Leaflet embutido, sem Google Maps)
- Perfil do prefeito com foto persistente
- Tema claro e escuro (toggle sempre visivel na aba Perfil)
- Layout responsivo para diferentes tamanhos de tela (safe areas, KeyboardAvoidingView)

## Como rodar

```bash
npm install
npx expo start --clear
```

Escaneie o QR code com o app Expo Go (Android/iOS) ou pressione `a` para abrir no emulador Android.

## Estrutura

```
src/
  screens/       # Telas do app
  components/    # Componentes reutilizaveis
  contexts/      # Contextos React (Auth, Usuario, Tema, Prefeito)
  database/      # SQLite (compromissos e usuarios)
  navigation/    # Stack e Tab navigators
  services/      # Localizacao e biometria
  storage/       # AsyncStorage
  types/         # Tipos TypeScript
```

## Versoes

- **v1.5** - Atualizacao e correcao de bugs
  - Mapa corrigido: Leaflet embutido inline sem dependencia de CDN
  - Foto nos compromissos (camera e galeria)
  - Toggle de tema escuro sempre visivel
  - Correcao de APIs deprecadas do expo SDK 57 (expo-file-system/legacy, MediaType)
  - Autenticacao corrigida: bcryptjs substituido por expo-crypto nativo
  - Layout responsivo para diferentes tamanhos de tela

- **v1.0** - Primeira versao