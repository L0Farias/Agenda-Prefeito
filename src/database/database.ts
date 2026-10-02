import * as SQLite from "expo-sqlite";
import { Compromisso, NovoCompromisso, Usuario } from "@/types";

// v2: biometriaHabilitada em usuarios
// v3: fotoUri em compromissos
const SCHEMA_VERSION = 3;

const db = SQLite.openDatabaseSync("agenda-prefeito.db");

export function inicializarBanco(): void {
  const resultado = db.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  const versaoAtual = resultado?.user_version ?? 0;

  // Cria tabelas se nao existirem (schema completo atual)
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS compromissos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

  // Migrations incrementais para bancos existentes
  if (versaoAtual < 2) {
    try {
      db.execSync("ALTER TABLE usuarios ADD COLUMN biometriaHabilitada INTEGER DEFAULT 0;");
    } catch { /* ja existe */ }
  }
  if (versaoAtual < 3) {
    try {
      db.execSync("ALTER TABLE compromissos ADD COLUMN fotoUri TEXT;");
    } catch { /* ja existe */ }
  }

  if (versaoAtual < SCHEMA_VERSION) {
    db.runSync("PRAGMA user_version = " + SCHEMA_VERSION + ";");
  }
}

export function listarCompromissos(): Compromisso[] {
  return db.getAllSync<Compromisso>(
    "SELECT * FROM compromissos ORDER BY data ASC, hora ASC;"
  );
}

export function inserirCompromisso(compromisso: NovoCompromisso): void {
  db.runSync(
    `INSERT INTO compromissos
      (titulo, descricao, data, hora, local, latitude, longitude, fotoUri, criadoEm)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
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
  dados: NovoCompromisso
): void {
  db.runSync(
    `UPDATE compromissos
     SET titulo = ?, descricao = ?, data = ?, hora = ?, local = ?, fotoUri = ?
     WHERE id = ?;`,
    [dados.titulo, dados.descricao ?? "", dados.data, dados.hora, dados.local, dados.fotoUri ?? null, id]
  );
}

export function removerCompromisso(id: number): void {
  db.runSync("DELETE FROM compromissos WHERE id = ?;", [id]);
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