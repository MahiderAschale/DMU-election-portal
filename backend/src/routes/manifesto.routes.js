// routes/manifesto.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const manifestoController = require("../controllers/manifesto.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/session",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  manifestoController.createManifestoSession
);

// Backward-compatible alias for older frontend calls.
router.post(
  "/sessions",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  manifestoController.createManifestoSession
);

router.get(
  "/my",
  protect,
  authorizeRoles("voter"),
  manifestoController.getMyManifestoSessions
);

router.get(
  "/session/:election_id",
  protect,
  authorizeRoles("candidate", "Candidate", "voter", "election_manager", "system administrator"),
  manifestoController.getManifestoSession
);

router.delete(
  "/session/:election_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  manifestoController.deleteManifestoSession
);

router.post(
  "/session/:election_id/close",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  manifestoController.closeManifestoSession
);

router.get(
  "/session/:election_id/moderator-link",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  manifestoController.getModeratorJoinLink
);

// Voter joins manifesto session
router.post(
  "/join",
  protect,
  authorizeRoles("candidate", "Candidate", "voter"),
  manifestoController.joinManifesto
);

// Voter leaves manifesto session
router.post(
  "/leave",
  protect,
  authorizeRoles("candidate", "Candidate", "voter"),
  manifestoController.leaveManifesto
);

// Check attendance (for voter)
router.get(
  "/status/:election_id",
  protect,
  authorizeRoles("candidate", "Candidate", "voter"),
  manifestoController.checkManifestoAttendance
);

// Election Manager views all sessions
router.get(
  "/all/:election_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  manifestoController.getAllManifestoSessions
);

module.exports = router;
