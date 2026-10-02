import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import bcryptjs from "bcryptjs";
import * as ExpoCrypto from "expo-crypto";
import {
  inserirUsuario,
  buscarUsuarioPorNome,
  atualizarBiometriaUsuario,
} from "@/database/database";
import { salvarUltimoUsuario } from "@/storage/storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  dispositivoSuportaBiometria,
  autenticarComBiometria,
} from "@/services/biometrics";

// Configura o bcryptjs para usar expo-crypto como fonte de aleatoriedade.
// Necessario porque o Hermes (engine JS do React Native) nao expoe
// o modulo 'crypto' do Node nem a Web Crypto API que o bcryptjs espera.
bcryptjs.setRandomFallback((len: number) => {
  const buf = ExpoCrypto.getRandomBytes(len);
  return Array.from(buf);
});

export type CadastroResultado =
  | { sucesso: true }
  | {
      sucesso: false;
      erro: "usuario_duplicado" | "db_indisponivel" | "validacao";
      mensagem: string;
    };

interface UsuarioContextData {
  cadastrar: (nomeUsuario: string, senha: string) => Promise<CadastroResultado>;
  autenticar: (nomeUsuario: string, senha: string) => Promise<boolean>;
  habilitarBiometria: (nomeUsuario: string) => Promise<boolean>;
  carregando: boolean;
}

const UsuarioContext = createContext<UsuarioContextData | undefined>(undefined);

export function UsuarioProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(false);
  const { autenticarPorCredenciais } = useAuth();

  async function cadastrar(
    nomeUsuario: string,
    senha: string
  ): Promise<CadastroResultado> {
    if (nomeUsuario.length < 3 || nomeUsuario.length > 50) {
      return {
        sucesso: false,
        erro: "validacao",
        mensagem: "O nome de usuario deve ter entre 3 e 50 caracteres.",
      };
    }
    if (senha.length < 6 || senha.length > 128) {
      return {
        sucesso: false,
        erro: "validacao",
        mensagem: "A senha deve ter entre 6 e 128 caracteres.",
      };
    }

    setCarregando(true);
    try {
      const senhaHash = await bcryptjs.hash(senha, 10);
      const criadoEm = new Date().toISOString();
      inserirUsuario(nomeUsuario, senhaHash, criadoEm);
      return { sucesso: true };
    } catch (erro: unknown) {
      const msg = (erro as Error)?.message ?? String(erro);
      console.error("[cadastrar] erro:", msg);
      if (
        msg.includes("UNIQUE constraint failed") ||
        msg.includes("SQLITE_CONSTRAINT")
      ) {
        return {
          sucesso: false,
          erro: "usuario_duplicado",
          mensagem: "Este nome de usuario ja esta em uso.",
        };
      }
      return {
        sucesso: false,
        erro: "db_indisponivel",
        mensagem: "Erro: " + msg,
      };
    } finally {
      setCarregando(false);
    }
  }

  async function autenticar(
    nomeUsuario: string,
    senha: string
  ): Promise<boolean> {
    if (!nomeUsuario || !senha) return false;

    setCarregando(true);
    try {
      const usuario = buscarUsuarioPorNome(nomeUsuario);
      if (!usuario) return false;

      const senhaValida = await bcryptjs.compare(senha, usuario.senhaHash);
      if (senhaValida) {
        autenticarPorCredenciais();
        await salvarUltimoUsuario(nomeUsuario);
      }
      return senhaValida;
    } catch (erro: unknown) {
      console.error("[autenticar] erro:", (erro as Error)?.message);
      return false;
    } finally {
      setCarregando(false);
    }
  }

  async function habilitarBiometria(nomeUsuario: string): Promise<boolean> {
    const suporta = await dispositivoSuportaBiometria();
    if (!suporta) return false;
    const confirmado = await autenticarComBiometria();
    if (!confirmado) return false;
    atualizarBiometriaUsuario(nomeUsuario, true);
    return true;
  }

  const valor = useMemo(
    () => ({ cadastrar, autenticar, habilitarBiometria, carregando }),
    [carregando]
  );

  return (
    <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>
  );
}

export function useUsuario(): UsuarioContextData {
  const contexto = useContext(UsuarioContext);
  if (!contexto) {
    throw new Error("useUsuario deve ser usado dentro de um UsuarioProvider");
  }
  return contexto;
}