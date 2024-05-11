// VerifyRole returns a customized middleware function by using the 
// parameter requiredRole  of VerifyRole that checks whether a user is a certain role
const verifyRole = (requiredRole) => {
    return (req, res, next) => {
        // User has the wrong role and should not be able to access this endpoint.
        if (requiredRole !== req.user.role) {
            res.sendStatus(403); 
            return;
        }

        // Otherwise, the roles match and the next function is called.
        next();
    };
};

module.exports = verifyRole;