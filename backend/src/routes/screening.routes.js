const express = require("express");
const router = express.Router();

const models = require("../models");
const screeningController = require("../controllers/screening.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/:applicationId",
  protect,
  authorizeRoles("system administrator", "election_manager"),
  screeningController.upsertScreeningResult
);

router.get(
  "/",
  protect,
  authorizeRoles("system administrator", "election_manager"),
  screeningController.getScreeningResults
);

router.get(
  "/:applicationId",
  protect,
  authorizeRoles("system administrator", "election_manager"),
  screeningController.getScreeningResultByApplicationId
);

module.exports = router;
