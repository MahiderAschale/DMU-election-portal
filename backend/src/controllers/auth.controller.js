// controllers/auth.controller.js
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

module.exports = (models) => {
  const { User, Role, PendingVoter, VoterList } = models;
  const jwtSecret = process.env.JWT_SECRET || "fallback_secret_change_in_production";

  // ======================
  // LOGIN
  // ======================
  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_name']
        }
      ]
    });

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      res.status(403);
      throw new Error('Your account is inactive. Please contact the administrator.');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role ? user.role.role_name : null,
        token: generateToken(user)
      }
    });
  });

  // ======================
  // GET CURRENT USER
  // ======================
  const getMe = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_name']
        }
      ]
    });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role ? user.role.role_name : null
      }
    });
  });

  // ===============================
  // ACTIVATE ACCOUNT
  // ===============================
  const activateAccount = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password required"
      });
    }

    // Password validation (Backend)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long, include one uppercase letter, and one special character."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (token.split(".").length === 3) {
      let decoded;
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (err) {
        decoded = jwt.decode(token);
        if (!decoded?.user_id && !decoded?.id) {
          return res.status(400).json({ success: false, message: "Invalid activation link" });
        }
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          return res.status(400).json({ success: false, message: "Activation link expired" });
        }
      }

      const userId = decoded.user_id || decoded.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      await user.update({ password_hash: hashedPassword, status: "active" });

      return res.json({ success: true, message: "Account activated successfully" });
    }

    const pendingVoter = await PendingVoter.findOne({ where: { activation_token: token } });

    if (!pendingVoter) {
      return res.status(400).json({ success: false, message: "Invalid or expired activation link" });
    }

    const voterRole = await Role.findOne({
      where: { role_name: { [Op.iLike]: "voter" } }
    });

    if (!voterRole) {
      return res.status(500).json({ success: false, message: "Voter role not found" });
    }

    const [user, created] = await User.findOrCreate({
      where: { email: pendingVoter.email },
      defaults: {
        full_name: pendingVoter.full_name,
        email: pendingVoter.email,
        password_hash: hashedPassword,
        role_id: voterRole.id,
        status: "active"
      }
    });

    if (!created) {
      await user.update({
        full_name: pendingVoter.full_name,
        password_hash: hashedPassword,
        role_id: voterRole.id,
        status: "active"
      });
    }

    if (pendingVoter.election_id) {
      await VoterList.findOrCreate({
        where: { election_id: pendingVoter.election_id, email: pendingVoter.email },
        defaults: {
          election_id: pendingVoter.election_id,
          full_name: pendingVoter.full_name,
          email: pendingVoter.email,
          user_id: user.id,
          added_at: new Date()
        }
      });
    }

    await VoterList.update(
      { user_id: user.id },
      { where: { email: pendingVoter.email, user_id: null } }
    );

    await pendingVoter.update({ is_activated: true });

    return res.json({ success: true, message: "Voter account activated successfully" });
  });

  return {
    activateAccount,
    login,
    getMe
  };
};
