import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Prefeito, PREFEITO_VAZIO } from "@/types";
import { obterPrefeito, salvarPrefeito } from "@/storage/storage";

interface PrefeitoContextData {
  prefeito: Prefeito | null;
  carregando: boolean;
  cadastrado: boolean;
  salvarPerfil: (dados: Prefeito) => Promise<void>;
}

const PrefeitoContext = createContext<PrefeitoContextData | undefined>(
  undefined
);

export function PrefeitoProvider({ children }: { children: React.ReactNode }) {
  const [prefeito, setPrefeito] = useState<Prefeito | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app, busca o perfil salvo no AsyncStorage da vez anterior.
  // É isso que garante que, ao sair e entrar no app, os dados continuam lá.
  useEffect(() => {
    obterPrefeito()
      .then((dados) => setPrefeito(dados))
      .finally(() => setCarregando(false));
  }, []);

  async function salvarPerfil(dados: Prefeito) {
    await salvarPrefeito(dados);
    setPrefeito(dados);
  }

  const valor = useMemo(
    () => ({
      prefeito,
      carregando,
      cadastrado: prefeito !== null && prefeito.nome.trim().length > 0,
      salvarPerfil,
    }),
    [prefeito, carregando]
  );

  return (
    <PrefeitoContext.Provider value={valor}>
      {children}
    </PrefeitoContext.Provider>
  );
}

export function usePrefeito(): PrefeitoContextData {
  const contexto = useContext(PrefeitoContext);
  if (!contexto) {
    throw new Error("usePrefeito deve ser usado dentro de um PrefeitoProvider");
  }
  return contexto;
}

export { PREFEITO_VAZIO };
