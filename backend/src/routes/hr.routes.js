// module.exports = router;


const express = require("express");
const router = express.Router();

const models = require("../models");
const hrController = require("../controllers/hr.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/upload",
  protect,
  authorizeRoles("HR", "system administrator"),
  hrController.uploadEmployees
);

router.get(
  "/",
  protect,
  authorizeRoles("HR", "hr", "election_manager", "system administrator"),
  hrController.getAllEmployees
);

module.exports = router;
