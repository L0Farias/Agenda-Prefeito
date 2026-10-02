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
import LEAFLET_CSS from "./leafletCSS";
import LEAFLET_JS from "./leafletJS";

export function gerarMapaHTML(
  posicaoAtual: Coordenadas,
  compromissos: Compromisso[]
): string {
  const marcadores = compromissos
    .map((c) => {
      const t = String(c.titulo || "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\n/g, " ");
      const d = String(c.data || "").replace(/`/g, "\\`");
      const h = String(c.hora || "").replace(/`/g, "\\`");
      const l = String(c.local || "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\n/g, " ");
      return (
        "L.marker([" + c.latitude + "," + c.longitude + "])" +
        ".addTo(map)" +
        ".bindPopup('<b>" + t + "</b><br>" + d + " as " + h + "<br>" + l + "');"
      );
    })
    .join("\n");

  const lat = posicaoAtual.latitude;
  const lng = posicaoAtual.longitude;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>${LEAFLET_CSS}</style>
<style>html,body,#map{height:100%;margin:0;padding:0;}</style>
</head>
<body>
<div id="map"></div>
<script>${LEAFLET_JS}</script>
<script>
var map=L.map('map').setView([${lat},${lng}],14);
var osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap',maxZoom:19});
var esri=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles &copy; Esri'});
osm.addTo(map);
L.control.layers({'Mapa':osm,'Satelite':esri}).addTo(map);
var ic=L.divIcon({className:'',html:'<div style="background:#1D4ED8;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>',iconSize:[14,14],iconAnchor:[7,7]});
L.marker([${lat},${lng}],{icon:ic}).addTo(map).bindPopup('Voce esta aqui');
${marcadores}
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
        <ThemedText variante="corpo">O mapa nao pode ser carregado.</ThemedText>
        <ThemedText variante="legenda">Verifique sua conexao com a internet.</ThemedText>
      </ThemedView>
    );
  }

  const mapaHTML = gerarMapaHTML(posicaoAtual, compromissos);
  const webViewKey = posicaoAtual.latitude + "," + posicaoAtual.longitude + "," + compromissos.length;

  return (
    <WebView
      key={webViewKey}
      source={{ html: mapaHTML }}
      style={estilos.mapa}
      originWhitelist={["*"]}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      mixedContentMode="always"
      onError={(_e: WebViewErrorEvent) => setErroWebView(true)}
    />
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  mapa: { flex: 1 },
  dica: { textAlign: "center", paddingHorizontal: 24 },
});