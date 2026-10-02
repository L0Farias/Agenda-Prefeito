import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UsuarioProvider } from "@/contexts/UsuarioContext";
import { PrefeitoProvider } from "@/contexts/PrefeitoContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { inicializarBanco } from "@/database/database";

// Inicializa o banco uma vez na subida do app,
// antes de qualquer tela tentar ler ou escrever dados.
inicializarBanco();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UsuarioProvider>
            <PrefeitoProvider>
              <StatusBar style="auto" />
              <RootNavigator />
            </PrefeitoProvider>
          </UsuarioProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}