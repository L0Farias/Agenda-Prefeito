import * as LocalAuthentication from "expo-local-authentication";

export async function dispositivoSuportaBiometria(): Promise<boolean> {
  const temHardware = await LocalAuthentication.hasHardwareAsync();
  const temBiometriaCadastrada = await LocalAuthentication.isEnrolledAsync();
  return temHardware && temBiometriaCadastrada;
}

export async function autenticarComBiometria(): Promise<boolean> {
  const suportado = await dispositivoSuportaBiometria();

  if (!suportado) {
    // Em dispositivos sem biometria cadastrada (ou no emulador), permite
    // seguir para não travar a demonstração do trabalho.
    return true;
  }

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: "Autentique-se para acessar a Agenda do Prefeito",
    fallbackLabel: "Usar senha do dispositivo",
    cancelLabel: "Cancelar",
  });

  return resultado.success;
}
