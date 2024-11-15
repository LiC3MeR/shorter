const express = require('express');
const cors = require('cors');
const sequelize = require('./models');
const Url = require('./models/Url');
const urlRoutes = require('./routes/urlRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/', urlRoutes);

// Синхронизация базы данных
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => console.error('Error syncing database:', err));
