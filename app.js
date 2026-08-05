import crypto from "crypto";
import "dotenv/config";
import express from "express";
import path from "path";
import argon2 from "argon2";
import cookieParser from "cookie-parser";
import db from "./api/database.js";
import { userexists } from "./api/verify.js";
import Pusher from "pusher";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, "public")));

function error(res, status, err) {
  return res.status(status).json({error:err});
}

function default_avatar(){
  let avatar = "https://ik.imagekit.io/9xzknibra/profile_avatar";
  let rand = Math.floor(Math.random()*4)+1;
  avatar += rand+".svg";
  return avatar;
}

async function session_verify(req, a){
  try{
    const sessionToken = req.cookies?.session_token;
    if(!sessionToken) return 0;
    const query = `
      SELECT u.username, ${a} FROM sessions s
      JOIN users u ON s.username = u.username
      WHERE s.session_token = $1 AND s.expires_at > NOW();`;
    const result = await db.query(query, [sessionToken]);
    if(!result.rows || result.rows.length === 0) return 0;
    return result.rows[0];
  }catch(err){
    throw err;
  }
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
    const avatar = default_avatar();
    const insertQuery = `
      INSERT INTO users (full_name, username, password_hash, avatar_url)
      VALUES ($1, $2, $3, $4);`;
    
    await db.query(insertQuery, [fullname, username, hashedPassword, avatar]);
    
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
    
    return res.status(201).json({loggedIn: true, user:{ 
      fullname:fullname,
      username:username,
      profilepic:avatar
    }});

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
    const session = await session_verify(req, "u.fullname, u.avatar_url");
    if(session==0){
      return res.status(200).json({loggedIn: false});
    }

    return res.status(200).json({
      loggedIn: true,
      user: {
        username: session.username,
        fullname: session.full_name,
        profilepic: session.avatar_url
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
      "SELECT full_name, username, password_hash, avatar_url FROM users WHERE username = $1;",
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
      username: user.username,
      profilepic: user.avatar_url
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
      SELECT full_name, username, avatar_url
      FROM users
      WHERE username = $1;`;

    const result = await db.query(searchQuery, [username.trim()]);

    if(result.rows.length === 0){
      return res.status(404).json({error: "User not found."});
    }

    return res.json({
      fullname: result.rows[0].full_name,
      username: result.rows[0].username,
      profilepic: result.rows[0].avatar_url
    });
  } catch (err){
    return res.status(500).json({msg: "Failed to search user."});
  }
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

app.post("/pusher/auth", async (req, res) => {
  try {
    // 1. Verify session using your session_verify function
    const session = await session_verify(req, "u.username");

    if (session === 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. Extract socket_id and channel_name sent automatically by Pusher JS SDK
    const socketId = req.body.socket_id;
    const channelName = req.body.channel_name; // e.g. "private-chat-userA-userB"
    const currentUsername = session.username;

    // 3. Security Check: Only allow access if the channel contains their username
    if (channelName.includes(currentUsername)) {
      // Generate the official auth signature required by Pusher
      const authResponse = pusher.authorizeChannel(socketId, channelName);
      return res.send(authResponse);
    } else {
      // Block unauthorized access/eavesdropping
      return res.status(403).json({ error: "Forbidden: Not authorized for this chat" });
    }
  } catch (err) {
    console.error("Pusher Auth Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/me - Returns current user profile based on session_token cookie
app.get("/api/me", async (req, res) => {
  try {
    // Verify session using your custom session_verify helper
    const session = await session_verify(req, "u.username");

    // If missing or expired session
    if (session === 0) {
      return res.status(401).json({ error: "Unauthorized: Not logged in" });
    }

    // Return the verified user details
    return res.status(200).json({
      username: session.username,
    });
  } catch (err) {
    console.error("GET /api/me Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/send", async (req, res)=> {
  try{
    const session = await session_verify(req, "u.username");
    const {receiver, content } = req.body;

    if(session==0) return error(res, 401, "Session invalid");

    if(!receiver || !content){
      return error(res, 400, "Missing required fields");
    }

    const insertQuery = `
      INSERT INTO messages (sender_username, receiver_username, content)
      VALUES ($1, $2, $3)
      RETURNING id, sender_username, receiver_username, content, created_at;
      `;
    const result = await db.query(insertQuery, [session.username, receiver, content]);
    const newMessage = result.rows[0];

    const channelName = [session.username, receiver].sort().join("-");

    await pusher.trigger(`chat-$(channelName)`, "new-message", newMessage);

    return res.status(200).json({success:true, message: newMessage});
  } catch(err){
    return res.status(500).json({error: "Failed to send message"});
  }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(import.meta.dirname, 'public', 'index.html'));
});

if (process.env.VERCEL !== '1') app.listen(3000);
export default app;