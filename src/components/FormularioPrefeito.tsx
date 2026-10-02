import React, { useState } from "react";
import { StyleSheet, Image, View, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { ThemedButton } from "./ThemedButton";
import { ThemedInput } from "./ThemedInput";
import { Prefeito } from "@/types";

interface Props {
  valoresIniciais: Prefeito;
  salvando?: boolean;
  onSalvar: (dados: Prefeito) => void;
  onCancelar?: () => void;
}

export function FormularioPrefeito({
  valoresIniciais,
  salvando = false,
  onSalvar,
  onCancelar,
}: Props) {
  const { paleta } = useTheme();
  const [dados, setDados] = useState<Prefeito>(valoresIniciais);

  async function copiarParaPermanente(uriTemporario: string): Promise<string> {
    const nomeArquivo = `foto_prefeito_${Date.now()}.jpg`;
    const destino = FileSystem.documentDirectory + nomeArquivo;
    await FileSystem.copyAsync({ from: uriTemporario, to: destino });
    return destino;
  }

  function atualizarCampo<K extends keyof Prefeito>(campo: K, valor: Prefeito[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function escolherFotoDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!resultado.canceled) {
      const uriPermanente = await copiarParaPermanente(resultado.assets[0].uri);
      atualizarCampo("fotoUri", uriPermanente);
    }
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissao necessaria", "Autorize o uso da camera para tirar a foto.");
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!resultado.canceled) {
      const uriPermanente = await copiarParaPermanente(resultado.assets[0].uri);
      atualizarCampo("fotoUri", uriPermanente);
    }
  }

  function validarEEnviar() {
    if (!dados.nome.trim() || !dados.cidade.trim()) {
      Alert.alert("Atencao", "Preencha ao menos o nome e a cidade.");
      return;
    }
    onSalvar(dados);
  }

  return (
    <ThemedView style={estilos.container}>
      <View style={estilos.fotoContainer}>
        {dados.fotoUri ? (
          <Image source={{ uri: dados.fotoUri }} style={estilos.foto} />
        ) : (
          <View
            style={[
              estilos.foto,
              estilos.fotoPlaceholder,
              { borderColor: paleta.borda },
            ]}
          >
            <ThemedText variante="legenda">Sem foto</ThemedText>
          </View>
        )}
        <View style={estilos.botoesFoto}>
          <ThemedButton titulo="Tirar foto" variante="secundario" onPress={tirarFoto} />
          <ThemedButton
            titulo="Escolher da galeria"
            variante="secundario"
            onPress={escolherFotoDaGaleria}
          />
        </View>
      </View>

      <ThemedInput
        rotulo="Nome completo *"
        value={dados.nome}
        onChangeText={(v) => atualizarCampo("nome", v)}
        placeholder="Ex: Maria da Silva"
      />
      <ThemedInput
        rotulo="Cargo"
        value={dados.cargo}
        onChangeText={(v) => atualizarCampo("cargo", v)}
        placeholder="Ex: Prefeita Municipal"
      />
      <ThemedInput
        rotulo="Cidade *"
        value={dados.cidade}
        onChangeText={(v) => atualizarCampo("cidade", v)}
        placeholder="Ex: Mendes - RJ"
      />
      <ThemedInput
        rotulo="Partido"
        value={dados.partido}
        onChangeText={(v) => atualizarCampo("partido", v)}
        placeholder="Ex: PXX"
      />
      <ThemedInput
        rotulo="Telefone"
        value={dados.telefone}
        onChangeText={(v) => atualizarCampo("telefone", v)}
        placeholder="(XX) XXXXX-XXXX"
        keyboardType="phone-pad"
      />
      <ThemedInput
        rotulo="E-mail"
        value={dados.email}
        onChangeText={(v) => atualizarCampo("email", v)}
        placeholder="gabinete@prefeitura.gov.br"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={estilos.linhaBotoes}>
        {onCancelar && (
          <ThemedButton titulo="Cancelar" variante="secundario" onPress={onCancelar} />
        )}
        <ThemedButton titulo="Salvar" carregando={salvando} onPress={validarEEnviar} />
      </View>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  container: { gap: 12 },
  fotoContainer: { alignItems: "center", gap: 10, marginBottom: 8 },
  foto: { width: 110, height: 110, borderRadius: 55 },
  fotoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  botoesFoto: { flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  linhaBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
});