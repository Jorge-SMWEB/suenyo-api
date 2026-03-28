const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../suenyos.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS suenyos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    descripcion TEXT,
    narracion TEXT,
    analisis TEXT,
    imagenes TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
