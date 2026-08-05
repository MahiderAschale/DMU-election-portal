const express = require("express");
const router = express.Router();

const models = require("../models");
const authController = require("../controllers/auth.controller")(models);

const protect = require("../middleware/authMiddleware");

// ======================
// LOGIN
// ======================
router.post("/login", authController.login);

// ======================
// GET CURRENT USER
// ======================
router.get("/me", protect, authController.getMe);

// ======================
//  ACTIVATE ACCOUNT
// ======================
router.post("/activate", authController.activateAccount);

module.exports = router;