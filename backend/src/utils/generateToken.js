// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  let roleName = null;

  
  if (user.role && user.role.role_name) {
    roleName = user.role.role_name;
  } else if (user.role) {
    roleName = user.role;
  } else if (user.role_name) {
    roleName = user.role_name;
  }

  console.log(" Generating token - Role:", roleName);

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: roleName,
      role_id: user.role_id
    },
    process.env.JWT_SECRET || "fallback_secret_change_in_production",
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;