import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import * as Crypto from "expo-crypto";
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

// Gera um salt aleatorio de 16 bytes em hex (32 chars)
function gerarSalt(): string {
  const bytes = Crypto.getRandomBytes(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Gera hash SHA-256 de (salt + senha) e retorna "salt:hash"
async function hashSenha(senha: string): Promise<string> {
  const salt = gerarSalt();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + senha
  );
  return salt + ":" + hash;
}

// Verifica se a senha bate com o hash armazenado no formato "salt:hash"
async function verificarSenha(senha: string, senhaHash: string): Promise<boolean> {
  const partes = senhaHash.split(":");
  if (partes.length !== 2) return false;
  const [salt, hashEsperado] = partes;
  const hashTentativa = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + senha
  );
  return hashTentativa === hashEsperado;
}

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
      const senhaHash = await hashSenha(senha);
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
        mensagem: "Erro ao salvar: " + msg,
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

      const senhaValida = await verificarSenha(senha, usuario.senhaHash);
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