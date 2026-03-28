const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function procesarSuenyo(descripcion) {
  const prompt = `
Eres un experto en interpretación de sueños y narración cinematográfica.
El usuario te describe su sueño. Tu trabajo es:

1. Generar exactamente 6 escenas visuales del sueño para crear un slideshow.
2. Escribir una narración corta para cada escena (máx 2 frases).
3. Dar un análisis psicológico del sueño.

Responde ÚNICAMENTE con este JSON válido, sin texto adicional:

{
  "titulo": "título poético corto del sueño",
  "escenas": [
    {
      "prompt_imagen": "descripción en inglés detallada y visual para generar la imagen, estilo cinematográfico onírico",
      "narracion": "texto en español que narra esta escena"
    }
  ],
  "analisis": "análisis psicológico del sueño en español, 3-4 párrafos"
}

El sueño del usuario es:
"${descripcion}"
`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0].message.content;
  return JSON.parse(text);
}

module.exports = { procesarSuenyo };
