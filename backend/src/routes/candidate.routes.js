const express = require("express");
const router = express.Router();

const models = require("../models");
const candidateController = require("../controllers/candidate.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/approve/:application_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  candidateController.approveCandidate
);

router.get(
  "/candidate",
  protect,
  authorizeRoles("Candidate"),
  candidateController.getMyCandidate
);

router.get(
  "/me",
  protect,
  authorizeRoles("Candidate"),
  candidateController.getMyCandidate
);

router.get(
  "/voter/selected",
  protect,
  authorizeRoles("voter"),
  candidateController.getVoterSelectedCandidates
);

router.post(
  "/reject/:application_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  candidateController.rejectCandidate
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  candidateController.updateCandidateStatus
);

module.exports = router;
