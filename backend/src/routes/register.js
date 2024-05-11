const express = require("express");
const router = express.Router();

const registerController = require("../controllers/register_controller");

const {body} = require("express-validator");

router.post("/", [body("email").isEmail().withMessage("Invalid email"), body("password").isLength({min: 8}).withMessage("Password must be a minimum of 8 characters long"), body("firstName").isAlpha().withMessage("First Name must be alphabetic"), body("lastName").isAlpha().withMessage("Last Name must be alphabetic")], registerController);

module.exports = router;
