require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres', // Connect to default DB first to create lumiara
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seed() {
  try {
    // Try to create database
    try {
      await pool.query('CREATE DATABASE lumiara');
      console.log('Database lumiara created.');
    } catch (e) {
      console.log('Database lumiara might already exist.');
    }
    
    await pool.end();

    const appPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    console.log('Creating table...');
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS wisata (
        id SERIAL PRIMARY KEY,
        original_id INT,
        nama_wisata VARCHAR(255),
        kategori_wisata VARCHAR(255),
        deskripsi TEXT,
        lokasi VARCHAR(255),
        fasilitas TEXT,
        harga_tiket INT,
        jam_buka VARCHAR(100)
      );
    `);
    console.log('Table created.');

    const dataPath = path.join(__dirname, '..', 'wisata.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`Seeding ${data.length} records...`);
    for (const item of data) {
      await appPool.query(`
        INSERT INTO wisata (original_id, nama_wisata, kategori_wisata, deskripsi, lokasi, fasilitas, harga_tiket, jam_buka)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        item.id,
        item.nama_wisata,
        item.kategori_wisata,
        item.deskripsi,
        item.lokasi,
        item.fasilitas,
        item.harga_tiket,
        item.jam_buka
      ]);
    }
    console.log('Seeding complete.');
    await appPool.end();
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seed();
