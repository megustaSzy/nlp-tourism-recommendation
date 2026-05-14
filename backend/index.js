require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/api/wisata', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wisata ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/wisata/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM wisata WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Wisata not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Forward the request to NLP Service
    const response = await fetch(process.env.NLP_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`NLP Service returned ${response.status}`);
    }

    const data = await response.json();
    
    // We can also fetch the exact records from DB based on IDs returned by NLP service
    // But since NLP service already returns the full objects, we can just return those
    // For a cleaner architecture, let's map the results to DB records if needed, 
    // or just return the NLP data directly. 
    // The instructions say "Frontend Next.js ↓ Backend Express.js ↓ Python Flask NLP Service ↓ PostgreSQL Database"
    // So the data returned by NLP service should be sufficient.
    
    res.json(data);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Error processing search' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
