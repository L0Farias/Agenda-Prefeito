import React, { createContext, useContext, useMemo, useState } from "react";
import { autenticarComBiometria } from "@/services/biometrics";

interface AuthContextData {
  autenticado: boolean;
  carregando: boolean;
  entrar: () => Promise<boolean>;
  autenticarPorCredenciais: () => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
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

  const autenticarPorCredenciais = () => setAutenticado(true);
  const sair = () => setAutenticado(false);

  const valor = useMemo(
    () => ({ autenticado, carregando, entrar, autenticarPorCredenciais, sair }),
    [autenticado, carregando]
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