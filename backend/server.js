
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Food = require("./models/Food");
const foodRoutes = require("./routes/foods");

const app = express();

app.use(cors());
app.use(express.json());

// API kiem tra Backend
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "OK" : "ERROR",
    message: "Backend dang hoat dong",
    database: connected ? "Connected" : "Disconnected"
  });
});

// API quan ly mon an
app.use("/api/foods", foodRoutes);

// Xu ly URL khong ton tai
app.use((req, res) => {
  res.status(404).json({
    message: "Khong tim thay API"
  });
});

// Xu ly loi
app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Ma mon an foodId da ton tai"
    });
  }

  if (err.name === "ValidationError" ||
      err.name === "CastError" ||
      err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Du lieu khong hop le"
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Khong the ket noi co so du lieu"
    });
  }

  res.status(500).json({
    message: "Loi may chu"
  });
});

// Ket noi MongoDB Atlas
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chua cau hinh MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    await Food.init();

    console.log("MongoDB Atlas ket noi thanh cong!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server dang chay tai http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Loi ket noi:", error.message);
    process.exit(1);
  }
}

startServer();
