import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props extends ViewProps {
  variante?: "fundo" | "cartao";
}

export function ThemedView({ variante = "fundo", style, ...props }: Props) {
  const { paleta } = useTheme();
  const corDeFundo = variante === "cartao" ? paleta.fundoCartao : paleta.fundo;

  return <View style={[{ backgroundColor: corDeFundo }, style]} {...props} />;
}
