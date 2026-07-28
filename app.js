const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.post("/message", (req, res) => {
    res.json({text: "Hello, from the server."});
})

app.listen(3000);
module.exports = app;