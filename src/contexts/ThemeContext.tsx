import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { ThemeName } from "@/types";
import { obterTemaSalvo, salvarTema } from "@/storage/storage";

interface Paleta {
  fundo: string;
  fundoCartao: string;
  texto: string;
  textoSecundario: string;
  primaria: string;
  borda: string;
}

const paletaClara: Paleta = {
  fundo: "#F5F6FA",
  fundoCartao: "#FFFFFF",
  texto: "#1A1A1A",
  textoSecundario: "#6B7280",
  primaria: "#1D4ED8",
  borda: "#E5E7EB",
};

const paletaEscura: Paleta = {
  fundo: "#121212",
  fundoCartao: "#1E1E1E",
  texto: "#F5F5F5",
  textoSecundario: "#A0A0A0",
  primaria: "#60A5FA",
  borda: "#2A2A2A",
};

interface ThemeContextData {
  tema: ThemeName;
  paleta: Paleta;
  alternarTema: () => void;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const temaDoSistema = useColorScheme();
  const [tema, setTema] = useState<ThemeName>(
    temaDoSistema === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    obterTemaSalvo().then((temaSalvo) => {
      if (temaSalvo) setTema(temaSalvo);
    });
  }, []);

  const alternarTema = () => {
    setTema((atual) => {
      const novoTema = atual === "light" ? "dark" : "light";
      salvarTema(novoTema);
      return novoTema;
    });
  };

  const paleta = tema === "light" ? paletaClara : paletaEscura;

  const valor = useMemo(
    () => ({ tema, paleta, alternarTema }),
    [tema, paleta]
  );

  return (
    <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextData {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return contexto;
}
