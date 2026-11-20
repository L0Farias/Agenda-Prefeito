import * as SQLite from "expo-sqlite";
import { Compromisso, NovoCompromisso, Usuario } from "@/types";

// v2: biometriaHabilitada em usuarios
// v3: fotoUri em compromissos
// v4: nomeUsuario em compromissos (isolamento por usuario)
const SCHEMA_VERSION = 4;

const db = SQLite.openDatabaseSync("agenda-prefeito.db");

export function inicializarBanco(): void {
  const resultado = db.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  const versaoAtual = resultado?.user_version ?? 0;

  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS compromissos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeUsuario TEXT NOT NULL DEFAULT '',
      titulo TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      hora TEXT NOT NULL,
      local TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      fotoUri TEXT,
      criadoEm TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeUsuario TEXT NOT NULL UNIQUE CHECK(length(nomeUsuario) <= 50),
      senhaHash TEXT NOT NULL,
      criadoEm TEXT NOT NULL,
      biometriaHabilitada INTEGER DEFAULT 0
    );
  `);

  if (versaoAtual < 2) {
    try { db.execSync("ALTER TABLE usuarios ADD COLUMN biometriaHabilitada INTEGER DEFAULT 0;"); } catch { }
  }
  if (versaoAtual < 3) {
    try { db.execSync("ALTER TABLE compromissos ADD COLUMN fotoUri TEXT;"); } catch { }
  }
  if (versaoAtual < 4) {
    try { db.execSync("ALTER TABLE compromissos ADD COLUMN nomeUsuario TEXT NOT NULL DEFAULT '';"); } catch { }
  }

  if (versaoAtual < SCHEMA_VERSION) {
    db.runSync("PRAGMA user_version = " + SCHEMA_VERSION + ";");
  }
}

export function listarCompromissos(nomeUsuario: string): Compromisso[] {
  return db.getAllSync<Compromisso>(
    "SELECT * FROM compromissos WHERE nomeUsuario = ? ORDER BY data ASC, hora ASC;",
    [nomeUsuario]
  );
}

export function inserirCompromisso(nomeUsuario: string, compromisso: NovoCompromisso): void {
  db.runSync(
    `INSERT INTO compromissos
      (nomeUsuario, titulo, descricao, data, hora, local, latitude, longitude, fotoUri, criadoEm)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      nomeUsuario,
      compromisso.titulo,
      compromisso.descricao ?? "",
      compromisso.data,
      compromisso.hora,
      compromisso.local,
      compromisso.latitude ?? null,
      compromisso.longitude ?? null,
      compromisso.fotoUri ?? null,
      new Date().toISOString(),
    ]
  );
}

export function atualizarCompromisso(
  id: number,
  nomeUsuario: string,
  dados: NovoCompromisso
): void {
  db.runSync(
    `UPDATE compromissos
     SET titulo = ?, descricao = ?, data = ?, hora = ?, local = ?, fotoUri = ?
     WHERE id = ? AND nomeUsuario = ?;`,
    [dados.titulo, dados.descricao ?? "", dados.data, dados.hora, dados.local, dados.fotoUri ?? null, id, nomeUsuario]
  );
}

export function removerCompromisso(id: number, nomeUsuario: string): void {
  db.runSync("DELETE FROM compromissos WHERE id = ? AND nomeUsuario = ?;", [id, nomeUsuario]);
}

export function inserirUsuario(
  nomeUsuario: string,
  senhaHash: string,
  criadoEm: string,
  biometriaHabilitada: boolean = false
): void {
  db.runSync(
    `INSERT INTO usuarios (nomeUsuario, senhaHash, criadoEm, biometriaHabilitada)
     VALUES (?, ?, ?, ?);`,
    [nomeUsuario, senhaHash, criadoEm, biometriaHabilitada ? 1 : 0]
  );
}

export function buscarUsuarioPorNome(nomeUsuario: string): Usuario | null {
  return (
    db.getFirstSync<Usuario>(
      "SELECT * FROM usuarios WHERE nomeUsuario = ?;",
      [nomeUsuario]
    ) ?? null
  );
}

export function listarUsuarios(): Usuario[] {
  return db.getAllSync<Usuario>("SELECT * FROM usuarios;");
}

export function atualizarBiometriaUsuario(
  nomeUsuario: string,
  habilitada: boolean
): void {
  db.runSync(
    "UPDATE usuarios SET biometriaHabilitada = ? WHERE nomeUsuario = ?;",
    [habilitada ? 1 : 0, nomeUsuario]
  );
}

export default db;