// routes/application.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");

//  VERY IMPORTANT: make sure controller is a function
const applicationControllerFactory = require("../controllers/application.controller");

// PASS models properly
const applicationController = applicationControllerFactory(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ======================
// APPLY ROUTE
// ======================
router.post(
  "/",
  applicationController.createApplication
);

// ======================
// ADMIN ROUTES
// ======================
router.get(
  "/",
  protect,
  authorizeRoles("system administrator", "election_manager"),
  applicationController.getApplications
);

router.get(
  "/:id",
  protect,
  authorizeRoles("system administrator", "election_manager"),
  applicationController.getApplicationById
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("system administrator", "election_manager"),
  applicationController.updateApplicationStatus
);

module.exports = router;