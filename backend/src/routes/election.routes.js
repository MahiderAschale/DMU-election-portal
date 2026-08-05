// routes/election.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const electionController = require("../controllers/election.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Only System Administrator can create, update, delete elections
router.post('/', protect, authorizeRoles("system administrator", "election_manager"), electionController.createElection);

router.get('/', protect, electionController.getElections);
router.get('/:id', protect, electionController.getElectionById);

router.put('/:id', protect, authorizeRoles("system administrator", "election_manager"), electionController.updateElection);
router.delete('/:id', protect, authorizeRoles("system administrator", "election_manager"), electionController.deleteElection);

module.exports = router;