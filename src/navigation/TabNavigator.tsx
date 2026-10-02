import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { PerfilScreen } from "@/screens/PerfilScreen";
import { AgendaScreen } from "@/screens/AgendaScreen";
import { MapaScreen } from "@/screens/MapaScreen";
import { useTheme } from "@/contexts/ThemeContext";

export type RootTabParamList = {
  Agenda: undefined;
  Mapa: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const iconesPorRota: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Agenda: "calendar",
  Mapa: "map",
  Perfil: "person-circle",
};

export function TabNavigator() {
  const { paleta } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Agenda"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: paleta.fundo },
        headerTintColor: paleta.texto,
        headerTitleStyle: { fontSize: 20 },
        tabBarStyle: { backgroundColor: paleta.fundoCartao },
        tabBarActiveTintColor: paleta.primaria,
        tabBarInactiveTintColor: paleta.textoSecundario,
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={iconesPorRota[route.name as keyof RootTabParamList]}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} options={{ title: "Agenda" }} />
      <Tab.Screen name="Mapa" component={MapaScreen} options={{ title: "Mapa" }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}
