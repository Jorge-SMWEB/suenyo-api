const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { procesarSuenyo } = require('../services/gemini.service');
const { generarImagenes } = require('../services/imagenes.service');

// POST /api/suenyos — procesar un nuevo sueño
router.post('/', async (req, res) => {
  const { descripcion } = req.body;

  if (!descripcion || descripcion.trim().length < 10) {
    return res.status(400).json({ error: 'La descripción del sueño es demasiado corta.' });
  }

  try {
    // 1. Gemini analiza el sueño y genera escenas
    const resultado = await procesarSuenyo(descripcion);

    // 2. Generar URLs de imágenes para cada escena
    const escenasConImagenes = await generarImagenes(resultado.escenas);

    // 3. Guardar en base de datos
    const stmt = db.prepare(`
      INSERT INTO suenyos (titulo, descripcion, narracion, analisis, imagenes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const narracion = escenasConImagenes.map(e => e.narracion).join(' ');
    const imagenesJson = JSON.stringify(escenasConImagenes);

    const info = stmt.run(resultado.titulo, descripcion, narracion, resultado.analisis, imagenesJson);

    res.json({
      id: info.lastInsertRowid,
      titulo: resultado.titulo,
      analisis: resultado.analisis,
      escenas: escenasConImagenes,
    });
  } catch (error) {
    console.error('Error procesando sueño:', error.message || error);
    res.status(500).json({ error: error.message || 'Error procesando el sueño.' });
  }
});

// GET /api/suenyos — obtener historial
router.get('/', (req, res) => {
  const suenyos = db.prepare(`
    SELECT id, titulo, descripcion, analisis, creado_en
    FROM suenyos
    ORDER BY creado_en DESC
  `).all();

  res.json(suenyos);
});

// GET /api/suenyos/:id — obtener un sueño completo
router.get('/:id', (req, res) => {
  const suenyo = db.prepare('SELECT * FROM suenyos WHERE id = ?').get(req.params.id);

  if (!suenyo) {
    return res.status(404).json({ error: 'Sueño no encontrado.' });
  }

  res.json({
    id: suenyo.id,
    titulo: suenyo.titulo,
    descripcion: suenyo.descripcion,
    narracion: suenyo.narracion,
    analisis: suenyo.analisis,
    escenas: JSON.parse(suenyo.imagenes),
    creado_en: suenyo.creado_en,
  });
});

// DELETE /api/suenyos/:id — eliminar un sueño
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM suenyos WHERE id = ?').run(req.params.id);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'Sueño no encontrado.' });
  }

  res.json({ mensaje: 'Sueño eliminado correctamente.' });
});

module.exports = router;
