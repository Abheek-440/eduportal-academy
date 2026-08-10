const express = require("express");
const router = express.Router();
const chatctrl = require("../controller/chatbotController");

router.post("/course-recommend",chatctrl.coursechatbot);

module.exports = router;