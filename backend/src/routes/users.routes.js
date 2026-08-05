// routes/users.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const userController = require("../controllers/users.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// System Administrator can create/manage users
router.post("/", protect, authorizeRoles("system administrator"), userController.createUser);

router.get("/", protect, authorizeRoles("system administrator"), userController.getUsers);
router.get("/:id", protect, authorizeRoles("system administrator"), userController.getUserById);
router.put("/:id", protect, authorizeRoles("system administrator"), userController.updateUser);
router.delete("/:id", protect, authorizeRoles("system administrator"), userController.deleteUser);

module.exports = router;