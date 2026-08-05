// routes/position.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const positionController = require("../controllers/position.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Allow both System Administrator and Election Manager
router.post('/', protect, authorizeRoles("system administrator", "election_manager"), positionController.createPosition);
router.get('/', protect, authorizeRoles("system administrator", "election_manager"), positionController.getPositions);
router.get('/:id', protect, authorizeRoles("system administrator", "election_manager"), positionController.getPositionById);
router.put('/:id', protect, authorizeRoles("system administrator", "election_manager"), positionController.updatePosition);
router.delete('/:id', protect, authorizeRoles("system administrator", "election_manager"), positionController.deletePosition);

module.exports = router;