require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'customer_db',
  password: 'meghana',
  port: 5432,
});

app.use(cors());
app.use(express.json());

app.get('/customers', async (req, res) => {
  const { search, sort, page = 1 } = req.query;
  const limit = 20;
  const offset = (page - 1) * limit;
  let baseQuery = `SELECT sno, customer_name, age, phone, location, to_char(created_at, 'YYYY-MM-DD') AS date, to_char(created_at, 'HH24:MI:SS') AS time FROM customers`;
  let whereClause = '';
  let orderBy = 'ORDER BY created_at DESC'; // Default sorting

  if (search) {
    whereClause = `WHERE customer_name ILIKE '%${search}%' OR location ILIKE '%${search}%'`;
  }

  if (sort) {
    orderBy = (sort === 'date') ? 'ORDER BY date DESC' : 'ORDER BY time DESC';
  }

  const finalQuery = `${baseQuery} ${whereClause} ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
  
  try {
    const result = await pool.query(finalQuery);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
