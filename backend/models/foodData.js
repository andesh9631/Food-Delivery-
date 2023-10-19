const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FoodDataSchema = new Schema({
  CategoryName: {
    type: String,
    required: [true],
  },
  name: {
    type: String,
  },
  img: String,
  options: [
    {
      half: String,
      full: String,
    }
  ],
  description: String,
});
const FoodData = mongoose.model("FoodData", FoodDataSchema);
module.exports = FoodData;
