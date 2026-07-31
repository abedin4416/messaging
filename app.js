import crypto from "crypto";
import "dotenv/config";
import express from "express";
import path from "path";
import argon2 from "argon2";
import cookieParser from "cookie-parser";
import db from "./api/database.js";
import { userexists } from "./api/verify.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
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
    const existingUser = await userexists(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username is not available.' });
    }

    await db.query("BEGIN;");

    const hashedPassword = await argon2.hash(password);
    const insertQuery = `
      INSERT INTO users (full_name, username, password_hash)
      VALUES ($1, $2, $3);`;
    
    await db.query(insertQuery, [fullname, username, hashedPassword]);
    
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now()+2*24*60*60*1000);

    await db.query(
      `INSERT INTO sessions (username, session_token, expires_at)
       VALUES ($1, $2, $3::timestamptz);`,
      [username, sessionToken, expiresAt]
    );

    await db.query("COMMIT;");
    
    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });
    
    return res.status(201).json({loggedIn: true, user: username});

  } catch (err) {
    await db.query("ROLLBACK;");
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username is not available' });
    }
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.get("/session", async (req, res) => {
  try{
    const sessionToken = req.cookies?.session_token;
    if(!sessionToken){
      return res.status(200).json({loggedIn: false});
    }

    const query = `
      SELECT u.username, u.full_name
      FROM sessions s
      JOIN users u ON s.username = u.username
      WHERE s.session_token = $1 AND s.expires_at > NOW();
      `;
    const result = await db.query(query, [sessionToken]);

    if(!result.rows || result.rows.length === 0) {
      return res.status(200).json({loggedIn: false});
    }

    const session = result.rows[0];

    return res.status(200).json({
      loggedIn: true,
      user: {
        username: session.username,
        fullname: session.full_name,
      },
    });
  } catch (err) {
    console.error("Auth check error: ", err);
    return res.status(500).json({loggedIn: false, error: err.message});
  }
});

app.post("/logout", async (req, res) => {
  const sessionToken = req.cookies.session_token;

  if(sessionToken) {
    await db.query("DELETE FROM sessions WHERE sessions_token = $1;", [sessionToken]);
  }
  res.clearCookie("session_token");
  return res.join({success: true});
})

app.get("*", (req, res) => {
    res.sendFile(path.join(import.meta.dirname, 'public', 'index.html'));
});

if (process.env.VERCEL !== '1') app.listen(3000);
export default app;