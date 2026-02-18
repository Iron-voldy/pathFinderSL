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
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    await sequelize.sync({ alter: false });
    console.log('✅ Models synchronized with database');
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 TravelLanka AI Server is running');
      console.log('='.repeat(50));
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
      console.log(`🏨 Hotels API: http://localhost:${PORT}/api/hotels`);
      console.log(`🕒 Started at: ${new Date().toLocaleString()}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50) + '\n');
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
startServer();

module.exports = app;
