const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// Generate JWT Token
const generateToken = (payload, expiresIn = "1d") => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Verify JWT Token
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                reject("Invalid or expired token");
            } else {
                resolve(decoded);
            }
        });
    });
};

module.exports = { generateToken, verifyToken };
