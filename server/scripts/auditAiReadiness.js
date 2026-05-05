const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../config/database');

const EXACT_COUNT_TABLES = [
  'destinations',
  'tbl_lifestyle',
  'tbl_lifestyle_intelligence',
  'hotels',
  'transport_gigs',
  'transport_bookings',
  'driver_applications',
  'budget_plans',
  'budget_items',
  'orders',
  'order_items',
  'reviews',
  'users',
  'carts',
  'cart_items',
  'lifestyle',
];

const CORE_DESTINATIONS = [
  'Sigiriya',
  'Kandy',
  'Galle',
  'Ella',
  'ella',
  'Yala',
  'Mirissa',
  'Nuwaraeliya',
  'ArugamBay',
  'Anuradhapura',
  'Trincomalee',
  'Negombo',
  'Bentota',
  'Colombo',
  'Dambulla',
];

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');

async function printSection(title) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(title);
  console.log('='.repeat(80));
}

async function run() {
  try {
    await sequelize.authenticate();

    await printSection(`TravelLanka AI DB Audit - ${process.env.DB_NAME}`);

    console.log(`Host     : ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Database : ${process.env.DB_NAME}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    await printSection('Exact Table Counts');
    for (const table of EXACT_COUNT_TABLES) {
      const [[row]] = await sequelize.query(`SELECT COUNT(*) AS total FROM ${table}`);
      console.log(`${table.padEnd(28)} ${String(row.total).padStart(6)}`);
    }

    await printSection('Curated Destination Coverage');
    const [destinations] = await sequelize.query(
      "SELECT id, name, city_key, region FROM destinations ORDER BY id"
    );
    const [hotels] = await sequelize.query(
      "SELECT city, micro_location FROM hotels WHERE deleted_at IS NULL"
    );
    const [cityCounts] = await sequelize.query(
      `SELECT lifestyle_city, COUNT(*) AS total,
              SUM(CASE WHEN active_status = 1 AND deleted_at IS NULL THEN 1 ELSE 0 END) AS active_total
       FROM tbl_lifestyle
       GROUP BY lifestyle_city`
    );
    const cityCountMap = new Map(cityCounts.map((row) => [row.lifestyle_city, row]));

    destinations.forEach((destination) => {
      const key = normalize(destination.city_key);
      const hotelMatches = hotels.filter((hotel) => {
        const city = normalize(hotel.city);
        const micro = normalize(hotel.micro_location);
        return (
          city === key ||
          micro.includes(key) ||
          (key === 'sigiriya' && city === 'dambulla') ||
          (key === 'nuwaraeliya' && city === 'nuwaraeliya')
        );
      });

      const cityStats =
        cityCountMap.get(destination.city_key) ||
        (destination.city_key === 'Ella' ? cityCountMap.get('ella') : null);

      console.log(
        [
          String(destination.id).padStart(2),
          destination.city_key.padEnd(14),
          `activities=${String(cityStats?.total || 0).padStart(4)}`,
          `active=${String(cityStats?.active_total || 0).padStart(4)}`,
          `hotels=${String(hotelMatches.length).padStart(2)}`,
          destination.name,
        ].join(' | ')
      );
    });

    await printSection('Sri Lanka Core Activity Cities');
    const [coreCities] = await sequelize.query(
      `SELECT lifestyle_city, COUNT(*) AS total,
              SUM(CASE WHEN active_status = 1 AND deleted_at IS NULL THEN 1 ELSE 0 END) AS active_total
       FROM tbl_lifestyle
       WHERE lifestyle_city IN (${CORE_DESTINATIONS.map((city) => `'${city}'`).join(', ')})
       GROUP BY lifestyle_city
       ORDER BY total DESC`
    );
    coreCities.forEach((row) => {
      console.log(
        `${String(row.lifestyle_city).padEnd(18)} total=${String(row.total).padStart(4)} active=${String(row.active_total).padStart(4)}`
      );
    });

    await printSection('Top Lifestyle Cities (Data Quality Check)');
    const [topCities] = await sequelize.query(
      `SELECT lifestyle_city, COUNT(*) AS total,
              SUM(CASE WHEN active_status = 1 AND deleted_at IS NULL THEN 1 ELSE 0 END) AS active_total
       FROM tbl_lifestyle
       GROUP BY lifestyle_city
       ORDER BY total DESC
       LIMIT 25`
    );
    topCities.forEach((row) => {
      console.log(
        `${String(row.lifestyle_city).padEnd(20)} total=${String(row.total).padStart(4)} active=${String(row.active_total).padStart(4)}`
      );
    });

    await printSection('Transport Coverage');
    const [transportStarts] = await sequelize.query(
      `SELECT start_location, COUNT(*) AS total
       FROM transport_gigs
       WHERE deleted_at IS NULL
       GROUP BY start_location
       ORDER BY total DESC, start_location`
    );
    transportStarts.forEach((row) => {
      console.log(`${String(row.start_location).padEnd(40)} ${String(row.total).padStart(3)}`);
    });

    await printSection('Weak-Signal Personalization Data');
    const [budgetSummary] = await sequelize.query(
      `SELECT destination, status, COUNT(*) AS total, ROUND(AVG(total_budget), 2) AS avg_budget
       FROM budget_plans
       GROUP BY destination, status
       ORDER BY total DESC`
    );
    const [reviewSummary] = await sequelize.query(
      `SELECT item_type, COUNT(*) AS total, ROUND(AVG(rating), 2) AS avg_rating
       FROM reviews
       GROUP BY item_type`
    );

    console.log('Budget plans:');
    budgetSummary.forEach((row) => {
      console.log(
        `  ${String(row.destination || 'NULL').padEnd(24)} ${String(row.status).padEnd(12)} total=${row.total} avg_budget=${row.avg_budget}`
      );
    });

    console.log('\nReviews:');
    reviewSummary.forEach((row) => {
      console.log(`  ${String(row.item_type).padEnd(12)} total=${row.total} avg_rating=${row.avg_rating}`);
    });

    await printSection('AI Readiness Warnings');

    const [[intelligenceRow]] = await sequelize.query(
      'SELECT COUNT(*) AS total FROM tbl_lifestyle_intelligence'
    );
    const [[reviewRow]] = await sequelize.query('SELECT COUNT(*) AS total FROM reviews');
    const intelligenceCount = Number(intelligenceRow.total || 0);
    const reviewCount = Number(reviewRow.total || 0);

    const warnings = [
      intelligenceCount === 0
        ? 'tbl_lifestyle_intelligence is empty, so persona/embedding retrieval is not ready yet.'
        : null,
      topCities.some((row) => !CORE_DESTINATIONS.includes(row.lifestyle_city))
        ? 'tbl_lifestyle mixes Sri Lanka rows with many foreign-city rows; AI retrieval must filter to Sri Lanka before ranking.'
        : null,
      coreCities.some((row) => row.lifestyle_city === 'ella')
        ? 'City naming is inconsistent (Ella vs ella, Nuwaraeliya vs Nuwara Eliya). Add canonical alias normalization.'
        : null,
      budgetSummary.some((row) => String(row.destination || '').includes(','))
        ? 'budget_plans.destination is not normalized and sometimes stores comma-separated cities.'
        : null,
      reviewCount < 50
        ? 'reviews are too sparse for training a recommender model; use them only as a lightweight ranking boost for now.'
        : null,
    ].filter(Boolean);

    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });

    if (warnings.length === 0) {
      console.log('No major warnings detected.');
    }
  } catch (error) {
    console.error('AI readiness audit failed:');
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
