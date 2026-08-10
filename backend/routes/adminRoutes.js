const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, adminController.getDashboardData);
router.delete("/users/:id", protect, allowRoles("admin"), adminController.deleteUser);

module.exports = router;