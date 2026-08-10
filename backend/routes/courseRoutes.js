const express = require("express");
const router = express.Router();

const courseController = require("../controller/courseController");
const upload = require("../middleware/upload");
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.get("/", courseController.getCourses);
router.get("/search/:keyword", courseController.searchCourse);
router.get("/:id", courseController.getSingleCourse);

router.post(
  "/",
  protect,
  allowRoles("admin", "instructor"),
  upload.array("images", 5),
  courseController.addCourse
);

router.put(
  "/:id",
  protect,
  allowRoles("admin", "instructor"),
  upload.array("images", 5),
  courseController.updateCourse
);

router.delete(
  "/:id",
  protect,
  allowRoles("admin", "instructor"),
  courseController.deleteCourse
);

module.exports = router;