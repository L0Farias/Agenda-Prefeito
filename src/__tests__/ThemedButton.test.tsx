import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemeProvider } from "@/contexts/ThemeContext";

function renderComTema(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("ThemedButton", () => {
  it("renderiza o título corretamente", () => {
    const { getByText } = renderComTema(
      <ThemedButton titulo="Salvar" onPress={() => {}} />
    );
    expect(getByText("Salvar")).toBeTruthy();
  });

  it("chama onPress ao ser tocado", () => {
    const aoTocar = jest.fn();
    const { getByText } = renderComTema(
      <ThemedButton titulo="Confirmar" onPress={aoTocar} />
    );

    fireEvent.press(getByText("Confirmar"));
    expect(aoTocar).toHaveBeenCalledTimes(1);
  });

  it("não exibe o texto quando está carregando (mostra o spinner no lugar)", () => {
    const { queryByText } = renderComTema(
      <ThemedButton titulo="Enviar" onPress={() => {}} carregando />
    );
    expect(queryByText("Enviar")).toBeNull();
  });
});
