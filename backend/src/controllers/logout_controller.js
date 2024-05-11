const {set_refresh_token, find_person_from_refresh_token} = require("../utils/database_operations.js");

const logout_controller = async (req, res, next) => {
	const cookies = req.cookies;
	if (!cookies?.jwt) {
		res.sendStatus(200);
		return;
	}

	const refreshToken = cookies.jwt;

	const person = await find_person_from_refresh_token(refreshToken);

	if (person) {
		set_refresh_token(person.email, null);
	}

	res.clearCookie("jwt", refreshToken, {
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 12,
	});
	res.sendStatus(204);
};

module.exports = logout_controller;
