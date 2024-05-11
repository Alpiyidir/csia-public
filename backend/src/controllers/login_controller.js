const { set_refresh_token } = require("../utils/database_operations.js");
const {
	given_password_matches_db_password,
	find_role_of_person_from_email,
} = require("../utils/database_logic.js");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const login_controller = async (req, res, next) => {
	const { email, password } = req.body;
	// Validation checks
	// Checks if email and password are an empty string or null, 
	// both return the same message
	if (!email || !password) {
		res.status(400).json({
			message: "Both an email and password must be entered.",
		});
		return;
	}

	const { person, match } = await given_password_matches_db_password(
		password,
		email
	);

	if (match !== true) {
		res.status(400).json({
			message: "Incorrect email or password.",
		});
		return;
	}
	const { role, roleInfo } = await find_role_of_person_from_email(email);	
	
	// Create object with the contents of the tokens
	const userContents = {
		email: person.email,
		firstName: person.firstName,
		lastName: person.lastName,
		role: role,
		roleInfo: roleInfo,
	};

	// Create initial access token
	const accessToken = jwt.sign(
		{
			user: {
				...userContents,
			},
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "15m" }
	);

	// Create refresh token
	const refreshToken = jwt.sign(
		{
			user: {
				...userContents,
			},
		},
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "1d" }
	);

	// As a refresh token can be used to create access tokens, which 
	// grant access to the account, their hashed version is stored
	// in the db to prevent them from being used to steal accounts 
	// if hijacked
	const hashedRefreshToken = crypto
		.createHash("sha256")
		.update(refreshToken, "utf8")
		.digest("hex");
	set_refresh_token(email, hashedRefreshToken);
	
	// Set jwt cookie of the response to the refresh token, so that 
	// it can be later used by the front-end.
	res.cookie("jwt", refreshToken, {
		httpOnly: true,
		secure: true,
		maxAge: 1000 * 60 * 60 * 12,
	});
	
	// Send access token, and the user contents so that it can be 
	// used to manage front-end render logic
	res.json({
		...userContents,
		accessToken,
	});
};

module.exports = login_controller;
