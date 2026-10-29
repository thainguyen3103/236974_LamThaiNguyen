
const express = require("express");
const mongoose = require("mongoose");
const Food = require("../models/Food");

const router = express.Router();

const fields = [
  "foodId", "name", "category", "cuisine",
  "ingredients", "price", "quantity",
  "description", "imageUrl"
];

const handle = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Kiem tra du lieu dau vao
function validateFood(body, isCreate = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Du lieu phai la mot JSON object";
  }

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return "Vui long nhap du lieu mon an";
  }

  if (keys.some((key) => !fields.includes(key))) {
    return "Du lieu chua truong khong hop le";
  }

  const required = ["foodId", "name", "category", "cuisine"];

  for (const key of required) {
    if (isCreate || key in body) {
      if (typeof body[key] !== "string" || !body[key].trim()) {
        return `${key} khong duoc de trong`;
      }
    }
  }

  for (const key of ["price", "quantity"]) {
    if (isCreate || key in body) {
      if (
        typeof body[key] !== "number" ||
        !Number.isFinite(body[key]) ||
        body[key] < 0
      ) {
        return `${key} phai la so khong am`;
      }
    }
  }

  if ("quantity" in body && !Number.isInteger(body.quantity)) {
    return "quantity phai la so nguyen";
  }

  if ("ingredients" in body) {
    if (
      !Array.isArray(body.ingredients) ||
      body.ingredients.some(
        (x) => typeof x !== "string" || !x.trim()
      )
    ) {
      return "ingredients phai la mang chuoi hop le";
    }
  }

  for (const key of ["description", "imageUrl"]) {
    if (key in body && typeof body[key] !== "string") {
      return `${key} phai la chuoi`;
    }
  }

  return null;
}

// Tim mon an bang MongoDB _id hoac foodId
function findFood(id) {
  if (mongoose.isValidObjectId(id)) {
    return Food.findById(id);
  }
  return Food.findOne({ foodId: id });
}

// GET: Danh sach va tim kiem mon an
router.get("/", handle(async (req, res) => {
  const { search } = req.query;

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({ message: "Tu khoa khong hop le" });
  }

  let filter = {};

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    filter = {
      $or: [
        { name: regex },
        { category: regex },
        { cuisine: regex }
      ]
    };
  }

  const foods = await Food.find(filter).sort({ _id: -1 });
  res.status(200).json(foods);
}));

// GET: Xem chi tiet mot mon an
router.get("/:id", handle(async (req, res) => {
  const food = await findFood(req.params.id);

  if (!food) {
    return res.status(404).json({
      message: "Khong tim thay mon an"
    });
  }

  res.status(200).json(food);
}));

// POST: Them mon an
router.post("/", handle(async (req, res) => {
  const error = validateFood(req.body, true);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const data = { ...req.body };

  for (const key of ["foodId", "name", "category", "cuisine"]) {
    data[key] = data[key].trim();
  }

  const food = await Food.create(data);

  res.status(201).json({
    message: "Them mon an thanh cong",
    food
  });
}));

// PUT: Cap nhat mon an
router.put("/:id", handle(async (req, res) => {
  const error = validateFood(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const food = await findFood(req.params.id);

  if (!food) {
    return res.status(404).json({
      message: "Khong tim thay mon an"
    });
  }

  const data = { ...req.body };

  for (const key of ["foodId", "name", "category", "cuisine"]) {
    if (key in data) {
      data[key] = data[key].trim();
    }
  }

  Object.assign(food, data);
  await food.save();

  res.status(200).json({
    message: "Cap nhat mon an thanh cong",
    food
  });
}));

// DELETE: Xoa mon an
router.delete("/:id", handle(async (req, res) => {
  const food = await findFood(req.params.id);

  if (!food) {
    return res.status(404).json({
      message: "Khong tim thay mon an"
    });
  }

  await food.deleteOne();

  res.status(200).json({
    message: "Xoa mon an thanh cong"
  });
}));

module.exports = router;
