var mysql = require("mysql2");
require("dotenv").config();
var db = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
};
var connection = mysql.createConnection(db);
module.exports = connection;
