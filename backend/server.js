const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// middleware
app.use(cors());
app.use(express.json());


// 🔥 AUTH ROUTES (THIS WAS THE ISSUE)
app.use("/api/auth", authRoutes);
// Posts router (file is named `post.js` in the routes folder)
app.use("/api/posts", require("./routes/post"));
console.log('DEBUG: posts router mounted at /api/posts');

// base route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// database + server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));
