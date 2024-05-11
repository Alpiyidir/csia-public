const express = require("express");
const login_controller = require("../controllers/login_controller.js");
const router = express.Router();

router.post("/", login_controller);

module.exports = router;