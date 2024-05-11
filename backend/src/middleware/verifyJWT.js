const jwt = require("jsonwebtoken");


const verifyJWT = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	// If there isn't an auth header, the request is terminated and a response status 401 indicating that the user is unauthorized is returned
	if (!authHeader) {
		return res.sendStatus(401);
	}
	// Retrieves the second part of the authHeader string as it is in the format "Bearer {accessToken}"
	const token = authHeader.split(" ")[1];

	// Using the JWT library to decode the accessToken with the secret key
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (e, decoded) => {
		if (e) {
			//invalid/expired token, therefore returning forbidden status code
			res.status(403).send({message: "accesstoken"});
			return;
		}

		// If everything executes without errors, the req.user field is set to the user data from the decoded jwt token "decoded", then, the next function is 
		// called to pass the request onto the next function
		req.user = decoded.user;
		next();
		return;
	});
};

module.exports = verifyJWT;
