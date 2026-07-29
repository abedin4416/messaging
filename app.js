const express = require("express");
const path = require("path");

const app = express();
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

app.listen(3000);
module.exports = app;