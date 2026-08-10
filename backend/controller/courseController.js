const Course = require("../models/Course");

exports.addCourse = async (req, res) => {
  try {
    const { title, instructor, price, duration, category, description } =
      req.body;

    if (!title || !instructor || !price || !duration || !category || !description) {
      return res.status(400).json({ message: "All course fields are required" });
    }

    const images = req.files ? req.files.map((file) => file.filename) : [];

    const course = await Course.create({
      title,
      instructor,
      price,
      duration,
      category,
      description,
      images,
      createdBy: req.user.id,
      createdByRole: req.user.role,
    });

    res.status(201).json({
      message: "Course added successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Course add failed",
    });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Course fetch failed" });
  }
};

exports.getSingleCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Single course fetch failed" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const oldCourse = await Course.findById(req.params.id);

    if (!oldCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    let images = oldCourse.images;

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.filename);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        instructor: req.body.instructor,
        price: req.body.price,
        duration: req.body.duration,
        category: req.body.category,
        description: req.body.description,
        images,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Course update failed",
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Course delete failed" });
  }
};

exports.searchCourse = async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const courses = await Course.find({
      title: { $regex: keyword, $options: "i" },
    });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};