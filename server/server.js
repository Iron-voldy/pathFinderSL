require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/database');
const { logger } = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const hotelRoutes = require('./member3-hotels/routes/hotelRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(logger);

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TravelLanka AI - Hotel Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/hotels', hotelRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('\x1b[32m[OK]\x1b[0m  Database connected successfully');
    console.log('\x1b[36m[DB]\x1b[0m  Database : ' + process.env.DB_NAME);
    console.log('\x1b[36m[DB]\x1b[0m  Host     : ' + process.env.DB_HOST + ':' + process.env.DB_PORT);

    await sequelize.sync({ alter: false });
    console.log('\x1b[32m[OK]\x1b[0m  Models synchronized with database');
    app.listen(PORT, () => {
      console.log('\n\x1b[1m' + '='.repeat(50) + '\x1b[0m');
      console.log('\x1b[32m\x1b[1m[START]\x1b[0m TravelLanka AI Server is running');
      console.log('\x1b[1m' + '='.repeat(50) + '\x1b[0m');
      console.log('\x1b[36m[URL]\x1b[0m   Server  : http://localhost:' + PORT);
      console.log('\x1b[36m[URL]\x1b[0m   API     : http://localhost:' + PORT + '/api');
      console.log('\x1b[36m[URL]\x1b[0m   Hotels  : http://localhost:' + PORT + '/api/hotels');
      console.log('\x1b[33m[TIME]\x1b[0m  Started : ' + new Date().toLocaleString());
      console.log('\x1b[33m[ENV]\x1b[0m   Mode    : ' + (process.env.NODE_ENV || 'development'));
      console.log('\x1b[1m' + '='.repeat(50) + '\x1b[0m\n');
    });

  } catch (error) {
    console.error('\x1b[31m[ERR]\x1b[0m Unable to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('\x1b[31m[ERR]\x1b[0m Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('\x1b[31m[ERR]\x1b[0m Uncaught Exception:', err);
  process.exit(1);
});
startServer();

module.exports = app;
