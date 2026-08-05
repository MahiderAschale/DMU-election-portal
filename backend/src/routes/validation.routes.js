const router = require("express").Router();
const models = require("../models");

const controller = require("../controllers/validation.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// fetch both lists
router.get(
  "/data",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  controller.getValidationData
);

// validate
router.post(
  "/run/:election_id",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  controller.validateVoters
);

router.post(
  "/run",
  protect,
  authorizeRoles("election_manager", "system administrator"),
  controller.validateVoters
);

// activate voter
router.get("/activate/:token", controller.activateVoter);

module.exports = router;
