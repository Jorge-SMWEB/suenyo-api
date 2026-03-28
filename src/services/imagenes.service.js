const axios = require('axios');
const fs = require('fs');
const path = require('path');

const IMAGENES_DIR = path.join(__dirname, '../../public/imagenes');

if (!fs.existsSync(IMAGENES_DIR)) {
  fs.mkdirSync(IMAGENES_DIR, { recursive: true });
}

async function generarImagen(prompt, nombre) {
  const promptCompleto = `cinematic dreamy scene, ${prompt}, surreal, atmospheric, high quality`;

  const response = await axios.post(
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    { inputs: promptCompleto },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'image/jpeg',
      },
      responseType: 'arraybuffer',
      timeout: 120000,
    }
  );

  const filePath = path.join(IMAGENES_DIR, nombre);
  fs.writeFileSync(filePath, Buffer.from(response.data));

  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
  return `${baseUrl}/imagenes/${nombre}`;
}

async function generarImagenes(escenas) {
  const timestamp = Date.now();

  const escenasConImagenes = await Promise.all(
    escenas.map(async (escena, index) => {
      try {
        const nombre = `${timestamp}-${index + 1}.jpg`;
        const url_imagen = await generarImagen(escena.prompt_imagen, nombre);
        console.log(`Imagen ${index + 1} generada OK`);
        return { ...escena, url_imagen, orden: index + 1 };
      } catch (err) {
        console.error(`Error imagen ${index + 1}:`, err.response?.data || err.message);
        return { ...escena, url_imagen: '', orden: index + 1 };
      }
    })
  );

  return escenasConImagenes;
}

module.exports = { generarImagenes };
