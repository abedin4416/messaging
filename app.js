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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, "public")));

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

function error(res, status, err) {
  return res.status(status).json({error:err});
}

function default_avatar(){
  let avatar = "https://ik.imagekit.io/9xzknibra/profile_avatar";
  let rand = Math.floor(Math.random()*4)+1;
  avatar += rand+".svg";
  return avatar;
}

async function session_verify(req, a=""){
  try{
    const sessionToken = req.cookies?.session_token;
    if(!sessionToken) return 0;
    const extraColumns = a.trim() ? `, ${a.trim()}` : "";
    const query = `
      SELECT u.username${extraColumns}
      FROM sessions s
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

    const hashedPassword = await argon2.hash(password);
    const avatar = default_avatar();
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now()+1*24*60*60*1000);

    await db.insert("users", {full_name: fullname, password_hash: hashedPassword, avatar_url: avatar});
    await db.insert("sessions", {username: username, session_token: sessionToken, expires_at: expiresAt});
    
    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });
    
    return res.status(201).json({
      loggedIn: true,
      fullname:fullname,
      username:username,
      profilepic:avatar
    });

  } catch (err) {
    if (err.code === '23505') {
      return error(res, 409, 'Username is not available');
    }
    return error(res, 500, 'Failed to create user.');
  }
});

app.get("/session", async (req, res) => {
  try{
    const session = await session_verify(req, "u.full_name, u.avatar_url");
    if(session==0 || !session){
      return res.status(201).json({loggedIn: false});
    }

    return res.status(200).json({
      loggedIn: true,
      username: session.username,
      fullname: session.full_name,
      profilepic: session.avatar_url
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

    await db.insert("sessions", {
      username: user.username,
      session_token: sessionToken,
      expires_at: expiresAt
    });

    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });
    
    return res.status(201).json({
      loggedIn: true,
      fullname: user.full_name,
      username: user.username,
      profilepic: user.avatar_url
    });

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

app.post("/pusher/auth", async (req, res) => {
  try {
    const session = await session_verify(req);

    if (session === 0 || !session) return error(res, 401, "Unauthorized");

    const socketId = req.body?.socket_id;
    const channelName = req.body?.channel_name;
    const currentUsername = session.username;

    if (!socketId || !channelName) {
      return res.status(400).json({ error: "Missing socket_id or channel_name" });
    }

    if (channelName.includes(currentUsername)) {
      const authResponse = pusher.authorizeChannel(socketId, channelName);
      return res.send(authResponse);
    } else {
      return res.status(403).json({ error: "Forbidden: Not authorized for this chat" });
    }
  } catch (err) {
    console.error("Pusher Auth Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/send", async (req, res)=> {
  try{
    const session = await session_verify(req);
    const {receiver, content } = req.body;

    if(session==0 || !session) return error(res, 401, "Session invalid");
    if(!receiver || !content) return error(res, 400, "Missing required fields");

    const newMessage = await db.insert("messages", {
      sender_username: session.username,
      receiver_username: receiver,
      content: content
    });

    const channelName = [session.username, receiver].sort().join("-");

    await pusher.trigger(`private-chat-${channelName}`, "new-message", newMessage, {socket_id: req.body.socket_id});
    await pusher.trigger(`private-inbox-${receiver}`, "inbox-update", newMessage);

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