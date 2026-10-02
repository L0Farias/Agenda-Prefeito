import AsyncStorage from "@react-native-async-storage/async-storage";
import { Prefeito, ThemeName } from "@/types";

// IMPORTANTE: todo dado salvo aqui com AsyncStorage.setItem fica gravado
// de verdade no armazenamento do dispositivo. Quando o app é fechado e
// aberto de novo, o AsyncStorage.getItem devolve o mesmo valor salvo da
// última vez — é assim que garantimos que os dados do prefeito "não se
// perdem" ao sair e entrar no app, como pedido no trabalho.

const CHAVE_PREFEITO = "@agendaPrefeito:prefeito";
const CHAVE_TEMA = "@agendaPrefeito:tema";

export async function salvarPrefeito(prefeito: Prefeito): Promise<void> {
  await AsyncStorage.setItem(CHAVE_PREFEITO, JSON.stringify(prefeito));
}

export async function obterPrefeito(): Promise<Prefeito | null> {
  const valor = await AsyncStorage.getItem(CHAVE_PREFEITO);
  return valor ? (JSON.parse(valor) as Prefeito) : null;
}

export async function salvarTema(tema: ThemeName): Promise<void> {
  await AsyncStorage.setItem(CHAVE_TEMA, tema);
}

export async function obterTemaSalvo(): Promise<ThemeName | null> {
  const valor = await AsyncStorage.getItem(CHAVE_TEMA);
  return valor === "light" || valor === "dark" ? valor : null;
}

// ---- Último usuário autenticado ----

const CHAVE_ULTIMO_USUARIO = "@agendaPrefeito:ultimoUsuario";

export async function salvarUltimoUsuario(nomeUsuario: string): Promise<void> {
  await AsyncStorage.setItem(CHAVE_ULTIMO_USUARIO, nomeUsuario);
}

export async function obterUltimoUsuario(): Promise<string | null> {
  return AsyncStorage.getItem(CHAVE_ULTIMO_USUARIO);
}
