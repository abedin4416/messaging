const express = require("express");
const path = require("path");
const db = require("./api/database");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/", (req, res) => {
    res.json({signtext: "Sign in to your account."});
});

app.post("/signup", (req, res) => {
    res.json({signtext: "Create a new account."});
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.post("/users", async (req, res) => {
    const {username, password} = req.body;
    const result = await db.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;",
        [username, password]
    );
    res.status(201).json(result.rows[0]);
});

app.listen(3000);
module.exports = app;