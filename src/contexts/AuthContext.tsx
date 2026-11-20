import React, { createContext, useContext, useMemo, useState } from "react";
import { autenticarComBiometria } from "@/services/biometrics";

interface AuthContextData {
  autenticado: boolean;
  usuarioAtual: string | null;
  carregando: boolean;
  entrar: () => Promise<boolean>;
  autenticarPorCredenciais: (nomeUsuario: string) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const entrar = async (): Promise<boolean> => {
    setCarregando(true);
    try {
      const sucesso = await autenticarComBiometria();
      setAutenticado(sucesso);
      return sucesso;
    } finally {
      setCarregando(false);
    }
  };

  const autenticarPorCredenciais = (nomeUsuario: string) => {
    setUsuarioAtual(nomeUsuario);
    setAutenticado(true);
  };

  const sair = () => {
    setUsuarioAtual(null);
    setAutenticado(false);
  };

  const valor = useMemo(
    () => ({ autenticado, usuarioAtual, carregando, entrar, autenticarPorCredenciais, sair }),
    [autenticado, usuarioAtual, carregando]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return contexto;
}