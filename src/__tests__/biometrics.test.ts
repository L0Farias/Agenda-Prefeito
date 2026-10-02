import * as LocalAuthentication from "expo-local-authentication";
import {
  autenticarComBiometria,
  dispositivoSuportaBiometria,
} from "@/services/biometrics";

describe("biometrics service", () => {
  it("retorna true quando o dispositivo tem hardware e biometria cadastrada", async () => {
    const suportado = await dispositivoSuportaBiometria();
    expect(suportado).toBe(true);
  });

  it("autentica com sucesso quando o sistema confirma a biometria", async () => {
    const sucesso = await autenticarComBiometria();
    expect(sucesso).toBe(true);
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
  });

  it("retorna false quando a autenticação é recusada", async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({
      success: false,
    });
    const sucesso = await autenticarComBiometria();
    expect(sucesso).toBe(false);
  });
});
