const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: String,
    instructor: String,
    price: Number,
    duration: String,
    category: String,
    description: String,
    images: [String],
    createdBy: String,
    createdByRole: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);