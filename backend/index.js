const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// Conectar a PostgreSQL usando DATABASE_URL de variables de entorno
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Endpoint de health check para Kubernetes probes y monitoreo
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// Obtener todos los usuarios de la base de datos
app.get('/users', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users');
  res.json(rows);
});

// Agregar un nuevo usuario a la base de datos
app.post('/users', async (req, res) => {
  const { name } = req.body;
  const { rows } = await pool.query('INSERT INTO users(name) VALUES($1) RETURNING *', [name]);
  res.json(rows[0]);
});

// Iniciar el servidor en puerto 3000
app.listen(3000, () => console.log('Backend running on port 3000'));
