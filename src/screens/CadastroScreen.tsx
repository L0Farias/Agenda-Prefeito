import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { useUsuario } from "@/contexts/UsuarioContext";
import { dispositivoSuportaBiometria } from "@/services/biometrics";
import { RootStackParamList } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "Cadastro">;

export function CadastroScreen({ navigation }: Props) {
  const { cadastrar, habilitarBiometria, carregando } = useUsuario();
  const insets = useSafeAreaInsets();

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erroInline, setErroInline] = useState<string | null>(null);

  async function lidarComCadastro() {
    setErroInline(null);

    const resultado = await cadastrar(nomeUsuario.trim(), senha);

    if (!resultado.sucesso) {
      setErroInline(resultado.mensagem);
      return;
    }

    // Cadastro bem-sucedido -- verificar suporte biometrico
    const suportaBiometria = await dispositivoSuportaBiometria();

    if (suportaBiometria) {
      Alert.alert(
        "Habilitar biometria",
        "Deseja usar impressao digital ou Face ID para fazer login?",
        [
          {
            text: "Sim",
            onPress: async () => {
              await habilitarBiometria(nomeUsuario.trim());
              navigation.goBack();
            },
          },
          {
            text: "Agora nao",
            style: "cancel",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Alert.alert(
        "Conta criada",
        "Sua conta foi criada com sucesso. Faca login para continuar.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={estilos.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView
          style={[
            estilos.container,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <ThemedText variante="titulo" style={estilos.titulo}>
            Criar conta
          </ThemedText>
          <ThemedText variante="corpo" style={estilos.subtitulo}>
            Preencha os campos abaixo para criar sua conta de acesso.
          </ThemedText>

          <ThemedInput
            rotulo="Nome de usuario"
            value={nomeUsuario}
            onChangeText={setNomeUsuario}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Entre 3 e 50 caracteres"
          />

          <ThemedInput
            rotulo="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="Entre 6 e 128 caracteres"
          />

          {erroInline && (
            <ThemedText variante="legenda" style={estilos.erro}>
              {erroInline}
            </ThemedText>
          )}

          <ThemedButton
            titulo="Criar conta"
            variante="primario"
            onPress={lidarComCadastro}
            carregando={carregando}
          />

          <ThemedButton
            titulo="Cancelar"
            variante="secundario"
            onPress={() => navigation.goBack()}
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flexGrow: 1 },
  container: { flex: 1, padding: 24, gap: 16 },
  titulo: { fontSize: 24, textAlign: "center", marginTop: 12 },
  subtitulo: { textAlign: "center", marginBottom: 8 },
  erro: { color: "#DC2626" },
});