require('dotenv').config();
const express = require('express');
const cors = require('cors');
const suenyosRoutes = require('./routes/suenyos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/imagenes', require('express').static(require('path').join(__dirname, '../public/imagenes')));
app.use((req, res, next) => { console.log(`${req.method} ${req.url}`); next(); });

app.use('/api/suenyos', suenyosRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Suenyos API corriendo en http://localhost:${PORT}`);
});
