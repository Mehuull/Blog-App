const { validateToken } = require("../services/authentication.js");

function CheckForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        
        // If the cookie is not present, move to the next middleware/route
        if (!tokenCookieValue) {
            return next();
        }

        try {
            // Validate the token and extract user information
            const userPayload = validateToken(tokenCookieValue);

            // Attach the user payload to the request object for further use
            req.user = userPayload;
        } catch (error) {
            // If token validation fails, log the error or handle it
            console.error("Invalid token:", error.message);
        }

        
        return next();
    };
}

module.exports = {
    CheckForAuthenticationCookie,
};
