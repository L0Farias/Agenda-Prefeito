export type ThemeName = "light" | "dark";

export interface Prefeito {
  nome: string;
  cargo: string;
  cidade: string;
  partido: string;
  telefone: string;
  email: string;
  fotoUri: string | null;
}

export const PREFEITO_VAZIO: Prefeito = {
  nome: "",
  cargo: "Prefeito(a) Municipal",
  cidade: "",
  partido: "",
  telefone: "",
  email: "",
  fotoUri: null,
};

export interface Compromisso {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  latitude: number | null;
  longitude: number | null;
  fotoUri: string | null;
  criadoEm: string;
}

export interface NovoCompromisso {
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  latitude?: number | null;
  longitude?: number | null;
  fotoUri?: string | null;
}

export interface Usuario {
  id: number;
  nomeUsuario: string;
  senhaHash: string;
  criadoEm: string;
  biometriaHabilitada: boolean;
}

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  Cadastro: undefined;
};