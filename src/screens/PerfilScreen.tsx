import React, { useState } from "react";
import { ScrollView, StyleSheet, Image, View, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { FormularioPrefeito } from "@/components/FormularioPrefeito";
import { usePrefeito, PREFEITO_VAZIO } from "@/contexts/PrefeitoContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Prefeito } from "@/types";

export function PerfilScreen() {
  const { prefeito, cadastrado, carregando, salvarPerfil } = usePrefeito();
  const { tema, alternarTema, paleta } = useTheme();
  const { sair } = useAuth();
  const insets = useSafeAreaInsets();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  if (carregando) {
    return (
      <ThemedView style={estilos.centralizado}>
        <ThemedText variante="corpo">Carregando perfil...</ThemedText>
      </ThemedView>
    );
  }

  async function lidarComSalvar(dados: Prefeito) {
    setSalvando(true);
    try {
      await salvarPerfil(dados);
      setEditando(false);
    } finally {
      setSalvando(false);
    }
  }

  if (!cadastrado || editando) {
    return (
      <ScrollView contentContainerStyle={estilos.scroll}>
        <FormularioPrefeito
          valoresIniciais={prefeito ?? PREFEITO_VAZIO}
          salvando={salvando}
          onSalvar={lidarComSalvar}
          onCancelar={cadastrado ? () => setEditando(false) : undefined}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[estilos.scroll, { paddingBottom: insets.bottom + 24 }]}>
      <ThemedView style={estilos.cabecalho}>
        {prefeito!.fotoUri ? (
          <Image source={{ uri: prefeito!.fotoUri }} style={estilos.foto} />
        ) : (
          <View style={[estilos.foto, estilos.fotoPlaceholder, { borderColor: paleta.borda }]}>
            <ThemedText variante="legenda">Sem foto</ThemedText>
          </View>
        )}
        <ThemedText variante="titulo">{prefeito!.nome}</ThemedText>
        <ThemedText variante="corpo">{prefeito!.cargo}</ThemedText>
        <ThemedText variante="legenda">{prefeito!.cidade}</ThemedText>
      </ThemedView>

      <ThemedView variante="cartao" style={[estilos.dados, { borderColor: paleta.borda }]}>
        <LinhaDado rotulo="Partido" valor={prefeito!.partido || "---"} />
        <LinhaDado rotulo="Telefone" valor={prefeito!.telefone || "---"} />
        <LinhaDado rotulo="E-mail" valor={prefeito!.email || "---"} />
      </ThemedView>

      <ThemedButton titulo="Editar dados" variante="secundario" onPress={() => setEditando(true)} />

      <ThemedView
        variante="cartao"
        style={[estilos.linhaConfig, { borderColor: paleta.borda }]}
      >
        <ThemedText variante="corpo">Tema escuro</ThemedText>
        <Switch
          value={tema === "dark"}
          onValueChange={alternarTema}
          trackColor={{ true: paleta.primaria }}
        />
      </ThemedView>

      <ThemedButton titulo="Sair" variante="perigo" onPress={sair} />
    </ScrollView>
  );
}

function LinhaDado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <ThemedView variante="cartao" style={estilos.linhaDado}>
      <ThemedText variante="legenda">{rotulo}</ThemedText>
      <ThemedText variante="corpo">{valor}</ThemedText>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  centralizado: { flex: 1, justifyContent: "center", alignItems: "center" },
  cabecalho: { alignItems: "center", gap: 4 },
  foto: { width: 110, height: 110, borderRadius: 55, marginBottom: 8 },
  fotoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  dados: { borderWidth: 1, borderRadius: 12, padding: 4 },
  linhaDado: { paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  linhaConfig: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});