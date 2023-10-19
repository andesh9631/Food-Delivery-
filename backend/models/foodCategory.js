const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FoodCategorySchema = new Schema({
  CategoryName: String,
});

const FoodCategory = mongoose.model("FoodCategory", FoodCategorySchema);
module.exports = FoodCategory;
