/**
 * Import tbl_lifestyle data from CSV file.
 * Deletes all existing records, then inserts all rows from the CSV.
 * Run from project root: node database/seeders/importLifestyleCSV.js
 */

const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

const CSV_PATH = path.join(__dirname, '../../../tbl_lifestyle.csv');

// Map CSV header names to DB column names (they match exactly)
const DB_COLUMNS = [
  'lifestyle_id',
  'lifestyle_city',
  'lifestyle_attraction_type',
  'lifestyle_name',
  'lifestyle_description',
  'latitude',
  'longitude',
  'address',
  'micro_location',
  'tripadvisor',
  'preferred',
  'selling_points',
  'pref_start_date',
  'pref_end_date',
  'vendor_id',
  'provider',
  'provider_id',
  'active_status',
  'image',
  'category1',
  'category2',
  'category3',
  'category4',
  'priority_value',
  'additional_data_6',
  'additional_data_7',
  'additional_data_8',
  'additional_data_9',
  'additional_data_10',
  'created_at',
  'updated_at',
  'updated_by',
  'markup',
  'auto_confirmation',
  'triggers',
  'sub_description',
  'deleted_at',
  'country',
  'adult_rate',
  'child_rate',
  'currency',
  'default_rate',
  'inventory_end_date',
  'inventory_start_date',
  'package_rate',
];

// Nullify empty strings for numeric / date fields
const NULL_IF_EMPTY = new Set([
  'lifestyle_id', 'latitude', 'longitude', 'provider_id', 'active_status',
  'priority_value', 'markup', 'auto_confirmation', 'triggers',
  'adult_rate', 'child_rate', 'default_rate', 'package_rate',
  'pref_start_date', 'pref_end_date', 'created_at', 'updated_at',
  'deleted_at', 'inventory_end_date', 'inventory_start_date',
]);

function coerce(col, val) {
  if (val === '' || val === 'NULL' || val === null || val === undefined) {
    return NULL_IF_EMPTY.has(col) ? null : null; // null for everything when empty
  }
  return val;
}

const BATCH_SIZE = 200;

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV file not found at:', CSV_PATH);
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    multipleStatements: false,
  });

  console.log('Connected to DB:', process.env.DB_NAME);

  // Delete all existing lifestyle records
  const [delResult] = await conn.execute('DELETE FROM tbl_lifestyle');
  console.log(`Deleted ${delResult.affectedRows} existing records.`);

  // Disable auto-increment check so we can insert with explicit IDs
  await conn.execute('ALTER TABLE tbl_lifestyle AUTO_INCREMENT = 1');

  const placeholders = DB_COLUMNS.map(() => '?').join(', ');
  const colList = DB_COLUMNS.map(c => `\`${c}\``).join(', ');
  const insertSQL = `INSERT INTO tbl_lifestyle (${colList}) VALUES (${placeholders})`;

  let batch = [];
  let totalInserted = 0;
  let rowNum = 0;
  let errorCount = 0;

  const flushBatch = async () => {
    if (batch.length === 0) return;
    for (const values of batch) {
      try {
        await conn.execute(insertSQL, values);
        totalInserted++;
      } catch (err) {
        errorCount++;
        console.warn(`Row insert failed (id=${values[0]}): ${err.message}`);
      }
    }
    batch = [];
  };

  const stream = fs.createReadStream(CSV_PATH, { encoding: 'utf8' });
  const parser = stream.pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
      bom: true,
    })
  );

  for await (const record of parser) {
    rowNum++;
    const values = DB_COLUMNS.map(col => coerce(col, record[col]));
    batch.push(values);
    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
      if (totalInserted % 1000 === 0) {
        console.log(`  Inserted ${totalInserted} rows so far...`);
      }
    }
  }

  // Flush remaining
  await flushBatch();

  console.log(`\nDone! Total CSV rows: ${rowNum}, Inserted: ${totalInserted}, Errors: ${errorCount}`);
  await conn.end();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
