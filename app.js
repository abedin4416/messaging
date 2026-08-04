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

function error(res, status, err) {
  return res.status(status).json({error:err});
}

app.post("/create", async (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || !password) {
    return error(res, 400, 'All fields are required.');
  }

  try {
    const existingUser = await userexists(username);
    if (existingUser) {
      return error(res, 409, 'Username is not available.');
    }

    await db.query("BEGIN;");

    const hashedPassword = await argon2.hash(password);
    const insertQuery = `
      INSERT INTO users (full_name, username, password_hash)
      VALUES ($1, $2, $3);`;
    
    await db.query(insertQuery, [fullname, username, hashedPassword]);
    
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now()+1*24*60*60*1000);

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
      return error(res, 409, 'Username is not available');
    }
    return error(res, 500, 'Failed to create user.');
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

app.post("/signout", async (req, res) => {
  const sessionToken = req.cookies.session_token;

  if(sessionToken) {
    await db.query("DELETE FROM sessions WHERE session_token = $1;", [sessionToken]);
  }
  res.clearCookie("session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax"
  });
  return res.json({success: true});
});

app.post("/signin", async (req, res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return error(res, 400, "Username and password are required.");
  }

  try {
    const userResult = await db.query(
      "SELECT full_name, username, password_hash FROM users WHERE username = $1;",
      [username]
    );
    if(userResult.rows.length === 0) {
      return error(res, 401, "Invalid username or password.");
    }

    const user = userResult.rows[0];

    const isValidPassword = await argon2.verify(user.password_hash, password);
    if(!isValidPassword) {
      return error(res, 401, "Invalid username or password.");
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO sessions (username, session_token, expires_at) VALUES ($1, $2, $3);`,
      [user.username, sessionToken, expiresAt]
    );
    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });
    
    return res.status(201).json({loggedIn: true, user:{
      fullname: user.full_name,
      username: user.username
    }});

  } catch (err) {
    return error(res, 500, "Sign in error. Please try again.");
  }
});

app.post("/search", async (req, res)=> {
  const { username } = req.body;
  if(!username || username.trim() === ""){
    return res.status(400);
  }
  try{
    const searchQuery = `
      SELECT full_name, username
      FROM users
      WHERE username = $1;`;

    const result = await db.query(searchQuery, [username.trim()]);

    if(result.rows.length === 0){
      return res.status(404).json({error: "User not found."});
    }

    return res.json({
      fullname: result.rows[0].full_name,
      username: result.rows[0].username
    });
  } catch (err){
    return res.status(500).json({msg: "Failed to search user."});
  }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(import.meta.dirname, 'public', 'index.html'));
});

if (process.env.VERCEL !== '1') app.listen(3000);
export default app;