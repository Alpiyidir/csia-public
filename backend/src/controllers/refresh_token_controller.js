const { find_person_from_refresh_token } = require("../utils/database_operations.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Used to generate new accessToken from refreshToken
const refresh_token_controller = async (req, res, next) => {
	// Check for refresh token in "jwt" cookie
	const cookies = req.cookies;
	if (!cookies?.jwt) {
		res.sendStatus(401);
		return;
	}

	const refreshToken = cookies.jwt;
	const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken, "utf8").digest("hex");
	const person = await find_person_from_refresh_token(hashedRefreshToken);

	if (!person) {
		res.sendStatus(401);
		return;
	}

	// Refresh token does not match, this either means that the user has logged in somewhere else
	// and therefore their refresh token is different or their refresh token has been removed
	// from the database for security reasons

	// Validate that the refresh token received is also stored in the database, this ensures
	// that only one refresh token that is stored in the database can be used to create an
	// access token. If for any reason a users refreshtoken is compromised, this allows for
	// functionality to be develop that can remove the hashed refresh token from the
	// database, ensuring that the stolen token cannot be used although it is valid.
	if (hashedRefreshToken !== person.refreshToken) {
		res.sendStatus(403);
		return;
	}

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (e, decoded) => {
		// If refreshtoken expires return 403 indicating that the refresh token is valid
		// but has expired
		if (e) {
			res.sendStatus(403);
			return;
		}

		const accessToken = jwt.sign(
			{
				user: decoded.user,
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "15m" }
		);

		res.json({
			...decoded.user,
			accessToken,
		});
	});
};

module.exports = refresh_token_controller;
