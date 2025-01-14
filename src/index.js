require('dotenv').config({ path: './src/.env' });  
const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");
const app = express();

app.use(bodyparser.json());
app.use(cors());

const port = process.env.SERVER_PORT || 8001;

// let users = [];
// let counter = 1;

let conn = null;


const initMysql = async () => {
	conn = await mysql.createConnection({
        host: process.env.DB_HOST,       
        user: process.env.DB_USER,       
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_DATABASE, 
        port: process.env.DB_PORT,       
	});
};

app.get("/testdb-new", async (req, res) => {
	try {
		const results = await conn.query("SELECT * FROM users");
		res.json(results[0]);
	} catch (error) {
		console.error("Error fetching data", error.message);
		res.status(500).json({ error: "Error fetching data" });
	}
});

// create  server
app.listen(port, async (req, res) => {
	await initMysql();
	console.log(`Server is running on port ${port}`);
});
