const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./lost_found.db');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());



// Create tables if not exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS lost_items (id INTEGER PRIMARY KEY, name TEXT, description TEXT, location TEXT, date TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS found_items (id INTEGER PRIMARY KEY, name TEXT, description TEXT, location TEXT, date TEXT)`);
});

// Report lost item
app.post('/report-lost', (req, res) => {
    const { name, description, location } = req.body;
    const date = new Date().toISOString();
    db.run(`INSERT INTO lost_items (name, description, location, date) VALUES (?, ?, ?, ?)`, [name, description, location, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Lost item reported successfully' });
    });
});

// Report found item
app.post('/report-found', (req, res) => {
    const { name, description, location } = req.body;
    const date = new Date().toISOString();
    db.run(`INSERT INTO found_items (name, description, location, date) VALUES (?, ?, ?, ?)`, [name, description, location, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Found item reported successfully' });
    });
});

// Get all lost & found items
app.get('/get-items', (req, res) => {
    db.all(`SELECT 'lost' AS type, * FROM lost_items UNION SELECT 'found' AS type, * FROM found_items`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Match items based on keywords
app.get('/match-items', (req, res) => {
    db.all(`SELECT * FROM lost_items`, [], (err, lostItems) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all(`SELECT * FROM found_items`, [], (err, foundItems) => {
            if (err) return res.status(500).json({ error: err.message });
            
            let matches = [];
            lostItems.forEach(lost => {
                foundItems.forEach(found => {
                    if (lost.name.toLowerCase() === found.name.toLowerCase() ||
                        lost.location.toLowerCase() === found.location.toLowerCase()) {
                        matches.push({ lost, found });
                    }
                });
            });
            res.json(matches);
        });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});