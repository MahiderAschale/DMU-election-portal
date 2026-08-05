// module.exports = router;

const express = require("express");
const router = express.Router();

const models = require("../models");
const controller = require("../controllers/deanUpload.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Upload CSV data (Dean only)
router.post(
  "/upload",
  protect,
  authorizeRoles("college_dean"),
  controller.uploadDeanVoters
);

// Get uploaded data (Manager/Admin)
router.get(
  "/",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  controller.getDeanUploads
);

module.exports = router;