import "dotenv/config";
import express from "express";
import path from "path";
import argon2 from "argon2";
import db from "./api/database.js";
import { userexists } from "./api/verify.js";

const app = express();
app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, "public")));

app.post("/", (req, res) => {
    res.json({signtext: "Sign in to your account."});
});

app.post("/signup", (req, res) => {
    res.json({signtext: "Create a new account."});
});

app.post("/create", async (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    if (await userexists(username)) {
      return res.status(409).json({ error: 'Username is not available.' });
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
    //console.error("Database error during user creation:", err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username is not available' });
    }
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(import.meta.dirname, 'public', 'index.html'));
});

if (process.env.VERCEL !== '1') app.listen(3000);
export default app;