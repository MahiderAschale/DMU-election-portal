// routes/admin.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const adminController = require("../controllers/admin.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// All admin routes are protected and restricted to system administrator
router.use(protect, authorizeRoles("admin"));

router.get("/reports", adminController.getSystemReports);
router.get("/managers", adminController.getElectionManagers);
router.post("/managers", adminController.createElectionManager);
router.patch("/managers/:id/status", adminController.toggleManagerStatus);

module.exports = router;
