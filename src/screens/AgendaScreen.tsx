import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Modal, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { CompromissoCard } from "@/components/CompromissoCard";
import { FormularioCompromisso } from "@/components/FormularioCompromisso";
import {
  atualizarCompromisso,
  inicializarBanco,
  inserirCompromisso,
  listarCompromissos,
  removerCompromisso,
} from "@/database/database";
import { obterLocalizacaoAtual } from "@/services/location";
import { useAuth } from "@/contexts/AuthContext";
import { Compromisso, NovoCompromisso } from "@/types";

export function AgendaScreen() {
  const insets = useSafeAreaInsets();
  const { usuarioAtual } = useAuth();
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [compromissoEmEdicao, setCompromissoEmEdicao] = useState<Compromisso | undefined>();
  const [usarLocalizacaoAtual, setUsarLocalizacaoAtual] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      inicializarBanco();
      carregar();
    }, [usuarioAtual])
  );

  function carregar() {
    if (!usuarioAtual) return;
    setCompromissos(listarCompromissos(usuarioAtual));
  }

  function abrirNovo() {
    setCompromissoEmEdicao(undefined);
    setUsarLocalizacaoAtual(true);
    setModalAberto(true);
  }

  function abrirEdicao(compromisso: Compromisso) {
    setCompromissoEmEdicao(compromisso);
    setModalAberto(true);
  }

  async function salvar(dados: NovoCompromisso) {
    if (!usuarioAtual) return;
    setSalvando(true);
    try {
      if (compromissoEmEdicao) {
        atualizarCompromisso(compromissoEmEdicao.id, usuarioAtual, dados);
      } else {
        let latitude: number | null = null;
        let longitude: number | null = null;
        if (usarLocalizacaoAtual) {
          const coordenadas = await obterLocalizacaoAtual();
          latitude = coordenadas?.latitude ?? null;
          longitude = coordenadas?.longitude ?? null;
        }
        inserirCompromisso(usuarioAtual, { ...dados, latitude, longitude });
      }
      setModalAberto(false);
      carregar();
    } finally {
      setSalvando(false);
    }
  }

  function excluir(id: number) {
    if (!usuarioAtual) return;
    removerCompromisso(id, usuarioAtual);
    carregar();
  }

  return (
    <ThemedView style={estilos.container}>
      <ThemedView style={estilos.cabecalho}>
        <ThemedButton titulo="+ Novo compromisso" onPress={abrirNovo} />
      </ThemedView>
      <FlatList
        data={compromissos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CompromissoCard compromisso={item} onEditar={abrirEdicao} onExcluir={excluir} />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <ThemedView style={estilos.vazio}>
            <ThemedText variante="legenda">
              Nenhum compromisso cadastrado ainda. Toque em "+ Novo compromisso" para adicionar o primeiro.
            </ThemedText>
          </ThemedView>
        }
      />
      <Modal visible={modalAberto} animationType="slide" onRequestClose={() => setModalAberto(false)}>
        <ThemedView style={[estilos.modal, { paddingTop: insets.top }]}>
          <ScrollView contentContainerStyle={estilos.modalConteudo} keyboardShouldPersistTaps="handled">
            <FormularioCompromisso
              valoresIniciais={compromissoEmEdicao}
              salvando={salvando}
              usarLocalizacaoAtual={usarLocalizacaoAtual}
              onMudarUsarLocalizacao={setUsarLocalizacaoAtual}
              onSalvar={salvar}
              onCancelar={() => setModalAberto(false)}
            />
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  cabecalho: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
  lista: { paddingVertical: 8, paddingBottom: 40 },
  vazio: { paddingHorizontal: 16, paddingTop: 24, alignItems: "center" },
  modal: { flex: 1 },
  modalConteudo: { padding: 16 },
});