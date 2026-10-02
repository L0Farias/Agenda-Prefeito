import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props extends TextProps {
  variante?: "titulo" | "corpo" | "legenda";
}

export function ThemedText({ variante = "corpo", style, ...props }: Props) {
  const { paleta } = useTheme();

  const estiloVariante =
    variante === "titulo"
      ? estilos.titulo
      : variante === "legenda"
      ? estilos.legenda
      : estilos.corpo;

  const cor = variante === "legenda" ? paleta.textoSecundario : paleta.texto;

  return <Text maxFontSizeMultiplier={1.3} style={[estiloVariante, { color: cor }, style]} {...props} />;
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 20, fontWeight: "700" },
  corpo: { fontSize: 15, fontWeight: "400" },
  legenda: { fontSize: 12, fontWeight: "400" },
});
