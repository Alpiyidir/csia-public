const express = require("express");
const refresh_token_controller = require("../controllers/refresh_token_controller");
const router = express.Router();

router.get("/", refresh_token_controller);

module.exports = router;
