import React from "react";
import { Text, Pressable } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function ComponenteDeTeste() {
  const { tema, alternarTema } = useTheme();
  return (
    <Pressable onPress={alternarTema}>
      <Text>{tema}</Text>
    </Pressable>
  );
}

describe("ThemeContext", () => {
  it("inicia com um tema válido e alterna entre claro e escuro", async () => {
    const { getByText } = render(
      <ThemeProvider>
        <ComponenteDeTeste />
      </ThemeProvider>
    );

    const textoTema = getByText(/light|dark/);
    const temaInicial = textoTema.props.children;

    fireEvent.press(textoTema);

    await waitFor(() => {
      const novoTexto = getByText(/light|dark/);
      expect(novoTexto.props.children).not.toBe(temaInicial);
    });
  });
});
