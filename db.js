const { Client } = require('pg');

// Database connection configuration
const client = new Client({
    user: 'postgres',      // Replace with your PostgreSQL username
    host: 'localhost',     // PostgreSQL server host
    database: 'Product2',  // Replace with your existing database name
    password: 'yoomii0929', // Replace with your password
    port: 5432,            // PostgreSQL server port
});

// Connect to the database
client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error', err));

// Exporting client
module.exports = { client };
