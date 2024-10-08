const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/database");

const apiRoutes = require("./routes/api");
const webRoutes = require("./routes/web");
const authRoutes = require('./routes/authRoutes');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/", webRoutes);
app.use("/api", apiRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
