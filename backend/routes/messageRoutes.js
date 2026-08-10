const express = require("express");
const router = express.Router();
const mctrl = require("../controller/messageController");
const { protect } = require("../middleware/authMiddleware");

router.get("/contacts", protect, mctrl.getContacts);
router.get("/:senderId/:receiverId", protect, mctrl.getmessages);

module.exports = router;
