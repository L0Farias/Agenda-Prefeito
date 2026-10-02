import * as SQLite from "expo-sqlite";
import {
  atualizarCompromisso,
  inicializarBanco,
  inserirCompromisso,
  listarCompromissos,
  removerCompromisso,
} from "@/database/database";

describe("database (compromissos da agenda)", () => {
  it("cria a tabela ao inicializar o banco", () => {
    inicializarBanco();
    const dbMock = (SQLite.openDatabaseSync as jest.Mock).mock.results[0].value;
    expect(dbMock.execSync).toHaveBeenCalled();
  });

  it("insere um compromisso com os dados corretos", () => {
    inserirCompromisso({
      titulo: "Inauguração da praça",
      descricao: "Evento aberto ao público",
      data: "25/12/2026",
      hora: "14:00",
      local: "Praça Central",
    });

    const dbMock = (SQLite.openDatabaseSync as jest.Mock).mock.results[0].value;
    expect(dbMock.runSync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO compromissos"),
      expect.arrayContaining(["Inauguração da praça", "Evento aberto ao público", "25/12/2026", "14:00", "Praça Central"])
    );
  });

  it("lista os compromissos existentes", () => {
    const resultado = listarCompromissos();
    expect(Array.isArray(resultado)).toBe(true);
  });

  it("atualiza um compromisso existente", () => {
    atualizarCompromisso(1, {
      titulo: "Reunião remarcada",
      descricao: "",
      data: "26/12/2026",
      hora: "10:00",
      local: "Gabinete",
    });

    const dbMock = (SQLite.openDatabaseSync as jest.Mock).mock.results[0].value;
    expect(dbMock.runSync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE compromissos"),
      expect.arrayContaining(["Reunião remarcada", "26/12/2026", "10:00", "Gabinete", 1])
    );
  });

  it("remove um compromisso pelo id", () => {
    removerCompromisso(1);
    const dbMock = (SQLite.openDatabaseSync as jest.Mock).mock.results[0].value;
    expect(dbMock.runSync).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM compromissos"),
      [1]
    );
  });
});
