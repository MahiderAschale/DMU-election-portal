// routes/voter.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const voterController = require("../controllers/voter.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Election Manager requests voters
router.post(
  "/request",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  voterController.createRequest
);
router.get(
  "/requests",
  protect,
  authorizeRoles(
    "election_manager",
    "college_dean",
    "hr",
    "system administrator"
  ),
  voterController.getRequests
);

router.get(
  "/me",
  protect,
  authorizeRoles("voter"),
  voterController.getMyVoterProfile
);

// Dean / Association / Office submits voter list
router.post(
  "/submit",
  protect,
  authorizeRoles("college_dean", "teacher_association_head", "women_association_head", "administration_office", "system administrator"),
  voterController.submitVoters
);

// Manager approves voter request
router.put(
  "/approve/:id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  voterController.approveVoter
);

// Get voters by election
router.get(
  "/election/:election_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  voterController.getElectionVoters
);

module.exports = router;
