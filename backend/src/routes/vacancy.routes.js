// routes/vacancy.routes.js
const express = require("express");
const router = express.Router();

const models = require("../models");
const vacancyController = require("../controllers/vacancy.controller")(models);

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post('/', protect, authorizeRoles("system administrator", "election_manager"), vacancyController.createVacancy);
router.put('/:id', protect, authorizeRoles("system administrator", "election_manager"), vacancyController.updateVacancy);
router.delete('/:id', protect, authorizeRoles("system administrator", "election_manager"), vacancyController.deleteVacancy);

router.get('/', vacancyController.getVacancies);
router.get('/:id', vacancyController.getVacancyById);

module.exports = router;