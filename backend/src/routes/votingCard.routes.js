const express = require("express");
const router = express.Router();

const models = require("../models");
const controller = require("../controllers/votingCard.controller")(models);
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/generate", controller.generateVotingCards);

router.get("/voter", protect, authorizeRoles("voter"), controller.getVoterSelectedCards);
router.get("/candidate", protect, authorizeRoles("candidate"), controller.getCandidateVotingCards);
router.get("/all", protect, controller.getAllVotingCards);
router.get("/:election_id", controller.getVotingCardsByElection);

module.exports = router;

