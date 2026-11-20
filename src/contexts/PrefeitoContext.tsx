import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Prefeito, PREFEITO_VAZIO } from "@/types";
import { obterPrefeito, salvarPrefeito } from "@/storage/storage";
import { useAuth } from "@/contexts/AuthContext";

interface PrefeitoContextData {
  prefeito: Prefeito | null;
  carregando: boolean;
  cadastrado: boolean;
  salvarPerfil: (dados: Prefeito) => Promise<void>;
}

const PrefeitoContext = createContext<PrefeitoContextData | undefined>(undefined);

export function PrefeitoProvider({ children }: { children: React.ReactNode }) {
  const { usuarioAtual } = useAuth();
  const [prefeito, setPrefeito] = useState<Prefeito | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Recarrega o perfil sempre que o usuario logado mudar
  useEffect(() => {
    if (!usuarioAtual) {
      setPrefeito(null);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    obterPrefeito(usuarioAtual)
      .then((dados) => setPrefeito(dados))
      .finally(() => setCarregando(false));
  }, [usuarioAtual]);

  async function salvarPerfil(dados: Prefeito) {
    if (!usuarioAtual) return;
    await salvarPrefeito(usuarioAtual, dados);
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