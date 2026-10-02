import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "@/screens/LoginScreen";
import { CadastroScreen } from "@/screens/CadastroScreen";
import { TabNavigator } from "./TabNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { RootStackParamList } from "@/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { autenticado } = useAuth();
  const { tema, paleta } = useTheme();

  const temaDeNavegacao =
    tema === "dark"
      ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: paleta.fundo, primary: paleta.primaria } }
      : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: paleta.fundo, primary: paleta.primaria } };

  return (
    <NavigationContainer theme={temaDeNavegacao}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {autenticado ? (
          <Stack.Screen name="Tabs" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="Cadastro"
              component={CadastroScreen}
              options={{ presentation: "modal", headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
