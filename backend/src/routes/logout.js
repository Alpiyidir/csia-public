const express = require("express");
const logout_controller = require("../controllers/logout_controller.js");
const router = express.Router();



router.get("/", logout_controller);

module.exports = router;