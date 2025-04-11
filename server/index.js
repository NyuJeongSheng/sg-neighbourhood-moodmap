// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is up and running.');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
