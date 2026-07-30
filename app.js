require("dotenv").config();
const express = require("express");
const path = require("path");
const argon2 = require("argon2");
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

app.post("/create", async (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await db.query(
      "SELECT id FROM users WHERE username = $1;",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    const hashedPassword = await argon2.hash(password);
    const insertQuery = `
      INSERT INTO users (full_name, username, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, full_name, username, created_at;
    `;
    
    const result = await db.query(insertQuery, [fullname, username, hashedPassword]);
    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("Database error during user creation:", err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username is already taken.' });
    }
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.listen(3000);
module.exports = app;