import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
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
import { useAuth } from "@/contexts/AuthContext";
import { obterUltimoUsuario } from "@/storage/storage";
import { buscarUsuarioPorNome } from "@/database/database";
import {
  dispositivoSuportaBiometria,
  autenticarComBiometria,
} from "@/services/biometrics";
import { RootStackParamList } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { autenticar, carregando } = useUsuario();
  const { autenticarPorCredenciais } = useAuth();
  const insets = useSafeAreaInsets();

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erroInline, setErroInline] = useState<string | null>(null);
  const [mostrarBiometria, setMostrarBiometria] = useState(false);

  useEffect(() => {
    async function inicializar() {
      const ultimo = await obterUltimoUsuario();
      if (!ultimo) return;
      setNomeUsuario(ultimo);
      const usuario = buscarUsuarioPorNome(ultimo);
      if (!usuario?.biometriaHabilitada) return;
      const suporta = await dispositivoSuportaBiometria();
      if (suporta) setMostrarBiometria(true);
    }
    inicializar();
  }, []);

  async function lidarComLogin() {
    setErroInline(null);
    if (!nomeUsuario.trim() || !senha) {
      setErroInline("Preencha o nome de usuario e a senha para continuar.");
      return;
    }
    const sucesso = await autenticar(nomeUsuario.trim(), senha);
    if (!sucesso) {
      setErroInline("Credenciais invalidas. Verifique seus dados e tente novamente.");
    }
  }

  async function lidarComLoginBiometrico() {
    const sucesso = await autenticarComBiometria();
    if (sucesso) {
      autenticarPorCredenciais();
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
          <ThemedText style={estilos.icone}>{"🏛️"}</ThemedText>
          <ThemedText variante="titulo" style={estilos.titulo}>
            Agenda do Prefeito
          </ThemedText>
          <ThemedText style={estilos.subtitulo}>
            Sistema de Gestao de Compromissos
          </ThemedText>

          <ThemedInput
            rotulo="Nome de usuario"
            value={nomeUsuario}
            onChangeText={setNomeUsuario}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Seu nome de usuario"
            accessibilityLabel="Nome de usuario"
          />

          <ThemedInput
            rotulo="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="Sua senha"
            accessibilityLabel="Senha"
          />

          {erroInline && (
            <ThemedText variante="legenda" style={estilos.erro}>
              {erroInline}
            </ThemedText>
          )}

          <ThemedButton
            titulo="Entrar"
            variante="primario"
            onPress={lidarComLogin}
            carregando={carregando}
          />

          {mostrarBiometria && (
            <ThemedButton
              titulo="Entrar com biometria"
              variante="secundario"
              onPress={lidarComLoginBiometrico}
            />
          )}

          <ThemedButton
            titulo="Criar conta"
            variante="secundario"
            onPress={() => navigation.navigate("Cadastro")}
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center" },
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  icone: { fontSize: 72, textAlign: "center" },
  titulo: { fontSize: 24, textAlign: "center" },
  subtitulo: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  erro: { color: "#DC2626" },
});