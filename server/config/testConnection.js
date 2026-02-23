/**
 * Database Connection Test Script
 * Run: node config/testConnection.js
 *
 * Tests:
 * 1. Connection to production_test4_new database
 * 2. Lists all existing tables
 * 3. Describes the hotels table (if it exists)
 */

require('dotenv').config();
const sequelize = require('./database');

async function testConnection() {
  console.log('\n========================================');
  console.log('  TravelLanka - Database Connection Test');
  console.log('========================================\n');

  try {
    // 1. Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    console.log(`   → Host     : ${process.env.DB_HOST}`);
    console.log(`   → Database : ${process.env.DB_NAME}`);
    console.log(`   → User     : ${process.env.DB_USER}\n`);

    // 2. List all tables
    const [tables] = await sequelize.query('SHOW TABLES;');
    console.log('📋 Tables found in database:');
    if (tables.length === 0) {
      console.log('   (No tables found)');
    } else {
      tables.forEach((row, i) => {
        const tableName = Object.values(row)[0];
        console.log(`   ${i + 1}. ${tableName}`);
      });
    }
    console.log('');

    // 3. Try to describe the hotels table
    try {
      const [columns] = await sequelize.query('DESCRIBE hotels;');
      console.log('🏨 Schema for `hotels` table:');
      console.log('   Field                | Type              | Null | Key | Default');
      console.log('   ---------------------|-------------------|------|-----|--------');
      columns.forEach(col => {
        const field   = (col.Field   || '').padEnd(20);
        const type    = (col.Type    || '').padEnd(18);
        const nullVal = (col.Null    || '').padEnd(4);
        const key     = (col.Key     || '').padEnd(3);
        const def     = col.Default !== null ? col.Default : 'NULL';
        console.log(`   ${field} | ${type} | ${nullVal} | ${key} | ${def}`);
      });

      // Show a sample row count
      const [[countResult]] = await sequelize.query('SELECT COUNT(*) as total FROM hotels;');
      console.log(`\n   Total rows in hotels: ${countResult.total}`);
    } catch (err) {
      console.log('ℹ️  No `hotels` table found yet (will be created by model sync).');
    }

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('\nCheck your .env file:');
    console.error(`   DB_HOST     = ${process.env.DB_HOST}`);
    console.error(`   DB_NAME     = ${process.env.DB_NAME}`);
    console.error(`   DB_USER     = ${process.env.DB_USER}`);
    console.error(`   DB_PASSWORD = (hidden)`);
  } finally {
    await sequelize.close();
    console.log('\n========================================\n');
  }
}

testConnection();
