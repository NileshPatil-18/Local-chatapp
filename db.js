const {Pool}=require('pg');
require('dotenv').config();

 const pool = new Pool({
    connectionString : process.env.DB_URL,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    host:process.env.DB_HOST,
    database: process.env.DB_NAME,
    port:process.env.DB_PORT
}); 
  
module.exports = pool;