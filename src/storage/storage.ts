import AsyncStorage from "@react-native-async-storage/async-storage";
import { Prefeito, ThemeName } from "@/types";

// Chaves globais (compartilhadas entre usuarios)
const CHAVE_TEMA = "@agendaPrefeito:tema";
const CHAVE_ULTIMO_USUARIO = "@agendaPrefeito:ultimoUsuario";

// Chaves por usuario
function chavePrefeito(nomeUsuario: string): string {
  return "@agendaPrefeito:prefeito:" + nomeUsuario;
}

// Perfil do prefeito -- isolado por usuario
export async function salvarPrefeito(nomeUsuario: string, prefeito: Prefeito): Promise<void> {
  await AsyncStorage.setItem(chavePrefeito(nomeUsuario), JSON.stringify(prefeito));
}

export async function obterPrefeito(nomeUsuario: string): Promise<Prefeito | null> {
  const valor = await AsyncStorage.getItem(chavePrefeito(nomeUsuario));
  return valor ? (JSON.parse(valor) as Prefeito) : null;
}

// Tema -- global (preferencia do dispositivo, nao do usuario)
export async function salvarTema(tema: ThemeName): Promise<void> {
  await AsyncStorage.setItem(CHAVE_TEMA, tema);
}

export async function obterTemaSalvo(): Promise<ThemeName | null> {
  const valor = await AsyncStorage.getItem(CHAVE_TEMA);
  return valor === "light" || valor === "dark" ? valor : null;
}

// Ultimo usuario autenticado
export async function salvarUltimoUsuario(nomeUsuario: string): Promise<void> {
  await AsyncStorage.setItem(CHAVE_ULTIMO_USUARIO, nomeUsuario);
}

export async function obterUltimoUsuario(): Promise<string | null> {
  return AsyncStorage.getItem(CHAVE_ULTIMO_USUARIO);
}