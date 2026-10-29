
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Kiem tra trang thai Backend
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend dang hoat dong",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected"
  });
});

// Ket noi MongoDB Atlas
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chua cau hinh MONGODB_URI trong .env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("Ket noi MongoDB Atlas thanh cong!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server dang chay tai http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Loi ket noi MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
