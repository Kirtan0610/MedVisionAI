const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes   = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes   = require("./routes/userRoutes");
const chatRoutes   = require("./routes/chatRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",    authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users",   userRoutes);
app.use("/api/chat",    chatRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
