require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');
const { logger } = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./user-management/routes/authRoutes');
const { ensureDefaultAdmin } = require('./user-management/controllers/authController');
const hotelRoutes = require('./hotel-accommodation-management/routes/hotelRoutes');
const destinationRoutes = require('./destination-management/routes/destinationRoutes');
const lifestyleRoutes = require('./destination-management/routes/lifestyleRoutes');
const budgetRoutes = require('./budget-planner-management/routes/budgetRoutes');
const reviewRoutes = require('./review-management/routes/reviewRoutes');
const transportRoutes = require('./driver-management/routes/transportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve uploaded files — both server/uploads (licenses, vehicles) and root uploads (hotels)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const rootUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(rootUploadsDir)) fs.mkdirSync(rootUploadsDir, { recursive: true });
app.use('/uploads', express.static(rootUploadsDir));

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TravelLanka AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/lifestyles', lifestyleRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api', reviewRoutes);
app.use('/api/transport', transportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    await sequelize.sync({ alter: false });
    console.log('Models synchronized with database');

    /* Ensure destinations table has city_key column for tbl_lifestyle linking */
    try {
      const qi = sequelize.getQueryInterface();
      const { DataTypes } = require('sequelize');
      const destCols = await qi.describeTable('destinations').catch(() => null);
      if (destCols && !destCols.city_key) {
        await qi.addColumn('destinations', 'city_key', {
          type: DataTypes.STRING(100),
          allowNull: true,
          after: 'is_active',
        });
        console.log('destinations.city_key column added');

        /* Seed city_key values for existing destinations */
        const cityMap = {
          'Sigiriya Rock Fortress':          'Sigiriya',
          'Kandy \u2014 Sacred City':        'Kandy',
          'Galle Fort':                      'Galle',
          'Ella \u2014 Misty Hill Country':  'ella',
          'Yala National Park':              'Yala',
          'Mirissa Beach':                   'Mirissa',
          'Nuwara Eliya \u2014 Little England': 'Nuwaraeliya',
          'Arugam Bay':                      'ArugamBay',
          'Anuradhapura Sacred City':        'Anuradhapura',
          'Trincomalee':                     'Trincomalee',
        };
        const Destination = require('./destination-management/models/Destination');
        const allDests = await Destination.findAll();
        for (const dest of allDests) {
          if (cityMap[dest.name]) {
            await dest.update({ city_key: cityMap[dest.name] });
          }
        }
        console.log('destinations.city_key values set');
      }
    } catch (colErr) {
      console.warn('Could not patch destinations table (non-fatal):', colErr.message);
    }

    /* Ensure budget tables exist */
    try {
      const BudgetPlan = require('./budget-planner-management/models/BudgetPlan');
      const BudgetItem = require('./budget-planner-management/models/BudgetItem');
      await BudgetPlan.sync({ alter: false });
      await BudgetItem.sync({ alter: false });
      console.log('Budget tables ready');
    } catch (budgetErr) {
      console.warn('Budget table sync (non-fatal):', budgetErr.message);
    }

    /* Ensure review/cart/order tables exist */
    try {
      const Cart = require('./review-management/models/Cart');
      const CartItem = require('./review-management/models/CartItem');
      const Order = require('./review-management/models/Order');
      const OrderItem = require('./review-management/models/OrderItem');
      const Review = require('./review-management/models/Review');
      await Cart.sync({ alter: false });
      await CartItem.sync({ alter: false });
      await Order.sync({ alter: false });
      await OrderItem.sync({ alter: false });
      await Review.sync({ alter: false });
      console.log('Review/Cart/Order tables ready');
    } catch (reviewErr) {
      console.warn('Review table sync (non-fatal):', reviewErr.message);
    }

    /* Ensure transport tables exist + is_driver column on users */
    try {
      const DriverApplication = require('./driver-management/models/DriverApplication');
      const TransportGig = require('./driver-management/models/TransportGig');
      const TransportBooking = require('./driver-management/models/TransportBooking');
      await DriverApplication.sync({ alter: false });
      await TransportGig.sync({ alter: false });
      await TransportBooking.sync({ alter: false });
      console.log('Transport tables ready');

      const qi = sequelize.getQueryInterface();
      const { DataTypes } = require('sequelize');
      const userCols = await qi.describeTable('users').catch(() => null);
      if (userCols && !userCols.is_driver) {
        await qi.addColumn('users', 'is_driver', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'is_active',
        });
        console.log('users.is_driver column added');
      }
    } catch (transportErr) {
      console.warn('Transport table sync (non-fatal):', transportErr.message);
    }

    await ensureDefaultAdmin();
    console.log('Authentication module initialized');

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('TravelLanka AI Server is running');
      console.log('='.repeat(50));
      console.log(`Server URL: http://localhost:${PORT}`);
      console.log(`API Base: http://localhost:${PORT}/api`);
      console.log(`Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`Hotels API: http://localhost:${PORT}/api/hotels`);
      console.log(`Started at: ${new Date().toLocaleString()}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = app;
