require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const verifyJWT = require("./middleware/verifyJWT");
const verifyRole = require("./middleware/verifyRole");

const refreshRouter = require("./routes/refresh");
const authRouter = require("./routes/auth");
const logoutRouter = require("./routes/logout");
const registerRouter = require("./routes/register");
const studentRouter = require("./routes/student");
const teacherRouter = require("./routes/teacher");

const corsOptions = require("./config/CORS_OPTIONS");
const ROLES = require("./config/ROLES");

const app = express();

/**
 * Get port from .env file
 */
const port = process.env.API_PORT;
app.set("port", port);

/**
 * Add middleware for additional functionality
 */
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/register", registerRouter);
app.use("/auth", authRouter);
app.use("/logout", logoutRouter);
app.use("/refresh", refreshRouter);
app.use("/student", verifyJWT, verifyRole(ROLES.student), studentRouter);
app.use("/teacher", verifyJWT, verifyRole(ROLES.teacher), teacherRouter);

// catch 404 and log in console (happens if none of the middleware used for routing has responded to the request to the api)
app.use((req, res, next) => {
	console.log("404");
	res.sendStatus(404);
});

app.listen(port);

module.exports = app;
