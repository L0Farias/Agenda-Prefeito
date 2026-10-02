import React, { useState } from "react";
import { StyleSheet, View, Alert, Switch } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { ThemedButton } from "./ThemedButton";
import { ThemedInput } from "./ThemedInput";
import { useTheme } from "@/contexts/ThemeContext";
import { Compromisso, NovoCompromisso } from "@/types";

interface Props {
  valoresIniciais?: Compromisso;
  salvando?: boolean;
  usarLocalizacaoAtual: boolean;
  onMudarUsarLocalizacao: (valor: boolean) => void;
  onSalvar: (dados: NovoCompromisso) => void;
  onCancelar: () => void;
}

export function FormularioCompromisso({
  valoresIniciais,
  salvando = false,
  usarLocalizacaoAtual,
  onMudarUsarLocalizacao,
  onSalvar,
  onCancelar,
}: Props) {
  const { paleta } = useTheme();
  const [titulo, setTitulo] = useState(valoresIniciais?.titulo ?? "");
  const [descricao, setDescricao] = useState(valoresIniciais?.descricao ?? "");
  const [data, setData] = useState(valoresIniciais?.data ?? "");
  const [hora, setHora] = useState(valoresIniciais?.hora ?? "");
  const [local, setLocal] = useState(valoresIniciais?.local ?? "");

  function validarEEnviar() {
    if (!titulo.trim() || !data.trim() || !hora.trim() || !local.trim()) {
      Alert.alert("Atencao", "Preencha titulo, data, hora e local do compromisso.");
      return;
    }
    onSalvar({ titulo, descricao, data, hora, local });
  }

  return (
    <ThemedView style={estilos.container}>
      <ThemedText variante="titulo">
        {valoresIniciais ? "Editar compromisso" : "Novo compromisso"}
      </ThemedText>

      <ThemedInput
        rotulo="Titulo *"
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ex: Inauguracao da praca"
      />
      <ThemedInput
        rotulo="Descricao"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Detalhes do compromisso (opcional)"
        multiline
        style={{ minHeight: 72 }}
      />

      <View style={estilos.linhaDupla}>
        <View style={estilos.campoMetade}>
          <ThemedInput
            rotulo="Data * (dd/mm/aaaa)"
            value={data}
            onChangeText={setData}
            placeholder="25/12/2026"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={estilos.campoMetade}>
          <ThemedInput
            rotulo="Hora * (hh:mm)"
            value={hora}
            onChangeText={setHora}
            placeholder="14:30"
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      <ThemedInput
        rotulo="Local *"
        value={local}
        onChangeText={setLocal}
        placeholder="Ex: Praca Central"
      />

      {!valoresIniciais && (
        <View style={[estilos.linhaSwitch, { borderColor: paleta.borda }]}>
          <View style={{ flex: 1 }}>
            <ThemedText variante="corpo">Marcar localizacao atual</ThemedText>
            <ThemedText variante="legenda">
              Usa o GPS do celular para salvar as coordenadas deste
              compromisso e mostra-lo no mapa.
            </ThemedText>
          </View>
          <Switch
            value={usarLocalizacaoAtual}
            onValueChange={onMudarUsarLocalizacao}
            trackColor={{ true: paleta.primaria }}
          />
        </View>
      )}

      <View style={estilos.linhaBotoes}>
        <ThemedButton titulo="Cancelar" variante="secundario" onPress={onCancelar} />
        <ThemedButton titulo="Salvar" carregando={salvando} onPress={validarEEnviar} />
      </View>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  container: { gap: 12 },
  linhaDupla: { flexDirection: "row", gap: 12 },
  campoMetade: { flex: 1 },
  linhaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  linhaBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 4,
  },
});