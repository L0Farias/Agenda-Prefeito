import React from "react";
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  PressableProps,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";

interface Props extends PressableProps {
  titulo: string;
  carregando?: boolean;
  variante?: "primario" | "secundario" | "perigo";
}

export function ThemedButton({
  titulo,
  carregando = false,
  variante = "primario",
  disabled,
  style,
  ...props
}: Props) {
  const { paleta } = useTheme();

  const corDeFundo =
    variante === "primario"
      ? paleta.primaria
      : variante === "perigo"
      ? "#DC2626"
      : "transparent";

  const corDoTexto = variante === "secundario" ? paleta.primaria : "#FFFFFF";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || carregando}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: corDeFundo,
          borderWidth: variante === "secundario" ? 1.5 : 0,
          borderColor: paleta.primaria,
          opacity: pressed || disabled ? 0.7 : 1,
        },
        typeof style === "function" ? undefined : style,
      ]}
      {...props}
    >
      {carregando ? (
        <ActivityIndicator color={corDoTexto} />
      ) : (
        <ThemedText style={{ color: corDoTexto, fontWeight: "600" }}>
          {titulo}
        </ThemedText>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
});
