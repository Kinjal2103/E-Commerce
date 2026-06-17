const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }

  return jwt.sign(
    { id, role },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return reject(new Error('JWT_SECRET environment variable is missing.'));
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken,
  verifyToken
};
