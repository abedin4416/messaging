require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, I am Tanim.");
});

app.get("/users", (req, res) => {
    res.json({success: true, users: ["Alice", "Bob"]});
});

if(process.env.NODE_ENV != "production"){
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;