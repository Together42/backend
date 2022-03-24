const mysql = require('mysql2');//mysql모듈을 사용하겠따
require('dotenv').config();

let db = mysql.createConnection({
	host:process.env.DB_HOST,
	user:process.env.DB_USER,
	password:process.env.DB_PASS,
	port:process.env.DB_PORT,
	database:process.env.DB_NAME
});
db.connect();

module.exports = db;

//module.exports = {
//	connection: mysql.createConnection({
//	host:process.env.DB_HOST,
//	user:process.env.DB_USER,
//	password:process.env.DB_PASS,
//	port:3306,
//	database:process.env.DB_NAME
//})
//};
