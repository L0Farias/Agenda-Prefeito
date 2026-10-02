import * as Location from "expo-location";

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export async function obterLocalizacaoAtual(): Promise<Coordenadas | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    return null;
  }

  const posicao = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: posicao.coords.latitude,
    longitude: posicao.coords.longitude,
  };
}
