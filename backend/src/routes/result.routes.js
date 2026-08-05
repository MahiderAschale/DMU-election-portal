// routes/result.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const resultController = require("../controllers/result.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Get all finalized winners (public)
router.get("/winners", resultController.getWinners);

// Finalize election
router.post(
  "/finalize/:election_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  resultController.finalizeElection
);

// Get finalized result (winner info)
router.get(
  "/result/:election_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  resultController.getFinalizedResult
);

// Live vote count results (manager view, updates in real-time)
router.get(
  "/live/:election_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  resultController.getLiveResults
);

module.exports = router;