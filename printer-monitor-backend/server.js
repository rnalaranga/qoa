const express = require('express');
const cors = require('cors');
require('dotenv').config();

const printerRoutes = require('./routes/printerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.use('/api/printers', printerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Download Agent endpoint
const path = require('path');
const fs = require('fs');
app.get('/api/download-agent', (req, res) => {
    // Assuming the installer is generated at qoa-agent/dist/QOA Fleet Agent Setup 1.0.0.exe
    const agentDir = path.join(__dirname, '..', 'qoa-agent', 'dist');
    fs.readdir(agentDir, (err, files) => {
        if (err || !files) return res.status(404).send('Agent not compiled yet.');
        const installer = files.find(f => f.endsWith('.exe') && f.includes('Setup'));
        if (installer) {
            res.download(path.join(agentDir, installer));
        } else {
            res.status(404).send('Agent installer not found.');
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
