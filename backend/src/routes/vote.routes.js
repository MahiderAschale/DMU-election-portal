// routes/vote.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const voteController = require("../controllers/vote.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Cast vote - Only voters (candidates who are approved)
router.post(
  "/cast",
  protect,
  authorizeRoles("candidate", "voter"),
  voteController.castVote
);

// Get my vote
router.get(
  "/my/:election_id",
  protect,
  authorizeRoles("candidate", "voter"),
  voteController.getMyVote
);

module.exports = router;