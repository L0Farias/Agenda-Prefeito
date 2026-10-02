import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { ThemedButton } from "./ThemedButton";
import { Compromisso } from "@/types";

interface Props {
  compromisso: Compromisso;
  onEditar: (compromisso: Compromisso) => void;
  onExcluir: (id: number) => void;
}

export function CompromissoCard({ compromisso, onEditar, onExcluir }: Props) {
  const { paleta } = useTheme();

  return (
    <ThemedView
      variante="cartao"
      style={[estilos.cartao, { borderColor: paleta.borda }]}
    >
      {compromisso.fotoUri && (
        <Image
          source={{ uri: compromisso.fotoUri }}
          style={estilos.foto}
          resizeMode="cover"
        />
      )}

      <ThemedText variante="titulo" style={{ flexShrink: 1 }}>
        {compromisso.titulo}
      </ThemedText>

      <View style={estilos.linhaInfo}>
        <Ionicons name="calendar-outline" size={16} color={paleta.textoSecundario} />
        <ThemedText variante="corpo">{compromisso.data}</ThemedText>
        <Ionicons name="time-outline" size={16} color={paleta.textoSecundario} />
        <ThemedText variante="corpo">{compromisso.hora}</ThemedText>
      </View>

      <View style={estilos.linhaInfo}>
        <Ionicons name="location-outline" size={16} color={paleta.textoSecundario} />
        <ThemedText variante="corpo" style={{ flexShrink: 1, flexWrap: "wrap" }}>
          {compromisso.local}
        </ThemedText>
      </View>

      {!!compromisso.descricao && (
        <ThemedText variante="legenda">{compromisso.descricao}</ThemedText>
      )}

      <View style={estilos.linhaBotoes}>
        <ThemedButton
          titulo="Editar"
          variante="secundario"
          onPress={() => onEditar(compromisso)}
        />
        <ThemedButton
          titulo="Excluir"
          variante="perigo"
          onPress={() => onExcluir(compromisso.id)}
        />
      </View>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8, marginBottom: 12 },
  foto: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 4,
  },
  linhaInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  linhaBotoes: { flexDirection: "row", gap: 10, marginTop: 6 },
});