import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { WebView, WebViewErrorEvent } from "react-native-webview";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { listarCompromissos } from "@/database/database";
import { obterLocalizacaoAtual, Coordenadas } from "@/services/location";
import { Compromisso } from "@/types";

export function gerarMapaHTML(
  posicaoAtual: Coordenadas,
  compromissos: Compromisso[]
): string {
  const marcadoresCompromissos = compromissos
    .map((c) => {
      const titulo = c.titulo.replace(/'/g, "\\'").replace(/\n/g, " ");
      const data = c.data.replace(/'/g, "\\'");
      const hora = c.hora.replace(/'/g, "\\'");
      const local = c.local.replace(/'/g, "\\'").replace(/\n/g, " ");
      return `L.marker([${c.latitude}, ${c.longitude}])
        .addTo(map)
        .bindPopup('<b>${titulo}</b><br>${data} as ${hora}<br>${local}');`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapa</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN2GNnI="
    crossorigin=""></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${posicaoAtual.latitude}, ${posicaoAtual.longitude}], 14);
    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });
    var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });
    osmLayer.addTo(map);
    L.control.layers({ 'Mapa': osmLayer, 'Satelite': esriLayer }).addTo(map);
    var iconeAtual = L.divIcon({
      className: '',
      html: '<div style="background:#1D4ED8;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    L.marker([${posicaoAtual.latitude}, ${posicaoAtual.longitude}], { icon: iconeAtual })
      .addTo(map)
      .bindPopup('Voce esta aqui');
    ${marcadoresCompromissos}
  </script>
</body>
</html>`;
}

export function MapaScreen() {
  const insets = useSafeAreaInsets();
  const [posicaoAtual, setPosicaoAtual] = useState<Coordenadas | null>(null);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [erroWebView, setErroWebView] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setErroWebView(false);
      obterLocalizacaoAtual().then(setPosicaoAtual);
      setCompromissos(
        listarCompromissos().filter(
          (c) => c.latitude != null && c.longitude != null
        )
      );
    }, [])
  );

  if (!posicaoAtual) {
    return (
      <ThemedView style={[estilos.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ThemedText variante="corpo">Obtendo sua localizacao...</ThemedText>
        <ThemedText variante="legenda" style={estilos.dica}>
          Verifique se a permissao de localizacao esta concedida.
        </ThemedText>
      </ThemedView>
    );
  }

  if (erroWebView) {
    return (
      <ThemedView style={[estilos.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ThemedText variante="corpo">O mapa nao pude ser carregado.</ThemedText>
        <ThemedText variante="legenda">Verifique sua conexao e tente novamente.</ThemedText>
      </ThemedView>
    );
  }

  const mapaHTML = gerarMapaHTML(posicaoAtual, compromissos);
  const webViewKey = `${posicaoAtual.latitude},${posicaoAtual.longitude},${compromissos.length}`;

  function lidarComErro(_event: WebViewErrorEvent) {
    setErroWebView(true);
  }

  return (
    <WebView
      key={webViewKey}
      source={{ html: mapaHTML }}
      style={estilos.mapa}
      originWhitelist={["*"]}
      onError={lidarComErro}
    />
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  mapa: { flex: 1 },
  dica: { textAlign: "center", paddingHorizontal: 24 },
});