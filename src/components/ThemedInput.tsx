import React from "react";
import { TextInput, TextInputProps, StyleSheet, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";

interface Props extends TextInputProps {
  rotulo: string;
}

export function ThemedInput({ rotulo, style, ...props }: Props) {
  const { paleta } = useTheme();

  return (
    <View style={estilos.container}>
      <ThemedText variante="legenda">{rotulo}</ThemedText>
      <TextInput
        maxFontSizeMultiplier={1.3}
        placeholderTextColor={paleta.textoSecundario}
        style={[
          estilos.input,
          { color: paleta.texto, borderColor: paleta.borda },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { gap: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
});
