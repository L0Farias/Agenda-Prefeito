import React, { useState } from "react";
import { StyleSheet, View, Alert, Switch, Image, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
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

async function copiarParaPermanente(uriTemporario: string): Promise<string> {
  const dir = FileSystem.documentDirectory;
  if (!dir) throw new Error("documentDirectory indisponivel");
  const nomeArquivo = "foto_compromisso_" + Date.now() + ".jpg";
  const destino = dir + nomeArquivo;
  await FileSystem.copyAsync({ from: uriTemporario, to: destino });
  return destino;
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
  const [fotoUri, setFotoUri] = useState<string | null>(valoresIniciais?.fotoUri ?? null);

  async function escolherDaGaleria() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permissao necessaria", "Autorize o acesso a galeria nas configuracoes do dispositivo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as any,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = await copiarParaPermanente(result.assets[0].uri);
        setFotoUri(uri);
      }
    } catch (e: any) {
      Alert.alert("Erro", "Nao foi possivel acessar a galeria: " + (e?.message ?? ""));
    }
  }

  async function tirarFoto() {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permissao necessaria", "Autorize o uso da camera nas configuracoes do dispositivo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = await copiarParaPermanente(result.assets[0].uri);
        setFotoUri(uri);
      }
    } catch (e: any) {
      Alert.alert("Erro", "Nao foi possivel acessar a camera: " + (e?.message ?? ""));
    }
  }

  function removerFoto() {
    setFotoUri(null);
  }

  function mostrarOpcoesFoto() {
    const botoes: any[] = [
      { text: "Tirar foto", onPress: tirarFoto },
      { text: "Escolher da galeria", onPress: escolherDaGaleria },
    ];
    if (fotoUri) {
      botoes.push({ text: "Remover foto", style: "destructive", onPress: removerFoto });
    }
    botoes.push({ text: "Cancelar", style: "cancel" });
    Alert.alert("Foto do compromisso", "Como deseja adicionar a foto?", botoes);
  }

  function validarEEnviar() {
    if (!titulo.trim() || !data.trim() || !hora.trim() || !local.trim()) {
      Alert.alert("Atencao", "Preencha titulo, data, hora e local do compromisso.");
      return;
    }
    onSalvar({ titulo, descricao, data, hora, local, fotoUri });
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

      <ThemedText variante="legenda">Foto (opcional)</ThemedText>
      {fotoUri ? (
        <Pressable onPress={mostrarOpcoesFoto}>
          <Image
            source={{ uri: fotoUri }}
            style={[estilos.fotoPreview, { borderColor: paleta.borda }]}
            resizeMode="cover"
          />
          <ThemedText variante="legenda" style={{ textAlign: "center", marginTop: 4 }}>
            Toque para alterar ou remover
          </ThemedText>
        </Pressable>
      ) : (
        <View style={estilos.botoesFoto}>
          <ThemedButton titulo="Tirar foto" variante="secundario" onPress={tirarFoto} style={{ flex: 1 }} />
          <ThemedButton titulo="Da galeria" variante="secundario" onPress={escolherDaGaleria} style={{ flex: 1 }} />
        </View>
      )}

      {!valoresIniciais && (
        <View style={[estilos.linhaSwitch, { borderColor: paleta.borda }]}>
          <View style={{ flex: 1 }}>
            <ThemedText variante="corpo">Marcar localizacao atual</ThemedText>
            <ThemedText variante="legenda">
              Usa o GPS do celular para salvar as coordenadas deste compromisso e mostra-lo no mapa.
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
  fotoPreview: { width: "100%", height: 180, borderRadius: 10, borderWidth: 1 },
  botoesFoto: { flexDirection: "row", gap: 10 },
  linhaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  linhaBotoes: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 4 },
});