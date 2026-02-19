require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const { logger } = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const hotelRoutes = require('./member3-hotels/routes/hotelRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request Logger
app.use(logger);

// ============================================
// ROUTES
// ============================================

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TravelLanka AI - Hotel Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/hotels', hotelRoutes);

// Routes for other modules (to be added later)
// app.use('/api/auth', authRoutes);
// app.use('/api/destinations', destinationRoutes);
// app.use('/api/tours', tourRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/budget', budgetRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Not Found Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    // Sync models with database (be careful in production!)
    // Use { alter: true } for development, but use migrations in production
    await sequelize.sync({ alter: false });
    console.log('✅ Models synchronized with database');

    // Start server
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
