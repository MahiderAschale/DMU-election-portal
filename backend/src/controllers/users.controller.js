// controllers/users.controller.js
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

module.exports = (models) => {
  const { User, Role } = models;

  // Create User
  const createUser = asyncHandler(async (req, res) => {
    const { full_name, email, password, role_id, college_id, status, phone_number } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400);
      throw new Error('Password must be 8+ chars, 1 capital, 1 special char.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role_id,
      college_id: college_id || null,
      status: status || 'active',
      phone_number: phone_number || null
    });

    res.status(201).json({ success: true, data: user });
  });

  // Get All Users
  const getUsers = asyncHandler(async (req, res) => {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role', attributes: ['role_name'] }]
    });
    res.json({ success: true, data: users });
  });

  // Get User by ID
  const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role', attributes: ['role_name'] }]
    });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ success: true, data: user });
  });

  // Update User
  const updateUser = asyncHandler(async (req, res) => {
    const { full_name, email, role_id, college_id, status } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await user.update({
      full_name,
      email,
      role_id,
      college_id: college_id || user.college_id,
      status
    });

    res.json({ success: true, data: user });
  });

  // Delete User
  const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  });

  return {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
  };
};