const express = require('express');
const mysql = require('mysql');
const knex = require('knex'); 
require("dotenv").config();
const app = express();
const port = 3000;

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
  }
});

app.use(express.json());

// Promisify the db.query function for async/await
const queryAsync = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });
};

app.get('/items', async (req, res) => {
  try {
    const results = await db.select('*').from('fooditems'); // Use knex query builder
    res.json(results);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get ('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const results = await db('fooditems').where('id', itemId);
    if (results.length === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json(results[0]);
    }
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/items', async (req, res) => {
  const newItem = req.body;
  try {
    const result = await db('fooditems').insert(newItem);
    newItem.id = result[0];
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  try {
    const result = await db('fooditems').where('id', itemId).update(updatedItem);
    if (result === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json(updatedItem);
    }
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const result = await db('fooditems').where('id', itemId).delete();
    if (result === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function main() {
  app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

main();

