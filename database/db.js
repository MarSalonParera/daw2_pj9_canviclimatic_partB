import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'co2-tracker.db';
const CSV_ASSET = require('../assets/images/data.csv');
const CSV_WEB_FALLBACK = `source,category,co2Kg,impactLevel,recommendation,createdAt
Desplazamiento en coche al instituto,Transporte,8.4,Alta,Comparte coche o usa transporte publico,2026-04-08T08:00:00.000Z
Pedido de comida con envases,Consumo,3.2,Media,Lleva tu propia botella y reduce envases,2026-04-10T12:30:00.000Z
Uso intensivo de aire acondicionado,Energia,6.7,Alta,Ajusta la temperatura a 24 grados,2026-04-12T16:45:00.000Z
Ruta en bicicleta,Movilidad sostenible,0.6,Baja,Mantener el habito y sumar trayectos cortos,2026-04-13T09:20:00.000Z
Compra local de temporada,Consumo responsable,1.1,Baja,Prioriza productos de proximidad,2026-04-15T18:10:00.000Z`;

class EmissionRecord {
  // RUBRICA: Lògica de l’aplicació i POO
  // Ubicación: modelo/clase para encapsular la información y comportamiento de cada registro.
  constructor({
    id,
    source,
    category,
    co2Kg,
    impactLevel,
    recommendation,
    photoUri = null,
    createdAt,
  }) {
    this.id = id;
    this.source = source;
    this.category = category;
    this.co2Kg = Number(co2Kg);
    this.impactLevel = impactLevel;
    this.recommendation = recommendation;
    this.photoUri = photoUri;
    this.createdAt = createdAt;
  }

  get impactLabel() {
    if (this.co2Kg >= 10) {
      return 'Alta';
    }

    if (this.co2Kg >= 5) {
      return 'Media';
    }

    return 'Baja';
  }

  get formattedDate() {
    return new Date(this.createdAt).toLocaleDateString('es-ES');
  }
}

let databasePromise;

const openDatabase = async () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  return databasePromise;
};

const parseCsv = (csvText) => {
  const [headerLine, ...rows] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((column) => column.trim());

  return rows
    .map((row) => row.split(',').map((value) => value ? value.trim() : ""))
    .filter((row) => row.length === headers.length)
    .map((row) =>
      headers.reduce((accumulator, header, index) => {
        accumulator[header] = row[index];
        return accumulator;
      }, {})
    );
};

const loadSeedFromCsv = async () => {
  if (Platform.OS === 'web') {
    return parseCsv(CSV_WEB_FALLBACK);
  }

  const asset = Asset.fromModule(CSV_ASSET);
  await asset.downloadAsync();
  const fileUri = asset.localUri || asset.uri;
  const csvText = await FileSystem.readAsStringAsync(fileUri);
  return parseCsv(csvText);
};

const ensureSchema = async (db) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS emissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      co2Kg REAL NOT NULL,
      impactLevel TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      photoUri TEXT,
      createdAt TEXT NOT NULL
    );
  `);
};

const seedDatabase = async (db) => {
  const result = await db.getFirstAsync('SELECT COUNT(*) AS total FROM emissions');

  if (result?.total > 0) {
    return;
  }

  const rows = await loadSeedFromCsv();

  const getImpact = (co2) => {
    const val = Number(co2);
    if (val >= 10) return 'Alta';
    if (val >= 5) return 'Media';
    return 'Baja';
  };

  for (const row of rows) {
    const co2 = Number(row.co2Kg);
    await db.runAsync(
      `
        INSERT INTO emissions
        (source, category, co2Kg, impactLevel, recommendation, photoUri, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      row.source,
      row.category,
      co2,
      getImpact(co2), // Usamos la lógica de la app en lugar del texto del CSV
      row.recommendation,
      null,
      row.createdAt
    );
  }
};

const mapRecord = (row) => new EmissionRecord(row);

export const initDB = async () => {
  const db = await openDatabase();
  await ensureSchema(db);

  // RUBRICA: Emmagatzematge de dades 
  // Ubicación: inicialización de SQLite e inserción inicial leyendo un CSV.
  await seedDatabase(db);
};

export const getEmissionRecords = async () => {
  // RUBRICA: Emmagatzematge de dades
  // Ubicación: lectura de registros almacenados en SQLite para mostrarlos en pantalla.
  const db = await openDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM emissions ORDER BY datetime(createdAt) DESC, id DESC'
  );
  return rows.map(mapRecord);
};

export const getEmissionRecordById = async (id) => {
  const db = await openDatabase();
  const row = await db.getFirstAsync('SELECT * FROM emissions WHERE id = ?', Number(id));
  return row ? mapRecord(row) : null;
};

export const addEmissionRecord = async (record) => {
  // RUBRICA: Emmagatzematge de dades
  // Ubicación: inserción persistente de nuevos datos en SQLite.
  const db = await openDatabase();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `
      INSERT INTO emissions
      (source, category, co2Kg, impactLevel, recommendation, photoUri, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    record.source,
    record.category,
    Number(record.co2Kg),
    record.impactLevel,
    record.recommendation,
    record.photoUri || null,
    createdAt
  );
};

export const getDashboardStats = async () => {
  const db = await openDatabase();
  const totals = await db.getFirstAsync(`
    SELECT
      COUNT(*) AS totalRecords,
      ROUND(COALESCE(SUM(co2Kg), 0), 1) AS totalCo2,
      ROUND(COALESCE(AVG(co2Kg), 0), 1) AS averageCo2
    FROM emissions
  `);

  const topCategory = await db.getFirstAsync(`
    SELECT category, ROUND(SUM(co2Kg), 1) AS total
    FROM emissions
    GROUP BY category
    ORDER BY total DESC
    LIMIT 1
  `);

  return {
    totalRecords: totals?.totalRecords ?? 0,
    totalCo2: totals?.totalCo2 ?? 0,
    averageCo2: totals?.averageCo2 ?? 0,
    topCategory: topCategory?.category ?? 'Sin datos',
  };
};
