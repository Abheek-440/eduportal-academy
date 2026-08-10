const express = require("express");
const router = express.Router();
const lctrl = require("../controller/liveClassController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.post("/",protect,allowRoles("admin","instructor","teacher","Teacher"),lctrl.createLiveclass);
router.get("/",lctrl.getliveclasses);
router.get("/:id",lctrl.getsingelliveclasses);
router.delete("/:id",protect,allowRoles("admin","instructor","teacher","Teacher"),lctrl.deleteLiveclass);

module.exports = router;