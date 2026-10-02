# Agenda do Prefeito

Aplicativo mobile desenvolvido em React Native com Expo para gestao de compromissos e agenda de autoridades municipais.

## Tecnologias

- React Native + Expo SDK 57
- TypeScript
- SQLite (expo-sqlite) para persistencia de dados
- AsyncStorage para preferencias do usuario
- React Navigation (Stack + Bottom Tabs)
- Leaflet 1.9.4 + OpenStreetMap + Esri World Imagery (mapa via WebView)
- bcryptjs + expo-crypto para autenticacao segura
- expo-local-authentication para biometria

## Funcionalidades

- Cadastro e login de usuarios com senha criptografada (bcrypt)
- Login biometrico opcional (impressao digital / Face ID)
- Agenda de compromissos com data, hora, local e coordenadas GPS
- Mapa interativo com marcadores dos compromissos
- Perfil do prefeito com foto persistente
- Tema claro e escuro
- Layout responsivo para diferentes tamanhos de tela

## Como rodar

```bash
npm install
npx expo start
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