const mysql = require('mysql');

let connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD
});

connection.connect((error) => {
  if (error) throw error;
  console.log('Connected to database.');
  connection.query('CREATE DATABASE subscriptions', (error, result) => {
    if (error) throw error;
    console.log('Database created', result);
  });
});

module.exports = connection;
