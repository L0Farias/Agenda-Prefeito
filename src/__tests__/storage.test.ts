import {
  obterPrefeito,
  salvarPrefeito,
  obterTemaSalvo,
  salvarTema,
} from "@/storage/storage";
import { Prefeito } from "@/types";

const prefeitoExemplo: Prefeito = {
  nome: "Maria da Silva",
  cargo: "Prefeita Municipal",
  cidade: "Mendes - RJ",
  partido: "PXX",
  telefone: "(24) 99999-0000",
  email: "gabinete@mendes.rj.gov.br",
  fotoUri: null,
};

describe("storage (AsyncStorage)", () => {
  it("retorna null quando nenhum prefeito foi salvo ainda", async () => {
    const resultado = await obterPrefeito();
    expect(resultado).toBeNull();
  });

  it("salva e recupera o perfil do prefeito corretamente", async () => {
    await salvarPrefeito(prefeitoExemplo);
    const resultado = await obterPrefeito();
    expect(resultado).toEqual(prefeitoExemplo);
  });

  it("mantém os dados salvos mesmo após sucessivas leituras (persistência)", async () => {
    await salvarPrefeito(prefeitoExemplo);
    const primeiraLeitura = await obterPrefeito();
    const segundaLeitura = await obterPrefeito();
    expect(primeiraLeitura).toEqual(segundaLeitura);
  });

  it("salva e recupera a preferência de tema", async () => {
    await salvarTema("dark");
    const tema = await obterTemaSalvo();
    expect(tema).toBe("dark");
  });
});
