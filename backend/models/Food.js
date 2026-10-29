
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    cuisine: {
      type: String,
      required: true
    },
    ingredients: {
      type: [String],
      default: []
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: ""
    },
    imageUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    collection: "foods"
  }
);

module.exports = mongoose.model("Food", foodSchema);
