require("dotenv").config();
const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Pusher = require("pusher");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});

app.get("/", (req, res) => {
    res.send("Express app running from root on vercel!");
});

app.get("/users", (req, res) => {
    res.json({success: true, users: ["Alice", "Bob"]});
});

if(process.env.NODE_ENV != "production"){
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;