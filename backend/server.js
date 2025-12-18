const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Configuration
const pool = new Pool({
    user: 'rasa_user',      // Your config
    host: 'localhost',      // Your config
    database: 'rasa_db',    // Your config
    password: 'rootadmin',  // Your config
    port: 5432,             // Your config
});

// API Route: Get timetable by Day Name
app.get('/timetable/:day', async (req, res) => {
    const { day } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM timetable WHERE day_name = $1 ORDER BY id ASC", 
            [day]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});