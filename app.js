const express = require('express');
const sqlite3 = require('sqlite3');
const _ = require('lodash');

const app = express();
app.disable('x-powered-by');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER, name TEXT, email TEXT)');
  db.run("INSERT INTO users VALUES (1, 'ama', 'ama@example.com')");
  db.run("INSERT INTO users VALUES (2, 'kofi', 'kofi@example.com')");
});

app.get('/', (req, res) => {
  res.send('Welcome to the app');
});

app.get('/user', (req, res) => {
  const name = String(req.query.name || '').trim();

  if (!name) {
    return res.status(400).json({ error: 'Missing query parameter: name' });
  }

  const sql = 'SELECT * FROM users WHERE name = ?';
  db.all(sql, [name], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

app.get('/search', (req, res) => {
  const query = String(req.query.q || '').replace(/[<>]/g, '');
  res.send('<h1>Results for ' + query + '</h1>');
});

app.get('/settings', (req, res) => {
  let parsed = {};

  if (req.query.data) {
    try {
      parsed = JSON.parse(String(req.query.data));
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON in data' });
    }
  }

  res.json(_.merge({}, { theme: 'light' }, parsed));
});

app.listen(3000, '127.0.0.1', () => console.log('http://localhost:3000'));