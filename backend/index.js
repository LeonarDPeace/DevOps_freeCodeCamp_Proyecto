const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/crud_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(express.json());

// CORS configurado correctamente para Render
const corsOptions = {
  origin: [
    'https://crud-frontend-cerx.onrender.com',
    'http://localhost:3001',
    'http://localhost:3000',
    '*'  // Permitir todos los orígenes en desarrollo
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Configuración de métricas Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  httpRequestsTotal.inc({ method: 'GET', route: '/healthz', status_code: 200 });
  res.json({ status: 'ok' });
});

// Readiness check endpoint
app.get('/readiness', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    httpRequestsTotal.inc({ method: 'GET', route: '/readiness', status_code: 200 });
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    httpRequestsTotal.inc({ method: 'GET', route: '/readiness', status_code: 503 });
    res.status(503).json({ status: 'not ready', database: 'disconnected', error: error.message });
  }
});

// Endpoint de métricas Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    httpRequestsTotal.inc({ method: 'GET', route: '/users', status_code: 200 });
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    httpRequestsTotal.inc({ method: 'GET', route: '/users', status_code: 500 });
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// POST new user
app.post('/users', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    httpRequestsTotal.inc({ method: 'POST', route: '/users', status_code: 400 });
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users(name) VALUES($1) RETURNING *',
      [name]
    );
    httpRequestsTotal.inc({ method: 'POST', route: '/users', status_code: 201 });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    httpRequestsTotal.inc({ method: 'POST', route: '/users', status_code: 500 });
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// Inicializar tabla si no existe
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    console.log('Server will continue without database connection');
  }
}

// Iniciar servidor
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await initDatabase();
});
